from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.inventory import Movement, Inventory
from app.schemas.movement import MovementCreate, MovementResponse

router = APIRouter(prefix="/movements", tags=["movements"])

@router.post("/", response_model=MovementResponse, status_code=201)
async def create_movement(
    movement: MovementCreate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    from app.models.warehouse import Warehouse
    from app.models.product import Product
    
    if movement.quantity <= 0:
        raise HTTPException(status_code=400, detail="Количество должно быть больше нуля")
        
    if movement.type == 'TRANSFER' and not (movement.from_warehouse_id and movement.to_warehouse_id):
        raise HTTPException(status_code=400, detail="Трансфер требует from_warehouse и to_warehouse")
        
    # ВАЛИДАЦИЯ ПРАВ СОБСТВЕННОСТИ (Defense-in-depth / IDOR fix)
    prod = await session.execute(select(Product).filter_by(id=movement.product_id, company_id=current_user.company_id))
    if not prod.scalars().first():
        raise HTTPException(status_code=403, detail="Товар не найден или доступ запрещен")

    warehouse_ids = [w_id for w_id in [movement.from_warehouse_id, movement.to_warehouse_id] if w_id]
    if warehouse_ids:
        wh_result = await session.execute(
            select(Warehouse).filter(Warehouse.id.in_(warehouse_ids), Warehouse.company_id == current_user.company_id)
        )
        if len(wh_result.scalars().all()) != len(set(warehouse_ids)):
            raise HTTPException(status_code=403, detail="Склад не найден или доступ запрещен")
        
    new_movement = Movement(**movement.model_dump(), company_id=current_user.company_id, user_id=current_user.id)
    session.add(new_movement)
    
    async def update_inventory(warehouse_id: UUID, product_id: UUID, delta_qty: int):
        result = await session.execute(
            select(Inventory)
            .filter_by(warehouse_id=warehouse_id, product_id=product_id, company_id=current_user.company_id)
            .with_for_update()
        )
        inv = result.scalars().first()
        if not inv:
            if delta_qty < 0:
                raise HTTPException(status_code=400, detail=f"Недостаточно товара на складе {warehouse_id}")
            inv = Inventory(warehouse_id=warehouse_id, product_id=product_id, quantity=0, company_id=current_user.company_id)
            session.add(inv)
        
        if inv.quantity + delta_qty < 0:
            raise HTTPException(status_code=400, detail=f"Недостаточно товара на складе {warehouse_id}")
            
        inv.quantity += delta_qty

    if movement.type == 'IN':
        if not movement.to_warehouse_id:
             raise HTTPException(status_code=400, detail="Для прихода укажите to_warehouse_id")
        await update_inventory(movement.to_warehouse_id, movement.product_id, movement.quantity)
    elif movement.type == 'OUT':
        if not movement.from_warehouse_id:
             raise HTTPException(status_code=400, detail="Для списания укажите from_warehouse_id")
        await update_inventory(movement.from_warehouse_id, movement.product_id, -movement.quantity)
    elif movement.type == 'TRANSFER':
        if movement.from_warehouse_id == movement.to_warehouse_id:
            raise HTTPException(status_code=400, detail="Нельзя переместить товары внутри одного склада")
            
        # Защита от Deadlock: всегда блокируем склады в порядке возрастания их ID
        wh_ids = sorted([movement.from_warehouse_id, movement.to_warehouse_id])
        
        # Сначала блокируем первый в списке склад, затем второй
        # Но логически мы все равно списываем с from и зачисляем на to
        if wh_ids[0] == movement.from_warehouse_id:
            await update_inventory(movement.from_warehouse_id, movement.product_id, -movement.quantity)
            await update_inventory(movement.to_warehouse_id, movement.product_id, movement.quantity)
        else:
            await update_inventory(movement.to_warehouse_id, movement.product_id, movement.quantity)
            await update_inventory(movement.from_warehouse_id, movement.product_id, -movement.quantity)
        
    await session.commit()
    await session.refresh(new_movement)
    return new_movement

@router.get("/", response_model=List[MovementResponse])
async def list_movements(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(
        select(Movement)
        .filter_by(company_id=current_user.company_id)
        .order_by(Movement.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.delete("/{movement_id}", status_code=204)
async def delete_movement(
    movement_id: UUID, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Movement).filter_by(id=movement_id, company_id=current_user.company_id))
    mov = result.scalars().first()
    if not mov:
        raise HTTPException(status_code=404, detail="Movement not found")
        
    # Rollback logic
    async def rollback_inventory(warehouse_id: UUID, product_id: UUID, prev_delta: int):
        result = await session.execute(
            select(Inventory)
            .filter_by(warehouse_id=warehouse_id, product_id=product_id, company_id=current_user.company_id)
            .with_for_update()
        )
        inv = result.scalars().first()
        if inv:
            inv.quantity -= prev_delta
            if inv.quantity < 0:
                raise HTTPException(status_code=400, detail="Удаление невозможно: остаток станет отрицательным")

    if mov.type == 'IN':
        await rollback_inventory(mov.to_warehouse_id, mov.product_id, mov.quantity)
    elif mov.type == 'OUT':
        await rollback_inventory(mov.from_warehouse_id, mov.product_id, -mov.quantity)
    elif mov.type == 'TRANSFER':
        # Та же защита от Deadlock при удалении
        wh_ids = sorted([mov.from_warehouse_id, mov.to_warehouse_id])
        if wh_ids[0] == mov.from_warehouse_id:
            await rollback_inventory(mov.from_warehouse_id, mov.product_id, -mov.quantity)
            await rollback_inventory(mov.to_warehouse_id, mov.product_id, mov.quantity)
        else:
            await rollback_inventory(mov.to_warehouse_id, mov.product_id, mov.quantity)
            await rollback_inventory(mov.from_warehouse_id, mov.product_id, -mov.quantity)
        
    await session.delete(mov)
    await session.commit()

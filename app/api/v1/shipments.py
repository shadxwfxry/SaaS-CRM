from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID
import time
import secrets

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.shipment import Shipment
from app.models.inventory import Inventory, Movement
from app.schemas.shipment import ShipmentCreate, ShipmentResponse, ShipmentStatusUpdate

router = APIRouter(prefix="/shipments", tags=["shipments"])

@router.get("/", response_model=List[ShipmentResponse])
async def list_shipments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(
        select(Shipment)
        .filter_by(company_id=current_user.company_id)
        .options(selectinload(Shipment.product))
        .order_by(Shipment.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/", response_model=ShipmentResponse, status_code=201)
async def create_shipment(
    shipment: ShipmentCreate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    if shipment.quantity <= 0:
         raise HTTPException(status_code=400, detail="Количество должно быть больше нуля")
         
    # Strict inventory deduct block
    if not shipment.warehouse_id:
        raise HTTPException(status_code=400, detail="Укажите склад (warehouse_id) для отгрузки")
        
    result = await session.execute(
        select(Inventory)
        .filter_by(warehouse_id=shipment.warehouse_id, product_id=shipment.product_id, company_id=current_user.company_id)
        .with_for_update()
    )
    inv = result.scalars().first()
    if not inv or inv.quantity < shipment.quantity:
        raise HTTPException(status_code=400, detail="Недостаточно товара на указанном складе")
    inv.quantity -= shipment.quantity

    if not shipment.order_number:
        timestamp = int(time.time())
        random_hash = secrets.token_hex(2).upper()
        shipment.order_number = f"ORD-{timestamp}-{random_hash}"
    
    new_shipment = Shipment(**shipment.model_dump(), company_id=current_user.company_id)
    session.add(new_shipment)
    
    # ФИКС: Оставляем след в истории перемещений (Movement)
    mov = Movement(
        type='OUT',
        product_id=shipment.product_id,
        from_warehouse_id=shipment.warehouse_id,
        quantity=shipment.quantity,
        company_id=current_user.company_id,
        user_id=current_user.id
    )
    session.add(mov)

    await session.commit()
    await session.refresh(new_shipment)
    return new_shipment

# DELETE /shipments/{id} удален по архитектурным соображениям. 
# Используйте PATCH /status для отмены (CANCELLED) или возврата (RETURNED).

@router.patch("/{shipment_id}/status", response_model=ShipmentResponse)
async def update_shipment_status(
    shipment_id: UUID, 
    status_update: ShipmentStatusUpdate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Shipment).filter_by(id=shipment_id, company_id=current_user.company_id))
    shipment = result.scalars().first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    if shipment.status == 'RETURNED':
        raise HTTPException(status_code=400, detail="Нельзя изменить статус уже возвращенного товара")
        
    if status_update.status == 'RETURNED' and shipment.status != 'RETURNED':
        result_inv = await session.execute(
            select(Inventory)
            .filter_by(warehouse_id=shipment.warehouse_id, product_id=shipment.product_id, company_id=current_user.company_id)
            .with_for_update()
        )
        inv = result_inv.scalars().first()
        if inv:
            inv.quantity += shipment.quantity
        else:
            new_inv = Inventory(warehouse_id=shipment.warehouse_id, product_id=shipment.product_id, quantity=shipment.quantity, company_id=current_user.company_id)
            session.add(new_inv)
        
        # ФИКС: Оставляем след в истории (Возврат)
        mov = Movement(
            type='IN',
            product_id=shipment.product_id,
            to_warehouse_id=shipment.warehouse_id,
            quantity=shipment.quantity,
            company_id=current_user.company_id,
            user_id=current_user.id
        )
        session.add(mov)
            
    shipment.status = status_update.status
    await session.commit()
    await session.refresh(shipment)
    return shipment

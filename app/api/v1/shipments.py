from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.shipment import Shipment
from app.models.inventory import Inventory
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
         
    # Smart inventory deduct block
    if shipment.warehouse_id:
        result = await session.execute(
            select(Inventory)
            .filter_by(warehouse_id=shipment.warehouse_id, product_id=shipment.product_id, company_id=current_user.company_id)
            .with_for_update()
        )
        inv = result.scalars().first()
        if not inv or inv.quantity < shipment.quantity:
            raise HTTPException(status_code=400, detail="Недостаточно товара на указанном складе")
        inv.quantity -= shipment.quantity
    else:
        result = await session.execute(
            select(Inventory)
            .filter_by(product_id=shipment.product_id, company_id=current_user.company_id)
            .order_by(Inventory.quantity.desc())
            .with_for_update()
        )
        inventories = result.scalars().all()
        
        if not inventories or inventories[0].quantity < shipment.quantity:
            raise HTTPException(status_code=400, detail="Жоден склад не має достатньої кількості товару для цієї відгрузки")
            
        target_inv = inventories[0]
        target_inv.quantity -= shipment.quantity
        shipment.warehouse_id = target_inv.warehouse_id

    if not shipment.order_number:
        count = (await session.execute(select(func.count(Shipment.id)).filter_by(company_id=current_user.company_id))).scalar() or 0
        shipment.order_number = f"ORD-{1000 + count + 1}"
    
    new_shipment = Shipment(**shipment.model_dump(), company_id=current_user.company_id)
    session.add(new_shipment)
    await session.commit()
    await session.refresh(new_shipment)
    return new_shipment

@router.delete("/{shipment_id}", status_code=204)
async def delete_shipment(
    shipment_id: UUID, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Shipment).filter_by(id=shipment_id, company_id=current_user.company_id))
    shipment = result.scalars().first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
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
        
    await session.delete(shipment)
    await session.commit()

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
            
    shipment.status = status_update.status
    await session.commit()
    await session.refresh(shipment)
    return shipment

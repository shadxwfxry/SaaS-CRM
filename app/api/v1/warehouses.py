from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.warehouse import Warehouse
from app.models.inventory import Inventory, Movement
from app.schemas.warehouse import WarehouseCreate, WarehouseResponse

router = APIRouter(prefix="/warehouses", tags=["warehouses"])

@router.get("/", response_model=List[WarehouseResponse])
async def list_warehouses(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(
        select(Warehouse)
        .filter_by(company_id=current_user.company_id, is_active=True)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/", response_model=WarehouseResponse, status_code=201)
async def create_warehouse(
    warehouse: WarehouseCreate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    new_warehouse = Warehouse(**warehouse.model_dump(), company_id=current_user.company_id)
    session.add(new_warehouse)
    await session.commit()
    await session.refresh(new_warehouse)
    return new_warehouse

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
async def get_warehouse(
    warehouse_id: UUID, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Warehouse).filter_by(id=warehouse_id, company_id=current_user.company_id))
    warehouse = result.scalars().first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return warehouse

@router.put("/{warehouse_id}", response_model=WarehouseResponse)
async def update_warehouse(
    warehouse_id: UUID, 
    data: WarehouseCreate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Warehouse).filter_by(id=warehouse_id, company_id=current_user.company_id))
    warehouse = result.scalars().first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    warehouse.name = data.name
    warehouse.address = getattr(data, 'address', warehouse.address)
    
    await session.commit()
    await session.refresh(warehouse)
    return warehouse

@router.delete("/{warehouse_id}", status_code=204)
async def delete_warehouse(
    warehouse_id: UUID, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Warehouse).filter_by(id=warehouse_id, company_id=current_user.company_id, is_active=True))
    warehouse = result.scalars().first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
        
    warehouse.is_active = False
    await session.commit()

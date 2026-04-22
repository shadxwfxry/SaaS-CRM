from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.inventory import Movement, Inventory
from app.schemas.product import ProductCreate, ProductResponse

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=List[ProductResponse])
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(
        select(Product)
        .filter_by(company_id=current_user.company_id)
        .options(selectinload(Product.inventory).selectinload(Inventory.warehouse))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(
    product: ProductCreate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    from app.models.warehouse import Warehouse
    
    if product.initial_warehouse_id:
        wh_result = await session.execute(select(Warehouse).filter_by(id=product.initial_warehouse_id, company_id=current_user.company_id))
        if not wh_result.scalars().first():
            raise HTTPException(status_code=403, detail="Склад не найден или доступ запрещен")

    product_data = product.model_dump(exclude={'initial_warehouse_id', 'initial_quantity'})
    new_product = Product(**product_data, company_id=current_user.company_id)
    session.add(new_product)
    try:
        await session.commit()
        await session.refresh(new_product)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Товар с таким артикулом (SKU) уже существует")

    if product.initial_warehouse_id and product.initial_quantity > 0:
        inv = Inventory(
            warehouse_id=product.initial_warehouse_id, 
            product_id=new_product.id, 
            quantity=product.initial_quantity,
            company_id=current_user.company_id
        )
        session.add(inv)
        
        mov = Movement(
            type='IN', 
            product_id=new_product.id, 
            to_warehouse_id=product.initial_warehouse_id, 
            quantity=product.initial_quantity,
            company_id=current_user.company_id
        )
        session.add(mov)
        await session.commit()

    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID, 
    data: ProductCreate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Product).filter_by(id=product_id, company_id=current_user.company_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.sku = data.sku
    product.title = data.title
    product.price = data.price
    product.category_id = getattr(data, 'category_id', product.category_id)
    
    try:
        await session.commit()
        await session.refresh(product)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Товар с таким артикулом (SKU) уже существует")
    return product

@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Product).filter_by(id=product_id, company_id=current_user.company_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    result_mov = await session.execute(select(Movement).filter_by(product_id=product_id, company_id=current_user.company_id))
    for mov in result_mov.scalars().all():
        await session.delete(mov)
        
    result_inv = await session.execute(select(Inventory).filter_by(product_id=product_id, company_id=current_user.company_id))
    for inv in result_inv.scalars().all():
        await session.delete(inv)
        
    await session.delete(product)
    await session.commit()

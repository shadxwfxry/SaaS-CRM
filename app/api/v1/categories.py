from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.core.database import get_async_session
from app.core.security import get_current_user
from app.models.user import User
from app.models.product import Category, Product
from app.schemas.category import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
async def list_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(
        select(Category)
        .filter_by(company_id=current_user.company_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

@router.post("/", response_model=CategoryResponse, status_code=201)
async def create_category(
    category: CategoryCreate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    new_category = Category(**category.model_dump(), company_id=current_user.company_id)
    session.add(new_category)
    try:
        await session.commit()
        await session.refresh(new_category)
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Категория с таким именем уже существует")
    return new_category

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: UUID, 
    data: CategoryCreate, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Category).filter_by(id=category_id, company_id=current_user.company_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    category.name = data.name
    try:
        await session.commit()
        await session.refresh(category)
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail="Категория с таким именем уже существует")
    return category

@router.delete("/{category_id}", status_code=204)
async def delete_category(
    category_id: UUID, 
    session: AsyncSession = Depends(get_async_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(Category).filter_by(id=category_id, company_id=current_user.company_id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    result_prod = await session.execute(select(Product).filter_by(category_id=category_id, company_id=current_user.company_id))
    for p in result_prod.scalars().all():
        p.category_id = None
        
    await session.delete(category)
    await session.commit()

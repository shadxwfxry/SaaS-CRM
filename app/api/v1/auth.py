from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_async_session
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.models.company import Company
from app.schemas.auth import UserCreate, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, session: AsyncSession = Depends(get_async_session)):
    # Check if user exists
    result = await session.execute(select(User).filter_by(email=user_in.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Користувач з таким email вже існує")
        
    # Create company
    company = Company(name=user_in.company_name)
    session.add(company)
    await session.commit()
    await session.refresh(company)
    
    # Create user
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        company_id=company.id
    )
    session.add(user)
    await session.commit()
    
    return {"msg": "Реєстрація успішна. Ви можете увійти."}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).filter_by(email=form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильний email або пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

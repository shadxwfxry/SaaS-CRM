from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_async_session
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.core.limiter import limiter
from app.models.user import User, PasswordResetToken
from app.models.company import Company
from app.schemas.auth import UserCreate, PasswordResetRequest, PasswordResetConfirm
import uuid
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user_in: UserCreate, session: AsyncSession = Depends(get_async_session)):
    # Rate Limiting done by slowapi in main.py but needs the decorator.
    # To use limiter cleanly, we usually import it.
    # We will use dependency injection for limiter later or let the decorator handle it.
    
    # Check if user exists
    result = await session.execute(select(User).filter_by(email=user_in.email))
    if result.scalars().first():
        # Prevent enumeration: return success even if user exists
        return {"msg": "Реєстрація успішна. Ви можете увійти."}
        
    # Create or find company
    result_company = await session.execute(select(Company).filter_by(name=user_in.company_name))
    if result_company.scalars().first():
        raise HTTPException(status_code=400, detail="Компанія з такою назвою вже існує. Зверніться до адміністратора для запрошення.")
    
    company = Company(name=user_in.company_name)
    session.add(company)
    await session.flush() # Используем flush вместо commit, чтобы получить id
    
    # Create user
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        company_id=company.id
    )
    session.add(user)
    await session.commit() # Один коммит для всего
    
    return {"msg": "Реєстрація успішна. Ви можете увійти."}

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).filter_by(email=form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильний email або пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    # Set HttpOnly Cookie
    response.set_cookie(
        key="access_token",
        value=access_token, # Просто токен, без Bearer
        httponly=True,
        samesite="lax", # Lax более совместим при разработке через прокси
        secure=False, # Set to True in HTTPS production
        max_age=3600
    )
    return {"msg": "Успішний вхід"}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "company_id": str(current_user.company_id)
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"msg": "Вийшли з системи"}

@router.post("/password-reset-request")
@limiter.limit("3/hour")
async def password_reset_request(request: Request, data: PasswordResetRequest, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(User).filter_by(email=data.email))
    user = result.scalars().first()
    
    # Даже если пользователя нет, возвращаем успех (Security best practice)
    if not user:
        return {"msg": "Якщо email існує, посилання для скидання буде надіслано."}
        
    # Создаем токен
    token = str(uuid.uuid4())
    reset_token = PasswordResetToken(user_id=user.id, token=token)
    session.add(reset_token)
    await session.commit()
    
    # Имитация отправки Email
    reset_link = f"http://localhost:5173/reset-password?token={token}"
    print(f"\n[EMAIL MOCK] To: {user.email}")
    print(f"[EMAIL MOCK] Subject: Password Reset Request")
    print(f"[EMAIL MOCK] Link: {reset_link}\n")
    
    return {"msg": "Посилання для скидання пароля надіслано на вашу пошту."}

@router.post("/password-reset-confirm")
async def password_reset_confirm(data: PasswordResetConfirm, session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(
        select(PasswordResetToken)
        .filter_by(token=data.token, is_used=False)
        .where(PasswordResetToken.expires_at > datetime.utcnow())
    )
    reset_token = result.scalars().first()
    
    if not reset_token:
        raise HTTPException(status_code=400, detail="Токен недійсний або термін дії вичерпано")
        
    user = await session.get(User, reset_token.user_id)
    if not user:
         raise HTTPException(status_code=400, detail="Користувача не знайдено")
         
    user.password_hash = get_password_hash(data.new_password)
    reset_token.is_used = True
    
    await session.commit()
    return {"msg": "Пароль успішно змінено. Тепер ви можете увійти."}

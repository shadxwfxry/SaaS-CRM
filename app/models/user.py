import uuid
from datetime import datetime, timedelta
from sqlalchemy import String, Boolean, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Uuid as UUID
from .base import Base

class Role(Base):
    __tablename__ = 'roles'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    permissions: Mapped[dict] = mapped_column(JSON, default={})
    
    users: Mapped[list["User"]] = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = 'users'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    role_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("roles.id"))
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"), index=True)

    role: Mapped["Role"] = relationship("Role", back_populates="users")
    company: Mapped["Company"] = relationship("Company", back_populates="users")
    reset_tokens: Mapped[list["PasswordResetToken"]] = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

class PasswordResetToken(Base):
    __tablename__ = 'password_reset_tokens'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), index=True)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(default=lambda: datetime.utcnow() + timedelta(hours=1))
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False)
    
    user: Mapped["User"] = relationship("User", back_populates="reset_tokens")

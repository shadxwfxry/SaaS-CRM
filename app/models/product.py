import uuid
from decimal import Decimal
from sqlalchemy import String, Float, ForeignKey, UniqueConstraint, Boolean, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Uuid as UUID
from .base import Base

class Category(Base):
    __tablename__ = 'categories'
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), index=True)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = 'products'
    __table_args__ = (
        UniqueConstraint('company_id', 'sku', name='uix_company_sku'),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku: Mapped[str] = mapped_column(String(100), index=True)
    title: Mapped[str] = mapped_column(String(255))
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    category_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("categories.id"))
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"), index=True)
    image_url: Mapped[str | None] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    category: Mapped["Category"] = relationship("Category", back_populates="products")
    inventory: Mapped[list["Inventory"]] = relationship("Inventory")

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Uuid as UUID
from sqlalchemy.sql import func
from .base import Base

class Shipment(Base):
    """
    Модель отправления (Отгрузки / Сделки).
    Хранит информацию о том, какой товар, в каком количестве и куда был отправлен.
    Связана с физическими продуктами и складами.
    """
    __tablename__ = 'shipments'

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_name: Mapped[str] = mapped_column(String(255)) # ФИО получателя
    recipient_address: Mapped[str] = mapped_column(String(500)) # Физический адрес доставки
    delivery_method: Mapped[str] = mapped_column(String(100)) # Способ доставки логистической компанией
    
    order_number: Mapped[str] = mapped_column(String(100), nullable=True) # Трек-номер или номер заказа для идентификации
    payment_method: Mapped[str] = mapped_column(String(100), nullable=True, default='cash') # Способ оплаты (карта, наличные и т.д.)
    
    status: Mapped[str] = mapped_column(String(50), default="SHIPPED") # Статус (SHIPPED, DELIVERED, RETURNED)
    
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), index=True)
    warehouse_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("warehouses.id"), index=True)
    company_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("companies.id"), index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    product: Mapped["Product"] = relationship("Product")
    warehouse: Mapped["Warehouse"] = relationship("Warehouse")

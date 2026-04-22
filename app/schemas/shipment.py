from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class ShipmentCreate(BaseModel):
    recipient_name: str
    recipient_address: str
    delivery_method: str
    order_number: Optional[str] = None
    payment_method: Optional[str] = 'card'
    product_id: UUID
    warehouse_id: Optional[UUID] = None
    quantity: int

class ProductSimple(BaseModel):
    title: str
    sku: str
    model_config = ConfigDict(from_attributes=True)

class ShipmentStatusUpdate(BaseModel):
    status: str

class ShipmentResponse(ShipmentCreate):
    id: UUID
    status: str
    created_at: datetime
    product: Optional[ProductSimple] = None
    
    model_config = ConfigDict(from_attributes=True)

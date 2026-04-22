from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

class ProductBase(BaseModel):
    sku: str
    title: str
    price: Decimal = Decimal("0.00")
    image_url: str | None = None
    category_id: UUID | None = None

class ProductCreate(ProductBase):
    initial_warehouse_id: UUID | None = None
    initial_quantity: int = 0

class WarehouseSimple(BaseModel):
    name: str

    model_config = ConfigDict(from_attributes=True)

class InventoryInfo(BaseModel):
    quantity: int
    warehouse: Optional[WarehouseSimple] = None

    model_config = ConfigDict(from_attributes=True)

class ProductResponse(ProductBase):
    id: UUID
    inventory: List[InventoryInfo] = []

    model_config = ConfigDict(from_attributes=True)

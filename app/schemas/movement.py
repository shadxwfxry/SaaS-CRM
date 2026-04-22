from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Literal

class MovementCreate(BaseModel):
    product_id: UUID
    type: Literal['IN', 'OUT', 'TRANSFER']
    quantity: int
    from_warehouse_id: UUID | None = None
    to_warehouse_id: UUID | None = None

class MovementResponse(BaseModel):
    id: UUID
    product_id: UUID
    type: str
    quantity: int
    from_warehouse_id: UUID | None
    to_warehouse_id: UUID | None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

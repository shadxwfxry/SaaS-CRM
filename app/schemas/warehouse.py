from pydantic import BaseModel, ConfigDict
from uuid import UUID

class WarehouseBase(BaseModel):
    name: str
    address: str | None = None
    is_active: bool = True

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseResponse(WarehouseBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

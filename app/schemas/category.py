from pydantic import BaseModel, ConfigDict
from uuid import UUID

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)

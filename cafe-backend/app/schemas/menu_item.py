from datetime import datetime

from pydantic import BaseModel


class MenuItemCreate(BaseModel):
    name: str
    display_name: str
    description: str | None = None
    price: float
    available_quantity: int = 0
    category_id: int
    is_available: bool = True


class MenuItemUpdate(BaseModel):
    name: str | None = None
    display_name: str | None = None
    description: str | None = None
    price: float | None = None
    available_quantity: int | None = None
    category_id: int | None = None
    is_available: bool | None = None


class MenuItemResponse(BaseModel):
    id: int
    name: str
    display_name: str
    description: str | None
    price: float
    available_quantity: int
    category_id: int
    is_available: bool
    created_at: datetime | None
    updated_at: datetime | None

    class Config:
        from_attributes = True

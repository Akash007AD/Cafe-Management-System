from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_kitchen_user
from app.database import get_db
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.models.user import User
from app.schemas.menu_item import (
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate
)

router = APIRouter(
    prefix="/menu",
    tags=["Menu"]
)


@router.post(
    "",
    response_model=MenuItemResponse,
    status_code=status.HTTP_201_CREATED
)
def create_menu_item(
    request: MenuItemCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_kitchen_user)
):
    category = db.query(Category).filter(
        Category.id == request.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    existing = db.query(MenuItem).filter(
        MenuItem.name == request.name
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Menu item already exists"
        )

    item = MenuItem(
        name=request.name,
        display_name=request.display_name,
        description=request.description,
        price=request.price,
        available_quantity=request.available_quantity,
        category_id=request.category_id,
        is_available=request.is_available
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


@router.get(
    "",
    response_model=list[MenuItemResponse]
)
def get_menu(
    db: Session = Depends(get_db),
    _: User = Depends(require_kitchen_user)
):
    return db.query(MenuItem).all()


@router.get(
    "/{menu_item_id}",
    response_model=MenuItemResponse
)
def get_menu_item(
    menu_item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_kitchen_user)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == menu_item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    return item


@router.put(
    "/{menu_item_id}",
    response_model=MenuItemResponse
)
def update_menu_item(
    menu_item_id: int,
    request: MenuItemUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_kitchen_user)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == menu_item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    if request.category_id is not None:
        category = db.query(Category).filter(
            Category.id == request.category_id
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

        item.category_id = request.category_id

    if request.name is not None:
        item.name = request.name

    if request.display_name is not None:
        item.display_name = request.display_name

    if request.description is not None:
        item.description = request.description

    if request.price is not None:
        item.price = request.price

    if request.available_quantity is not None:
        item.available_quantity = request.available_quantity

    if request.is_available is not None:
        item.is_available = request.is_available

    db.commit()
    db.refresh(item)

    return item


@router.delete(
    "/{menu_item_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_menu_item(
    menu_item_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_kitchen_user)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == menu_item_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Menu item not found"
        )

    db.delete(item)
    db.commit()

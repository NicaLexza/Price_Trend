from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..crud import get_food_items
from ..security import get_api_key


router = APIRouter(
    prefix="/foods",
    dependencies=[Depends(get_api_key)],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def list_foods(db: Session = Depends(get_db)):
    results = get_food_items(db)
    # Format response to include category information
    return [
        {
            "food_id": food.food_id,
            "food_name": food.food_name,
            "unit": food.unit,
            "category_id": food.category_id,
            "category_name": category.category_name if category else None,
            "category_description": category.description if category else None,
        }
        for food, category in results
    ]

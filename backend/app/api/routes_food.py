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
    return get_food_items(db)

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..crud import get_price_trends
from ..security import get_api_key


router = APIRouter(
    prefix="/trends",
    dependencies=[Depends(get_api_key)],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_trends(
    food_id: int,
    region_id: int,
    start_year: int = Query(...),
    end_year: int = Query(...),
    db: Session = Depends(get_db),
):
    results = get_price_trends(
        db, food_id, region_id, start_year, end_year
    )

    return [
        {
            "year": time.year,
            "month": time.month,
            "price": obs.price_value,
        }
        for obs, time in results
    ]

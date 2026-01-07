from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..crud import get_regions
from ..security import get_api_key


router = APIRouter(
    prefix="/regions",
    dependencies=[Depends(get_api_key)],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def list_regions(db: Session = Depends(get_db)):
    return get_regions(db)

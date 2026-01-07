from sqlalchemy.orm import Session
from .models import (
    FoodItem,
    Region,
    PriceObservation,
    TimePeriod,
    AiInsight,
    ForecastResult,
)
from datetime import datetime


def get_food_items(db: Session):
    return db.query(FoodItem).all()


def get_regions(db: Session):
    return db.query(Region).all()


def get_food_by_id(db: Session, food_id: int):
    return db.query(FoodItem).filter(FoodItem.food_id == food_id).first()


def get_region_by_id(db: Session, region_id: int):
    return db.query(Region).filter(Region.region_id == region_id).first()


def get_price_trends(
    db: Session,
    food_id: int,
    region_id: int,
    start_year: int,
    end_year: int
):
    return (
        db.query(PriceObservation, TimePeriod)
        .join(TimePeriod)
        .filter(
            PriceObservation.food_id == food_id,
            PriceObservation.region_id == region_id,
            TimePeriod.year.between(start_year, end_year),
        )
        .order_by(TimePeriod.year, TimePeriod.month)
        .all()
    )


def create_ai_insight(db: Session, food_id: int, region_id: int, time_id, insight_text: str):
    ai = AiInsight(
        food_id=food_id,
        region_id=region_id,
        time_id=time_id,
        insight_text=insight_text,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(ai)
    db.commit()
    db.refresh(ai)
    return ai


def create_forecast_result(db: Session, food_id: int, region_id: int, time_id, forecast_value: float, model_used: str = "ARIMA", confidence_level: float = None):
    fr = ForecastResult(
        food_id=food_id,
        region_id=region_id,
        time_id=time_id,
        forecast_value=forecast_value,
        model_used=model_used,
        confidence_level=confidence_level,
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(fr)
    db.commit()
    db.refresh(fr)
    return fr


def get_ai_insights(db: Session, food_id: int = None, region_id: int = None):
    q = db.query(AiInsight)
    if food_id:
        q = q.filter(AiInsight.food_id == food_id)
    if region_id:
        q = q.filter(AiInsight.region_id == region_id)
    return q.order_by(AiInsight.created_at.desc()).all()


def get_forecast_results(db: Session, food_id: int = None, region_id: int = None):
    q = db.query(ForecastResult)
    if food_id:
        q = q.filter(ForecastResult.food_id == food_id)
    if region_id:
        q = q.filter(ForecastResult.region_id == region_id)
    return q.order_by(ForecastResult.created_at.desc()).all()

from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import (
    FoodItem,
    FoodCategory,
    Region,
    PriceObservation,
    TimePeriod,
    AiInsight,
    ForecastResult,
)
from datetime import datetime


def get_food_items(db: Session):
    return (
        db.query(FoodItem, FoodCategory)
        .outerjoin(FoodCategory, FoodItem.category_id == FoodCategory.category_id)
        .order_by(
            func.coalesce(FoodCategory.category_name, 'ZZZ'),
            FoodItem.food_name
        )
        .all()
    )


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
    """
    Get price trends for a specific food item and region within a year range.
    Returns results ordered chronologically by year and month.
    """
    results = (
        db.query(PriceObservation, TimePeriod)
        .join(TimePeriod, PriceObservation.time_id == TimePeriod.time_id)
        .filter(
            PriceObservation.food_id == food_id,
            PriceObservation.region_id == region_id,
            TimePeriod.year >= start_year,
            TimePeriod.year <= end_year,
        )
        .order_by(TimePeriod.year, TimePeriod.month)
        .all()
    )
    
    # Debug: Log the query results to verify filtering
    if results:
        first_obs, first_time = results[0]
        last_obs, last_time = results[-1]
        print(f"DEBUG: get_price_trends - food_id={food_id}, region_id={region_id}, "
              f"found {len(results)} records from {first_time.year}-{first_time.month} "
              f"to {last_time.year}-{last_time.month}, "
              f"first_price={first_obs.price_value}, last_price={last_obs.price_value}")
    
    return results


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

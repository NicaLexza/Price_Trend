from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class FoodCategory(Base):
    __tablename__ = "food_categories"
    category_id = Column(Integer, primary_key=True)
    category_name = Column(String(100))


class FoodItem(Base):
    __tablename__ = "food_items"
    food_id = Column(Integer, primary_key=True)
    food_name = Column(String(150))
    unit = Column(String(50))
    category_id = Column(Integer, ForeignKey("food_categories.category_id"))


class Region(Base):
    __tablename__ = "regions"
    region_id = Column(Integer, primary_key=True)
    region_code = Column(String(10))
    region_name = Column(String(150))


class TimePeriod(Base):
    __tablename__ = "time_periods"
    time_id = Column(Integer, primary_key=True)
    year = Column(Integer)
    month = Column(Integer, nullable=True)


class PriceObservation(Base):
    __tablename__ = "price_observations"
    price_id = Column(Integer, primary_key=True)
    food_id = Column(Integer, ForeignKey("food_items.food_id"))
    region_id = Column(Integer, ForeignKey("regions.region_id"))
    time_id = Column(Integer, ForeignKey("time_periods.time_id"))
    price_value = Column(Float)


class AiInsight(Base):
    __tablename__ = "ai_insights"
    insight_id = Column(Integer, primary_key=True)
    food_id = Column(Integer, ForeignKey("food_items.food_id"), nullable=True)
    region_id = Column(Integer, ForeignKey("regions.region_id"), nullable=True)
    time_id = Column(Integer, ForeignKey("time_periods.time_id"), nullable=True)
    insight_text = Column(String(1000))
    created_at = Column(String(50))


class ForecastResult(Base):
    __tablename__ = "forecast_results"
    forecast_id = Column(Integer, primary_key=True)
    food_id = Column(Integer, ForeignKey("food_items.food_id"), nullable=True)
    region_id = Column(Integer, ForeignKey("regions.region_id"), nullable=True)
    time_id = Column(Integer, ForeignKey("time_periods.time_id"), nullable=True)
    forecast_value = Column(Float)
    model_used = Column(String(100), nullable=True)
    confidence_level = Column(Float, nullable=True)
    created_at = Column(String(50))

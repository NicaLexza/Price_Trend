from sqlalchemy import Column, Integer, String, Float, ForeignKey, BigInteger, Boolean, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from .database import Base
import enum

class FoodCategory(Base):
    __tablename__ = "food_categories"
    category_id = Column(Integer, primary_key=True)
    category_name = Column(String(100))
    description = Column(Text, nullable=True)


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
    period_type = Column(String(20), nullable=True)  # 'monthly' or 'yearly'


class DataSource(Base):
    __tablename__ = "data_sources"
    source_id = Column(Integer, primary_key=True)
    source_name = Column(String(100))
    source_type = Column(String(20), nullable=True)  # 'government', 'academic', 'public'
    description = Column(Text, nullable=True)
    created_at = Column(String(50), nullable=True)


class Dataset(Base):
    __tablename__ = "datasets"
    dataset_id = Column(Integer, primary_key=True)
    source_id = Column(Integer, ForeignKey("data_sources.source_id"), nullable=True)
    dataset_name = Column(String(150), nullable=True)
    file_type = Column(String(10), nullable=True)  # 'csv', 'excel'
    frequency = Column(String(10), nullable=True)  # 'monthly', 'yearly'
    upload_date = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)


class PriceObservation(Base):
    __tablename__ = "price_observations"
    price_id = Column(BigInteger, primary_key=True)
    dataset_id = Column(Integer, ForeignKey("datasets.dataset_id"), nullable=True)
    food_id = Column(Integer, ForeignKey("food_items.food_id"))
    region_id = Column(Integer, ForeignKey("regions.region_id"))
    time_id = Column(Integer, ForeignKey("time_periods.time_id"))
    price_value = Column(Float)
    currency = Column(String(10), default="PHP")
    is_cleaned = Column(Boolean, default=False)


class AiInsight(Base):
    __tablename__ = "ai_insights"
    insight_id = Column(BigInteger, primary_key=True)
    food_id = Column(Integer, ForeignKey("food_items.food_id"), nullable=True)
    region_id = Column(Integer, ForeignKey("regions.region_id"), nullable=True)
    time_id = Column(Integer, ForeignKey("time_periods.time_id"), nullable=True)
    insight_text = Column(Text, nullable=True)
    created_at = Column(String(50), nullable=True)


class ForecastResult(Base):
    __tablename__ = "forecast_results"
    forecast_id = Column(BigInteger, primary_key=True)
    food_id = Column(Integer, ForeignKey("food_items.food_id"), nullable=True)
    region_id = Column(Integer, ForeignKey("regions.region_id"), nullable=True)
    time_id = Column(Integer, ForeignKey("time_periods.time_id"), nullable=True)
    forecast_value = Column(Float, nullable=True)
    model_used = Column(String(100), nullable=True)
    confidence_level = Column(Float, nullable=True)
    created_at = Column(String(50), nullable=True)

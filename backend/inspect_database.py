"""
Script to inspect and display current data in the FOODINSIGHTPH database.
"""
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.database import DATABASE_URL, engine, SessionLocal
from app.models import (
    FoodCategory,
    FoodItem,
    Region,
    TimePeriod,
    PriceObservation,
    AiInsight,
    ForecastResult
)

def print_section(title):
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_table_data(session, model, table_name):
    """Print all data from a table."""
    print_section(f"Table: {table_name}")
    try:
        records = session.query(model).all()
        if not records:
            print(f"  No data found in {table_name}")
            return
        
        # Get column names from the model
        columns = [col.key for col in model.__table__.columns]
        
        # Print header
        header = " | ".join(f"{col:20}" for col in columns)
        print(f"  {header}")
        print("  " + "-" * len(header))
        
        # Print rows
        for record in records:
            row = " | ".join(f"{str(getattr(record, col)):20}" for col in columns)
            print(f"  {row}")
        
        print(f"\n  Total records: {len(records)}")
    except Exception as e:
        print(f"  Error querying {table_name}: {e}")

def get_table_counts(session):
    """Get record counts for all tables."""
    print_section("Database Summary - Record Counts")
    tables = [
        ("food_categories", FoodCategory),
        ("food_items", FoodItem),
        ("regions", Region),
        ("time_periods", TimePeriod),
        ("price_observations", PriceObservation),
        ("ai_insights", AiInsight),
        ("forecast_results", ForecastResult),
    ]
    
    for table_name, model in tables:
        try:
            count = session.query(model).count()
            print(f"  {table_name:25} : {count:>6} records")
        except Exception as e:
            print(f"  {table_name:25} : ERROR - {e}")

def get_sample_price_data(session):
    """Get a sample of price observations with joined data."""
    print_section("Sample Price Observations (with joined data)")
    try:
        results = (
            session.query(
                PriceObservation,
                FoodItem,
                Region,
                TimePeriod
            )
            .join(FoodItem, PriceObservation.food_id == FoodItem.food_id)
            .join(Region, PriceObservation.region_id == Region.region_id)
            .join(TimePeriod, PriceObservation.time_id == TimePeriod.time_id)
            .limit(10)
            .all()
        )
        
        if not results:
            print("  No price observations found")
            return
        
        print(f"  {'Food Name':<30} | {'Region':<20} | {'Year':<6} | {'Month':<6} | {'Price':<10}")
        print("  " + "-" * 95)
        
        for po, food, region, time in results:
            month_str = str(time.month) if time.month else "N/A"
            print(f"  {food.food_name:<30} | {region.region_name:<20} | {time.year:<6} | {month_str:<6} | {po.price_value:<10.2f}")
        
        total = session.query(PriceObservation).count()
        print(f"\n  Showing 10 of {total} total price observations")
    except Exception as e:
        print(f"  Error querying price observations: {e}")

def main():
    """Main function to inspect database."""
    print("\n" + "=" * 80)
    print("  FOODINSIGHTPH Database Inspection")
    print("=" * 80)
    print(f"\n  Database URL: {DATABASE_URL}")
    
    # Test connection
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT DATABASE()"))
            db_name = result.scalar()
            print(f"  Connected to database: {db_name}")
    except Exception as e:
        print(f"\n  ERROR: Could not connect to database!")
        print(f"  {e}")
        print("\n  Please check:")
        print("  1. MySQL server is running")
        print("  2. Database 'foodinsightph' exists")
        print("  3. DATABASE_URL is correct (check environment variables)")
        return
    
    session = SessionLocal()
    
    try:
        # Show summary counts
        get_table_counts(session)
        
        # Show detailed data for each table
        print_table_data(session, FoodCategory, "food_categories")
        print_table_data(session, FoodItem, "food_items")
        print_table_data(session, Region, "regions")
        print_table_data(session, TimePeriod, "time_periods")
        print_table_data(session, PriceObservation, "price_observations")
        print_table_data(session, AiInsight, "ai_insights")
        print_table_data(session, ForecastResult, "forecast_results")
        
        # Show sample joined price data
        get_sample_price_data(session)
        
    except Exception as e:
        print(f"\n  ERROR: {e}")
    finally:
        session.close()
    
    print("\n" + "=" * 80)
    print("  Inspection Complete")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    main()



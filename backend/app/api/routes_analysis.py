from fastapi import APIRouter, Depends, Query

from ..database import SessionLocal
from ..crud import (
    get_price_trends,
    get_food_by_id,
    get_region_by_id,
    create_ai_insight,
    create_forecast_result,
    get_ai_insights,
    get_forecast_results,
)
from ..ai.pipeline import run_ai_pipeline
from ..security import get_api_key


router = APIRouter(
    prefix="/analysis",
    dependencies=[Depends(get_api_key)],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _compute_price_stats(results, prices):
    """Compute simple, user-friendly stats from ordered price results."""
    # results: list of (PriceObservation, TimePeriod)
    first_obs, first_time = results[0]
    last_obs, last_time = results[-1]

    start_price = float(first_obs.price_value)
    end_price = float(last_obs.price_value)

    absolute_change = end_price - start_price
    percent_change = (absolute_change / start_price * 100) if start_price else None

    num_points = len(prices)
    avg_monthly_change = (
        absolute_change / (num_points - 1) if num_points > 1 else 0.0
    )

    min_price = float(min(prices))
    max_price = float(max(prices))
    
    # Find when min/max occurred
    min_idx = prices.index(min_price)
    max_idx = prices.index(max_price)
    min_obs, min_time = results[min_idx]
    max_obs, max_time = results[max_idx]
    
    min_label = f"{min_time.year}-{str(min_time.month).zfill(2) if min_time.month else '01'}"
    max_label = f"{max_time.year}-{str(max_time.month).zfill(2) if max_time.month else '01'}"

    start_label = f"{first_time.year}-{str(first_time.month).zfill(2) if first_time.month else '01'}"
    end_label = f"{last_time.year}-{str(last_time.month).zfill(2) if last_time.month else '01'}"

    # Year-on-year inflation: compare latest month to same month last year
    yoy_inflation = None
    yoy_label = None
    if last_time.month and len(results) >= 13:  # Need at least 13 months for YoY
        # Find same month last year
        target_year = last_time.year - 1
        target_month = last_time.month
        for obs, time in results:
            if time.year == target_year and time.month == target_month:
                yoy_price = float(obs.price_value)
                yoy_change = end_price - yoy_price
                yoy_inflation = (yoy_change / yoy_price * 100) if yoy_price else None
                yoy_label = f"{target_year}-{str(target_month).zfill(2)}"
                break
    
    # Price position indicator: where is current price relative to min/max?
    price_range = max_price - min_price
    if price_range > 0:
        position_ratio = (end_price - min_price) / price_range
        if position_ratio >= 0.8:
            price_position = "near_record_high"
            price_position_label = "Near record high"
        elif position_ratio >= 0.6:
            price_position = "high"
            price_position_label = "Above average"
        elif position_ratio >= 0.4:
            price_position = "average"
            price_position_label = "Around typical level"
        elif position_ratio >= 0.2:
            price_position = "low"
            price_position_label = "Below average"
        else:
            price_position = "near_record_low"
            price_position_label = "Near record low"
    else:
        price_position = "stable"
        price_position_label = "Stable"

    # Simple spike count based on month-to-month relative change
    spike_threshold = 0.2  # 20%
    spike_count = 0
    for i in range(1, len(prices)):
        prev = prices[i - 1] if prices[i - 1] != 0 else 1e-6
        rel_change = abs((prices[i] - prices[i - 1]) / prev)
        if rel_change > spike_threshold:
            spike_count += 1

    return {
        "start_price": round(start_price, 2),
        "end_price": round(end_price, 2),
        "absolute_change": round(absolute_change, 2),
        "percent_change": round(percent_change, 2) if percent_change is not None else None,
        "avg_monthly_change": round(avg_monthly_change, 2),
        "min_price": round(min_price, 2),
        "max_price": round(max_price, 2),
        "min_price_label": min_label,
        "max_price_label": max_label,
        "period_start_label": start_label,
        "period_end_label": end_label,
        "num_points": num_points,
        "spike_count": spike_count,
        "yoy_inflation": round(yoy_inflation, 2) if yoy_inflation is not None else None,
        "yoy_label": yoy_label,
        "price_position": price_position,
        "price_position_label": price_position_label,
    }


def _build_user_summary(food_name: str, region_name: str, stats: dict, trend: dict):
    """Generate a short, human-friendly sentence about prices."""
    direction = trend.get("trend")
    slope = trend.get("slope")

    start_price = stats["start_price"]
    end_price = stats["end_price"]
    percent_change = stats["percent_change"]
    start_label = stats["period_start_label"]
    end_label = stats["period_end_label"]
    spike_count = stats["spike_count"]

    parts = []

    parts.append(
        f"The price of {food_name} in {region_name} moved from "
        f"PHP {start_price:.2f} ({start_label}) to PHP {end_price:.2f} ({end_label})."
    )

    if percent_change is not None:
        if percent_change > 0:
            parts.append(f"That is an increase of about {percent_change:.1f}%.")
        elif percent_change < 0:
            parts.append(f"That is a decrease of about {abs(percent_change):.1f}%.")
        else:
            parts.append("Overall, prices are almost unchanged over this period.")

    if direction:
        if slope is not None:
            parts.append(
                f"The overall trend is {direction}, changing by about "
                f"PHP {abs(slope):.2f} per time period on average."
            )
        else:
            parts.append(f"The overall trend is {direction}.")

    if spike_count > 0:
        parts.append(f"{spike_count} significant month-to-month spike(s) were detected.")
    else:
        parts.append("No major sudden price spikes were detected.")

    return " ".join(parts)


@router.get("/")
def analyze(
    food_id: int,
    region_id: int,
    start_year: int = Query(...),
    end_year: int = Query(...),
    persist: bool = True,
    db=Depends(get_db),
):
    results = get_price_trends(db, food_id, region_id, start_year, end_year)
    prices = [float(obs.price_value) for obs, _ in results]

    if not prices:
        return {"error": "No price data for given parameters."}

    food = get_food_by_id(db, food_id)
    region = get_region_by_id(db, region_id)

    food_name = food.food_name if food else str(food_id)
    region_name = region.region_name if region else str(region_id)

    ai_result = run_ai_pipeline(
        food_name,
        region_name,
        prices,
    )

    stats = _compute_price_stats(results, prices)
    summary = _build_user_summary(food_name, region_name, stats, ai_result.get("trend", {}))

    full_result = {
        **ai_result,
        "stats": stats,
        "summary": summary,
    }

    # Persist insight (use the more user-friendly summary)
    if persist:
        insight_text = full_result.get("summary") or full_result.get("insight")
        create_ai_insight(db, food_id, region_id, None, insight_text)

        # Persist forecasts if any
        for fv in ai_result.get("forecast", []):
            create_forecast_result(db, food_id, region_id, None, fv, model_used="ARIMA")

    return full_result


@router.get("/saved")
def list_saved_insights(
    food_id: int | None = None,
    region_id: int | None = None,
    db=Depends(get_db),
):
    insights = get_ai_insights(db, food_id, region_id)
    return [
        {
            "insight": i.insight_text,
            "created_at": i.created_at,
            "food_id": i.food_id,
            "region_id": i.region_id,
        }
        for i in insights
    ]


@router.get("/forecasts")
def list_saved_forecasts(
    food_id: int | None = None,
    region_id: int | None = None,
    db=Depends(get_db),
):
    forecasts = get_forecast_results(db, food_id, region_id)
    return [
        {
            "forecast_value": f.forecast_value,
            "created_at": f.created_at,
            "food_id": f.food_id,
            "region_id": f.region_id,
        }
        for f in forecasts
    ]


@router.get("/compare")
def compare(
    food_id_1: int = Query(...),
    region_id_1: int = Query(...),
    food_id_2: int = Query(...),
    region_id_2: int = Query(...),
    start_year: int = Query(...),
    end_year: int = Query(...),
    db=Depends(get_db),
):
    """Compare two food/region combinations side-by-side."""
    # Get data for first combination
    results_1 = get_price_trends(db, food_id_1, region_id_1, start_year, end_year)
    prices_1 = [float(obs.price_value) for obs, _ in results_1]
    
    # Get data for second combination
    results_2 = get_price_trends(db, food_id_2, region_id_2, start_year, end_year)
    prices_2 = [float(obs.price_value) for obs, _ in results_2]
    
    if not prices_1 or not prices_2:
        return {"error": "Insufficient data for comparison."}
    
    food_1 = get_food_by_id(db, food_id_1)
    region_1 = get_region_by_id(db, region_id_1)
    food_2 = get_food_by_id(db, food_id_2)
    region_2 = get_region_by_id(db, region_id_2)
    
    food_name_1 = food_1.food_name if food_1 else str(food_id_1)
    region_name_1 = region_1.region_name if region_1 else str(region_id_1)
    food_name_2 = food_2.food_name if food_2 else str(food_id_2)
    region_name_2 = region_2.region_name if region_2 else str(region_id_2)
    
    stats_1 = _compute_price_stats(results_1, prices_1)
    stats_2 = _compute_price_stats(results_2, prices_2)
    
    return {
        "item_1": {
            "food_id": food_id_1,
            "food_name": food_name_1,
            "region_id": region_id_1,
            "region_name": region_name_1,
            "stats": stats_1,
        },
        "item_2": {
            "food_id": food_id_2,
            "food_name": food_name_2,
            "region_id": region_id_2,
            "region_name": region_name_2,
            "stats": stats_2,
        },
    }

from .trend_analysis import detect_trend
from .seasonality import detect_seasonality
from .forecasting import forecast_prices
from .insight_generator import generate_insight


def detect_spikes(prices, threshold=0.2):
    if not prices or len(prices) < 2:
        return False

    diffs = []
    for i in range(1, len(prices)):
        prev = prices[i - 1] if prices[i - 1] != 0 else 1e-6
        diffs.append(abs((prices[i] - prices[i - 1]) / prev))

    spikes = [d for d in diffs if d > threshold]
    return True if spikes else False


def run_ai_pipeline(food, region, prices):
    time_index = list(range(len(prices)))

    trend = detect_trend(time_index, prices)
    seasonality = detect_seasonality(prices)
    try:
        forecast = forecast_prices(prices)
    except Exception:
        forecast = []

    spikes = detect_spikes(prices)

    insight = generate_insight(
        food, region, trend, seasonality, spikes, forecast
    )

    return {
        "trend": trend,
        "forecast": forecast,
        "spikes": spikes,
        "insight": insight
    }

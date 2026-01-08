import numpy as np
from sklearn.linear_model import LinearRegression

def detect_trend(time_index, prices):
    """
    Detect overall price trend using linear regression.
    Uses actual time indices for accurate slope calculation.
    """
    if not prices or len(prices) < 2:
        return {
            "slope": 0.0,
            "trend": "stable"
        }
    
    X = np.array(time_index).reshape(-1, 1)
    y = np.array(prices)

    model = LinearRegression()
    model.fit(X, y)

    slope = model.coef_[0]
    
    # Calculate percentage slope (relative to average price) for better comparison
    avg_price = np.mean(prices)
    relative_slope = (slope / avg_price * 100) if avg_price > 0 else 0.0

    if slope > 0.001:  # Small threshold to avoid floating point issues
        trend = "increasing"
    elif slope < -0.001:
        trend = "decreasing"
    else:
        trend = "stable"

    return {
        "slope": round(slope, 4),
        "relative_slope_percent": round(relative_slope, 4),  # Percentage slope for comparison
        "trend": trend
    }

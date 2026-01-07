import numpy as np
from sklearn.linear_model import LinearRegression

def detect_trend(time_index, prices):
    """
    Detect overall price trend using linear regression.
    """
    X = np.array(time_index).reshape(-1, 1)
    y = np.array(prices)

    model = LinearRegression()
    model.fit(X, y)

    slope = model.coef_[0]

    if slope > 0:
        trend = "increasing"
    elif slope < 0:
        trend = "decreasing"
    else:
        trend = "stable"

    return {
        "slope": round(slope, 4),
        "trend": trend
    }

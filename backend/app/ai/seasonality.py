from statsmodels.tsa.seasonal import seasonal_decompose

def detect_seasonality(prices, period=12):
    """
    Detect seasonality in monthly food price data.
    """
    decomposition = seasonal_decompose(prices, model="additive", period=period)

    seasonal_strength = decomposition.seasonal.std()

    if seasonal_strength > 0.5:
        return "seasonal pattern detected"
    else:
        return "no strong seasonality"

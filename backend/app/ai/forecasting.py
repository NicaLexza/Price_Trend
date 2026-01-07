from statsmodels.tsa.arima.model import ARIMA

def forecast_prices(prices, steps=6):
    """
    Forecast future food prices using ARIMA.
    """
    model = ARIMA(prices, order=(1, 1, 1))
    fitted_model = model.fit()

    forecast = fitted_model.forecast(steps=steps)

    return [round(value, 2) for value in forecast]

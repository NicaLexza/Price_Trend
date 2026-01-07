def generate_insight(food, region, trend, seasonality, spikes, forecast):
    insight = f"The price trend of {food} in {region} is {trend['trend']}."

    if seasonality:
        insight += f" A {seasonality} is observed."

    if spikes:
        insight += f" Sudden price changes were detected in recent periods."

    if forecast:
        insight += (
            f" Prices are expected to continue at around "
            f"{round(sum(forecast)/len(forecast), 2)} PHP in the next months."
        )

    return insight

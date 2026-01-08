import React, { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { Typography, Box } from "@mui/material";

function TrendLineChart({ data, forecast = [] }) {
  // Build a more detailed x-axis label like "2021-01", "2021-02", ...
  const formattedData = useMemo(() => {
    const historical = (data || []).map((d) => ({
      ...d,
      label:
        d.month != null
          ? `${d.year}-${String(d.month).padStart(2, "0")}`
          : String(d.year),
      price: d.price,
      forecast: null, // No forecast for historical data
    }));

    // If we have forecast data and historical data, extend the chart
    if (forecast && forecast.length > 0 && historical.length > 0) {
      const lastDataPoint = historical[historical.length - 1];
      const lastYear = lastDataPoint.year;
      const lastMonth = lastDataPoint.month || 12;

      // Generate future month labels for forecast
      const forecastData = forecast.map((forecastPrice, index) => {
        let futureMonth = lastMonth + index + 1;
        let futureYear = lastYear;

        // Handle year rollover
        while (futureMonth > 12) {
          futureMonth -= 12;
          futureYear += 1;
        }

        return {
          year: futureYear,
          month: futureMonth,
          label: `${futureYear}-${String(futureMonth).padStart(2, "0")}`,
          price: null, // No historical price for forecast
          forecast: forecastPrice,
        };
      });

      // Combine historical and forecast data
      return [...historical, ...forecastData];
    }

    return historical;
  }, [data, forecast]);

  // Calculate domain to include both historical and forecast
  const allPrices = useMemo(() => {
    const prices = formattedData
      .map((d) => [d.price, d.forecast])
      .flat()
      .filter((p) => p != null);
    return prices.length > 0 ? prices : [0];
  }, [formattedData]);

  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const padding = (maxPrice - minPrice) * 0.1 || 1;

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Inflation Trend {forecast && forecast.length > 0 && "(with Forecast)"}
      </Typography>
      <Box sx={{ width: "100%", height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              domain={[minPrice - padding, maxPrice + padding]}
            />
            <Tooltip />
            <Legend />
            {/* Historical data line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#1976d2"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              name="Historical Price"
              connectNulls={false}
            />
            {/* Forecast line */}
            {forecast && forecast.length > 0 && (
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#ff9800"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: "#ff9800" }}
                activeDot={{ r: 5 }}
                name="Forecast"
                connectNulls={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
}

export default TrendLineChart;

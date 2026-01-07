import React, { useState, useEffect } from "react";
import { 
  Grid, 
  Paper, 
  Button, 
  Tooltip, 
  IconButton, 
  Typography, 
  Box,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  TextField
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import Filters from "./Filters";
import TrendLineChart from "./TrendLineChart";
import { fetchTrends, fetchAnalysis, fetchComparison } from "../api/api";

function Dashboard({ foods, regions }) {
  const [filters, setFilters] = useState({
    food: "",
    region: "",
    startYear: 2018,
    endYear: 2023,
  });

  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  
  // Comparison state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonFilters, setComparisonFilters] = useState({
    food_1: "",
    region_1: "",
    food_2: "",
    region_2: "",
  });
  const [comparisonData, setComparisonData] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState(null);

  useEffect(() => {
  if (filters.food && filters.region) {
      setTrendLoading(true);
      setTrendError(null);

    fetchTrends({
      food_id: filters.food,
      region_id: filters.region,
      start_year: filters.startYear,
        end_year: filters.endYear,
      })
        .then((res) => {
          setTrendData(res.data);
        })
        .catch((err) => {
          setTrendError(err.message || "Failed to load trend data");
          setTrendData([]);
        })
        .finally(() => {
          setTrendLoading(false);
        });
    } else {
      setTrendData([]);
  }
}, [filters]);

useEffect(() => {
  if (filters.food && filters.region && trendData.length > 0) {
      setAnalysisLoading(true);
      setAnalysisError(null);

    fetchAnalysis({
      food_id: filters.food,
      region_id: filters.region,
      start_year: filters.startYear,
      end_year: filters.endYear,
        persist: false,
      })
        .then((res) => setAnalysis(res.data))
        .catch((err) =>
          setAnalysisError(err.message || "Failed to load analysis")
        )
        .finally(() => setAnalysisLoading(false));

  } else {
    setAnalysis(null);
  }
}, [filters, trendData]);

  return (
    <Box sx={{ maxWidth: "1400px", margin: "0 auto", p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1, color: "#1976d2" }}>
          Food Price Analysis Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Track inflation trends, analyze price changes, and forecast future prices for essential food items
        </Typography>
    <Filters
      foods={foods}
      regions={regions}
      filters={filters}
      setFilters={setFilters}
    />
      </Box>

    <Grid container spacing={3}>
        {/* Chart Section */}
      <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              {trendLoading && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              {trendError && (
                <Alert severity="error" sx={{ mb: 2 }}>{trendError}</Alert>
              )}
              {!trendLoading && !trendError && (
                <TrendLineChart 
                  data={trendData} 
                  forecast={analysis?.forecast || []} 
                />
              )}
            </CardContent>
          </Card>
      </Grid>

        {/* Key Metrics Section */}
        {analysis?.stats && (
      <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Key Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: "100%", bgcolor: "#f5f5f5" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Current Price
                          </Typography>
                          <Tooltip title="The latest price in the selected time period">
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>
                          PHP {analysis.stats.end_price?.toFixed(2) || "-"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {analysis.stats.period_end_label || "-"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: "100%", bgcolor: "#f5f5f5" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Change Over Period
                          </Typography>
                          <Tooltip title="Total price change from the first month to the last month in your selected period">
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {(analysis.stats.absolute_change || 0) >= 0 ? (
                            <TrendingUpIcon sx={{ color: "#d32f2f" }} />
                          ) : (
                            <TrendingDownIcon sx={{ color: "#2e7d32" }} />
                          )}
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              fontWeight: 700,
                              color: (analysis.stats.absolute_change || 0) >= 0 ? "#d32f2f" : "#2e7d32"
                            }}
                          >
                            {(analysis.stats.absolute_change || 0) >= 0 ? "+" : ""}
                            {analysis.stats.absolute_change?.toFixed(2) || "-"} PHP
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {analysis.stats.percent_change != null
                            ? `${(analysis.stats.percent_change || 0) >= 0 ? "+" : ""}${analysis.stats.percent_change.toFixed(1)}%`
                            : "-"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: "100%", bgcolor: "#f5f5f5" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Avg Monthly Change
                          </Typography>
                          <Tooltip title="Average increase or decrease per month during the selected period">
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {(analysis.stats.avg_monthly_change || 0) >= 0 ? "+" : ""}
                          {analysis.stats.avg_monthly_change?.toFixed(2) || "-"} PHP/month
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined" sx={{ height: "100%", bgcolor: "#f5f5f5" }}>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Price Spikes
                          </Typography>
                          <Tooltip title="Number of months with sudden price jumps (more than 20% increase compared to previous month)">
                            <IconButton size="small">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {analysis.stats.spike_count || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(analysis.stats.spike_count || 0) === 0 ? "No major spikes" : "spike(s) detected"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Additional Insights Section */}
        {analysis?.stats && (
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                  Additional Insights
                </Typography>
                <Grid container spacing={2}>
                  {analysis.stats.yoy_inflation != null && (
                    <Grid item xs={12} md={4}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          height: "100%",
                          bgcolor: analysis.stats.yoy_inflation > 5 ? "#ffebee" : 
                                   analysis.stats.yoy_inflation > 0 ? "#fff3e0" : "#e8f5e9",
                          border: `2px solid ${analysis.stats.yoy_inflation > 5 ? "#c62828" : 
                                                      analysis.stats.yoy_inflation > 0 ? "#e65100" : "#2e7d32"}`
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Year-on-Year Inflation
                            </Typography>
                            <Tooltip title="Compares the latest month's price to the same month last year. This shows how much prices have changed over the past 12 months.">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              fontWeight: 700,
                              color: analysis.stats.yoy_inflation > 5 ? "#c62828" : 
                                     analysis.stats.yoy_inflation > 0 ? "#e65100" : "#2e7d32"
                            }}
                          >
                            {analysis.stats.yoy_inflation >= 0 ? "+" : ""}
                            {analysis.stats.yoy_inflation.toFixed(1)}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            vs {analysis.stats.yoy_label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} md={analysis.stats.yoy_inflation != null ? 4 : 6}>
                    <Card variant="outlined" sx={{ height: "100%" }}>
                      <CardContent>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                          Price Range
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Lowest</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              PHP {analysis.stats.min_price?.toFixed(2) || "-"} ({analysis.stats.min_price_label || "-"})
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Highest</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              PHP {analysis.stats.max_price?.toFixed(2) || "-"} ({analysis.stats.max_price_label || "-"})
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={analysis.stats.yoy_inflation != null ? 4 : 6}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        height: "100%",
                        bgcolor: analysis.stats.price_position === "near_record_high" ? "#ffebee" : 
                                 analysis.stats.price_position === "high" ? "#fff3e0" : 
                                 analysis.stats.price_position === "low" ? "#e3f2fd" : 
                                 analysis.stats.price_position === "near_record_low" ? "#e8f5e9" : "#f5f5f5"
                      }}
                    >
                      <CardContent>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Current Position
                        </Typography>
                        <Chip 
                          label={analysis.stats.price_position_label}
                          color={
                            analysis.stats.price_position === "near_record_high" ? "error" :
                            analysis.stats.price_position === "high" ? "warning" :
                            analysis.stats.price_position === "low" ? "info" :
                            analysis.stats.price_position === "near_record_low" ? "success" : "default"
                          }
                          sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Relative to period range
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Summary Section */}
        {analysis && !analysis.error && (
          <Grid item xs={12}>
            <Card elevation={2} sx={{ borderRadius: 2, bgcolor: "#f8f9fa" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Summary
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: "1.05rem" }}>
                  {analysis.summary || analysis.insight}
                </Typography>
                {analysis.forecast && analysis.forecast.length > 0 && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Forecast (Next {analysis.forecast.length} months):
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {analysis.forecast.map((price, idx) => (
                        <Chip 
                          key={idx}
                          label={`PHP ${price.toFixed(2)}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Loading/Error States */}
        {analysisLoading && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading analysis...
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {analysisError && (
          <Grid item xs={12}>
            <Alert severity="error">{analysisError}</Alert>
          </Grid>
        )}

        {!analysis && !analysisLoading && !analysisError && filters.food && filters.region && (
          <Grid item xs={12}>
            <Alert severity="info">
              Select filters and view the trend to generate analysis.
            </Alert>
          </Grid>
        )}

        {/* Comparison Section */}
        <Grid item xs={12}>
          <Card elevation={2} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CompareArrowsIcon sx={{ color: "#1976d2" }} />
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Compare Products or Regions
                  </Typography>
                </Box>
                <Button 
                  variant={comparisonMode ? "contained" : "outlined"}
                  startIcon={<CompareArrowsIcon />}
                  onClick={() => setComparisonMode(!comparisonMode)}
                >
                  {comparisonMode ? "Hide Comparison" : "Show Comparison"}
                </Button>
              </Box>
            
            {comparisonMode && (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ bgcolor: "#f8f9fa" }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Item 1
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <TextField
                            select
                            label="Food Item"
                            fullWidth
                            value={comparisonFilters.food_1}
                            onChange={(e) => setComparisonFilters({ ...comparisonFilters, food_1: e.target.value })}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="">Select Food</option>
                            {foods.map((f) => (
                              <option key={f.food_id} value={f.food_id}>
                                {f.food_name}
                              </option>
                            ))}
                          </TextField>
                          <TextField
                            select
                            label="Region"
                            fullWidth
                            value={comparisonFilters.region_1}
                            onChange={(e) => setComparisonFilters({ ...comparisonFilters, region_1: e.target.value })}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="">Select Region</option>
                            {regions.map((r) => (
                              <option key={r.region_id} value={r.region_id}>
                                {r.region_name}
                              </option>
                            ))}
                          </TextField>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ bgcolor: "#f8f9fa" }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Item 2
                        </Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <TextField
                            select
                            label="Food Item"
                            fullWidth
                            value={comparisonFilters.food_2}
                            onChange={(e) => setComparisonFilters({ ...comparisonFilters, food_2: e.target.value })}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="">Select Food</option>
                            {foods.map((f) => (
                              <option key={f.food_id} value={f.food_id}>
                                {f.food_name}
                              </option>
                            ))}
                          </TextField>
                          <TextField
                            select
                            label="Region"
                            fullWidth
                            value={comparisonFilters.region_2}
                            onChange={(e) => setComparisonFilters({ ...comparisonFilters, region_2: e.target.value })}
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="">Select Region</option>
                            {regions.map((r) => (
                              <option key={r.region_id} value={r.region_id}>
                                {r.region_name}
                              </option>
                            ))}
                          </TextField>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CompareArrowsIcon />}
                    onClick={() => {
                      if (comparisonFilters.food_1 && comparisonFilters.region_1 && 
                          comparisonFilters.food_2 && comparisonFilters.region_2) {
                        setComparisonLoading(true);
                        setComparisonError(null);
                        fetchComparison({
                          food_id_1: comparisonFilters.food_1,
                          region_id_1: comparisonFilters.region_1,
                          food_id_2: comparisonFilters.food_2,
                          region_id_2: comparisonFilters.region_2,
                          start_year: filters.startYear,
                          end_year: filters.endYear,
                        })
                          .then((res) => setComparisonData(res.data))
                          .catch((err) => setComparisonError(err.message || "Failed to load comparison"))
                          .finally(() => setComparisonLoading(false));
                      }
                    }}
                    disabled={!comparisonFilters.food_1 || !comparisonFilters.region_1 || 
                             !comparisonFilters.food_2 || !comparisonFilters.region_2}
                  >
                    Compare
                  </Button>
                </Box>
                
                {comparisonLoading && (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
                {comparisonError && (
                  <Alert severity="error" sx={{ mb: 2 }}>{comparisonError}</Alert>
                )}
                
                {comparisonData && !comparisonError && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ border: "2px solid #1976d2", height: "100%" }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#1976d2" }}>
                            {comparisonData.item_1.food_name} - {comparisonData.item_1.region_name}
                          </Typography>
                          {comparisonData.item_1.stats && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Current Price</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  PHP {comparisonData.item_1.stats.end_price.toFixed(2)}
                                </Typography>
                              </Box>
                              <Divider />
                              <Box>
                                <Typography variant="caption" color="text.secondary">Change</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {comparisonData.item_1.stats.absolute_change >= 0 ? "+" : ""}
                                  {comparisonData.item_1.stats.absolute_change.toFixed(2)} PHP ({comparisonData.item_1.stats.percent_change?.toFixed(1)}%)
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Avg Monthly Change</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {comparisonData.item_1.stats.avg_monthly_change >= 0 ? "+" : ""}
                                  {comparisonData.item_1.stats.avg_monthly_change.toFixed(2)} PHP/month
                                </Typography>
                              </Box>
                              {comparisonData.item_1.stats.yoy_inflation != null && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">YoY Inflation</Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {comparisonData.item_1.stats.yoy_inflation >= 0 ? "+" : ""}
                                    {comparisonData.item_1.stats.yoy_inflation.toFixed(1)}%
                                  </Typography>
                                </Box>
                              )}
                              <Box>
                                <Typography variant="caption" color="text.secondary">Price Range</Typography>
                                <Typography variant="body2">
                                  PHP {comparisonData.item_1.stats.min_price.toFixed(2)} - PHP {comparisonData.item_1.stats.max_price.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ border: "2px solid #d32f2f", height: "100%" }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "#d32f2f" }}>
                            {comparisonData.item_2.food_name} - {comparisonData.item_2.region_name}
                          </Typography>
                          {comparisonData.item_2.stats && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Current Price</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  PHP {comparisonData.item_2.stats.end_price.toFixed(2)}
                                </Typography>
                              </Box>
                              <Divider />
                              <Box>
                                <Typography variant="caption" color="text.secondary">Change</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {comparisonData.item_2.stats.absolute_change >= 0 ? "+" : ""}
                                  {comparisonData.item_2.stats.absolute_change.toFixed(2)} PHP ({comparisonData.item_2.stats.percent_change?.toFixed(1)}%)
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Avg Monthly Change</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {comparisonData.item_2.stats.avg_monthly_change >= 0 ? "+" : ""}
                                  {comparisonData.item_2.stats.avg_monthly_change.toFixed(2)} PHP/month
                                </Typography>
                              </Box>
                              {comparisonData.item_2.stats.yoy_inflation != null && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">YoY Inflation</Typography>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {comparisonData.item_2.stats.yoy_inflation >= 0 ? "+" : ""}
                                    {comparisonData.item_2.stats.yoy_inflation.toFixed(1)}%
                                  </Typography>
                                </Box>
                              )}
                              <Box>
                                <Typography variant="caption" color="text.secondary">Price Range</Typography>
                                <Typography variant="body2">
                                  PHP {comparisonData.item_2.stats.min_price.toFixed(2)} - PHP {comparisonData.item_2.stats.max_price.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
      </Grid>
    </Box>
);
}

export default Dashboard;

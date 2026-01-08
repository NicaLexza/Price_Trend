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

        {/* Chart Section */}
      <Card elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
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

        {/* Key Metrics Section */}
        {analysis?.stats && (
        <Card elevation={2} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: "#1a237e" }}>
                  Key Metrics
                </Typography>
            <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: "100%", 
                    bgcolor: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
                    background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
                    display: "flex", 
                    flexDirection: "column",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Current Price
                          </Typography>
                      <Tooltip title="The latest price in the selected time period" arrow>
                        <IconButton size="small" sx={{ color: "#1976d2" }}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1976d2", mb: 0.5, lineHeight: 1.2 }}>
                          PHP {analysis.stats.end_price?.toFixed(2) || "-"}
                        </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", mt: 1 }}>
                          {analysis.stats.period_end_label || "-"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: "100%", 
                    bgcolor: (analysis.stats.absolute_change || 0) >= 0 ? "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)" : "linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)",
                    background: (analysis.stats.absolute_change || 0) >= 0 ? "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)" : "linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)",
                    display: "flex", 
                    flexDirection: "column",
                    borderRadius: 2,
                    border: `1px solid ${(analysis.stats.absolute_change || 0) >= 0 ? "#ffcdd2" : "#c8e6c9"}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Change Over Period
                          </Typography>
                      <Tooltip title="Total price change from the first month to the last month in your selected period" arrow>
                        <IconButton size="small" sx={{ color: (analysis.stats.absolute_change || 0) >= 0 ? "#d32f2f" : "#2e7d32" }}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                          {(analysis.stats.absolute_change || 0) >= 0 ? (
                        <TrendingUpIcon sx={{ color: "#d32f2f", fontSize: 32 }} />
                      ) : (
                        <TrendingDownIcon sx={{ color: "#2e7d32", fontSize: 32 }} />
                      )}
                      <Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 700,
                            color: (analysis.stats.absolute_change || 0) >= 0 ? "#d32f2f" : "#2e7d32",
                            lineHeight: 1.2
                          }}
                        >
                          {(analysis.stats.absolute_change || 0) >= 0 ? "+" : ""}
                          {analysis.stats.absolute_change?.toFixed(2) || "-"} PHP
                        </Typography>
                        {analysis.stats.percent_change != null && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              color: (analysis.stats.percent_change || 0) >= 0 ? "#d32f2f" : "#2e7d32",
                              mt: 0.5
                            }}
                          >
                            {(analysis.stats.percent_change || 0) >= 0 ? "+" : ""}
                            {analysis.stats.percent_change.toFixed(1)}%
                          </Typography>
                        )}
                      </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: "100%", 
                    bgcolor: "linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)",
                    background: "linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)",
                    display: "flex", 
                    flexDirection: "column",
                    borderRadius: 2,
                    border: "1px solid #ffe0b2",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Avg Monthly Change
                          </Typography>
                      <Tooltip title="Average increase or decrease per month during the selected period" arrow>
                        <IconButton size="small" sx={{ color: "#f57c00" }}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#f57c00", mb: 0.5, lineHeight: 1.2 }}>
                          {(analysis.stats.avg_monthly_change || 0) >= 0 ? "+" : ""}
                      {analysis.stats.avg_monthly_change?.toFixed(2) || "-"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", mt: 1 }}>
                      PHP per month
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: "100%", 
                    bgcolor: (analysis.stats.spike_count || 0) > 0 ? "linear-gradient(135deg, #fce4ec 0%, #ffffff 100%)" : "linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%)",
                    background: (analysis.stats.spike_count || 0) > 0 ? "linear-gradient(135deg, #fce4ec 0%, #ffffff 100%)" : "linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%)",
                    display: "flex", 
                    flexDirection: "column",
                    borderRadius: 2,
                    border: `1px solid ${(analysis.stats.spike_count || 0) > 0 ? "#f8bbd0" : "#dcedc8"}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Price Spikes
                          </Typography>
                      <Tooltip title="Number of months with sudden price jumps (more than 20% increase compared to previous month)" arrow>
                        <IconButton size="small" sx={{ color: (analysis.stats.spike_count || 0) > 0 ? "#c2185b" : "#558b2f" }}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: (analysis.stats.spike_count || 0) > 0 ? "#c2185b" : "#558b2f", mb: 0.5, lineHeight: 1.2 }}>
                          {analysis.stats.spike_count || 0}
                        </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", mt: 1 }}>
                      {(analysis.stats.spike_count || 0) === 0 ? "No major spikes detected" : "spike(s) detected"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
        )}

        {/* Additional Insights Section */}
        {analysis?.stats && (
        <Card elevation={2} sx={{ borderRadius: 3, mb: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: "#1a237e" }}>
                  Additional Insights
                </Typography>
            <Grid container spacing={3} sx={{ width: "100%" }}>
              <Grid item xs={12} md={4} sx={{ display: "flex", width: "100%" }}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          height: "100%",
                      width: "100%",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 2,
                      bgcolor: analysis.stats.yoy_inflation != null && analysis.stats.yoy_inflation > 5 ? "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)" : 
                               analysis.stats.yoy_inflation != null && analysis.stats.yoy_inflation > 0 ? "linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)" : 
                               analysis.stats.yoy_inflation != null ? "linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)" : "#fafafa",
                      background: analysis.stats.yoy_inflation != null && analysis.stats.yoy_inflation > 5 ? "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)" : 
                                  analysis.stats.yoy_inflation != null && analysis.stats.yoy_inflation > 0 ? "linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)" : 
                                  analysis.stats.yoy_inflation != null ? "linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)" : "#fafafa",
                      border: `2px solid ${analysis.stats.yoy_inflation != null && analysis.stats.yoy_inflation > 5 ? "#c62828" : 
                                              analysis.stats.yoy_inflation != null && analysis.stats.yoy_inflation > 0 ? "#e65100" : 
                                              analysis.stats.yoy_inflation != null ? "#2e7d32" : "#e0e0e0"}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-2px)",
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Year-on-Year Inflation
                        </Typography>
                        <Tooltip title="Compares the latest month's price to the same month last year. This shows how much prices have changed over the past 12 months." arrow>
                          <IconButton size="small" sx={{ color: analysis.stats.yoy_inflation != null && analysis.stats.yoy_inflation > 5 ? "#c62828" : analysis.stats.yoy_inflation != null && analysis.stats.yoy_inflation > 0 ? "#e65100" : "#2e7d32" }}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {analysis.stats.yoy_inflation != null ? (
                        <>
                          <Typography 
                            variant="h3" 
                            sx={{ 
                              fontWeight: 800,
                              color: analysis.stats.yoy_inflation > 5 ? "#c62828" : 
                                     analysis.stats.yoy_inflation > 0 ? "#e65100" : "#2e7d32",
                              mb: 1,
                              lineHeight: 1.2
                            }}
                          >
                            {analysis.stats.yoy_inflation >= 0 ? "+" : ""}
                            {analysis.stats.yoy_inflation.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem", mt: 1 }}>
                            vs {analysis.stats.yoy_label}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6" color="text.secondary" sx={{ fontSize: "1rem", mt: 1 }}>
                          Not available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                  
              <Grid item xs={12} md={4} sx={{ display: "flex", width: "100%" }}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: "100%",
                    width: "100%",
                    flex: 1, 
                    display: "flex", 
                    flexDirection: "column",
                    borderRadius: 2,
                    border: "1px solid #e0e0e0",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 3, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "text.secondary" }}>
                          Price Range
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      <Box sx={{ p: 2, bgcolor: "#e3f2fd", borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Lowest Price
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mt: 0.5 }}>
                          PHP {analysis.stats.min_price?.toFixed(2) || "-"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                          {analysis.stats.min_price_label || "-"}
                            </Typography>
                          </Box>
                      <Box sx={{ p: 2, bgcolor: "#ffebee", borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Highest Price
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#d32f2f", mt: 0.5 }}>
                          PHP {analysis.stats.max_price?.toFixed(2) || "-"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                          {analysis.stats.max_price_label || "-"}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
              <Grid item xs={12} md={4} sx={{ display: "flex", width: "100%" }}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: "100%",
                    width: "100%",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    bgcolor: analysis.stats.price_position === "near_record_high" ? "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)" :
                             analysis.stats.price_position === "high" ? "linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)" : 
                             analysis.stats.price_position === "low" ? "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)" : 
                             analysis.stats.price_position === "near_record_low" ? "linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)" : "#fafafa",
                    background: analysis.stats.price_position === "near_record_high" ? "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)" : 
                                analysis.stats.price_position === "high" ? "linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)" : 
                                analysis.stats.price_position === "low" ? "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)" : 
                                analysis.stats.price_position === "near_record_low" ? "linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)" : "#fafafa",
                    border: `1px solid ${analysis.stats.price_position === "near_record_high" ? "#ffcdd2" : 
                                        analysis.stats.price_position === "high" ? "#ffe0b2" : 
                                        analysis.stats.price_position === "low" ? "#bbdefb" : 
                                        analysis.stats.price_position === "near_record_low" ? "#c8e6c9" : "#e0e0e0"}`,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 3, justifyContent: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "text.secondary" }}>
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
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: "1rem", 
                        mb: 1.5,
                        py: 2.5,
                        height: "auto",
                        "& .MuiChip-label": {
                          px: 2
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                          Relative to period range
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
        )}

        {/* Summary Section */}
        {analysis && !analysis.error && (
        <Card elevation={2} sx={{ borderRadius: 3, bgcolor: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)", background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)", mb: 3, overflow: "hidden" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: "#1a237e" }}>
                  Summary
                </Typography>
            <Box sx={{ 
              p: 3, 
              bgcolor: "white", 
              borderRadius: 2, 
              border: "1px solid #e0e0e0",
              mb: analysis.forecast && analysis.forecast.length > 0 ? 3 : 0
            }}>
              <Typography variant="body1" sx={{ lineHeight: 1.9, fontSize: "1.05rem", color: "#424242" }}>
                  {analysis.summary || analysis.insight}
              </Typography>
            </Box>
            {analysis.forecast && analysis.forecast.length > 0 && (
              <Box sx={{ mt: 3, pt: 3, borderTop: "2px solid #e0e0e0" }}>
                <Typography variant="body2" sx={{ mb: 2.5, fontWeight: 600, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "text.secondary" }}>
                  Forecast (Next {analysis.forecast.length} months)
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  {analysis.forecast.map((price, idx) => {
                    const monthNumber = idx + 1;
                    const monthLabel = monthNumber === 1 ? "1st" : 
                                      monthNumber === 2 ? "2nd" : 
                                      monthNumber === 3 ? "3rd" : 
                                      `${monthNumber}th`;
                    return (
                      <Box key={idx} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                        <Chip 
                          label={`PHP ${price.toFixed(2)}`}
                          size="medium"
                          color="primary"
                          variant="filled"
                          sx={{ 
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            py: 2,
                            height: "auto",
                            "& .MuiChip-label": {
                              px: 2
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ fontSize: "0.7rem", fontWeight: 600, color: "text.secondary" }}>
                          {monthLabel} Month
                        </Typography>
                      </Box>
                    );
                  })}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
        )}

        {/* Loading/Error States */}
        {analysisLoading && (
        <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: "center", p: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading analysis...
                </Typography>
              </CardContent>
            </Card>
        )}
        
        {analysisError && (
        <Alert severity="error" sx={{ mb: 3 }}>{analysisError}</Alert>
        )}

        {!analysis && !analysisLoading && !analysisError && filters.food && filters.region && (
        <Alert severity="info" sx={{ mb: 3 }}>
              Select filters and view the trend to generate analysis.
            </Alert>
        )}

        {/* Comparison Section */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
            <CompareArrowsIcon sx={{ color: "#1976d2", fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a237e" }}>
                    Compare Products or Regions
                  </Typography>
              </Box>
            
          <>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                <Grid container spacing={3} sx={{ maxWidth: "1000px" }}>
                  <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      bgcolor: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
                      background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
                      borderRadius: 2,
                      border: "2px solid #1976d2",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      "&:hover": {
                        boxShadow: 4,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1 }}>
                      <Box sx={{ minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center", mb: 3, width: "100%" }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", display: "flex", alignItems: "center", gap: 1, justifyContent: "center", textAlign: "center" }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#1976d2" }} />
                          Item 1
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%", maxWidth: "400px" }}>
                          <TextField
                            select
                            label="Food Item"
                            fullWidth
                            value={comparisonFilters.food_1}
                            onChange={(e) => setComparisonFilters({ ...comparisonFilters, food_1: e.target.value })}
                            SelectProps={{
                              native: true,
                            }}
                          sx={{ bgcolor: "white" }}
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
                          sx={{ bgcolor: "white" }}
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
                <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      bgcolor: "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)",
                      background: "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)",
                      borderRadius: 2,
                      border: "2px solid #d32f2f",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      "&:hover": {
                        boxShadow: 4,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1 }}>
                      <Box sx={{ minHeight: "60px", display: "flex", alignItems: "center", justifyContent: "center", mb: 3, width: "100%" }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#d32f2f", display: "flex", alignItems: "center", gap: 1, justifyContent: "center", textAlign: "center" }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#d32f2f" }} />
                          Item 2
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%", maxWidth: "400px" }}>
                          <TextField
                            select
                            label="Food Item"
                            fullWidth
                            value={comparisonFilters.food_2}
                            onChange={(e) => setComparisonFilters({ ...comparisonFilters, food_2: e.target.value })}
                            SelectProps={{
                              native: true,
                            }}
                          sx={{ bgcolor: "white" }}
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
                          sx={{ bgcolor: "white" }}
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
              </Box>
                
              <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
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
                  sx={{
                    fontWeight: 700,
                    textTransform: "none",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: "1rem"
                  }}
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
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Grid container spacing={3} sx={{ maxWidth: "1000px" }}>
                    <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        border: "2px solid #1976d2", 
                        height: "100%",
                        borderRadius: 2,
                        bgcolor: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
                        background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        maxWidth: "450px",
                        minWidth: "450px",
                        "&:hover": {
                          boxShadow: 6,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1 }}>
                        <Box sx={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center", mb: 3, width: "100%", px: 2 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              color: "#1976d2", 
                              fontSize: "1.1rem", 
                              textAlign: "center",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              lineHeight: 1.3
                            }}
                          >
                            {comparisonData.item_1.food_name} - {comparisonData.item_1.region_name}
                          </Typography>
                        </Box>
                          {comparisonData.item_1.stats && (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%", maxWidth: "400px" }}>
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Current Price
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2", mt: 0.5 }}>
                                  PHP {comparisonData.item_1.stats.end_price.toFixed(2)}
                                </Typography>
                              </Box>
                              <Divider />
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Change Over Period
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, color: comparisonData.item_1.stats.absolute_change >= 0 ? "#d32f2f" : "#2e7d32" }}>
                                  {comparisonData.item_1.stats.absolute_change >= 0 ? "+" : ""}
                                  {comparisonData.item_1.stats.absolute_change.toFixed(2)} PHP ({comparisonData.item_1.stats.percent_change?.toFixed(1)}%)
                                </Typography>
                              </Box>
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Avg Monthly Change
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                                  {comparisonData.item_1.stats.avg_monthly_change >= 0 ? "+" : ""}
                                  {comparisonData.item_1.stats.avg_monthly_change.toFixed(2)} PHP/month
                                </Typography>
                              </Box>
                              {comparisonData.item_1.stats.yoy_inflation != null && (
                              <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                  YoY Inflation
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, color: comparisonData.item_1.stats.yoy_inflation >= 0 ? "#d32f2f" : "#2e7d32" }}>
                                    {comparisonData.item_1.stats.yoy_inflation >= 0 ? "+" : ""}
                                    {comparisonData.item_1.stats.yoy_inflation.toFixed(1)}%
                                  </Typography>
                                </Box>
                              )}
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Price Range
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                                  PHP {comparisonData.item_1.stats.min_price.toFixed(2)} - PHP {comparisonData.item_1.stats.max_price.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        border: "2px solid #d32f2f", 
                        height: "100%",
                        borderRadius: 2,
                        bgcolor: "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)",
                        background: "linear-gradient(135deg, #ffebee 0%, #ffffff 100%)",
                        transition: "all 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        maxWidth: "450px",
                        minWidth: "450px",
                        "&:hover": {
                          boxShadow: 6,
                        }
                      }}
                    >
                        <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", flexGrow: 1 }}>
                          <Box sx={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center", mb: 3, width: "100%", px: 2 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700, 
                                color: "#d32f2f", 
                                fontSize: "1.1rem", 
                                textAlign: "center",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                lineHeight: 1.3
                              }}
                            >
                            {comparisonData.item_2.food_name} - {comparisonData.item_2.region_name}
                          </Typography>
                          </Box>
                          {comparisonData.item_2.stats && (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, width: "100%", maxWidth: "400px" }}>
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Current Price
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 700, color: "#d32f2f", mt: 0.5 }}>
                                  PHP {comparisonData.item_2.stats.end_price.toFixed(2)}
                                </Typography>
                              </Box>
                              <Divider />
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Change Over Period
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, color: comparisonData.item_2.stats.absolute_change >= 0 ? "#d32f2f" : "#2e7d32" }}>
                                  {comparisonData.item_2.stats.absolute_change >= 0 ? "+" : ""}
                                  {comparisonData.item_2.stats.absolute_change.toFixed(2)} PHP ({comparisonData.item_2.stats.percent_change?.toFixed(1)}%)
                                </Typography>
                              </Box>
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Avg Monthly Change
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                                  {comparisonData.item_2.stats.avg_monthly_change >= 0 ? "+" : ""}
                                  {comparisonData.item_2.stats.avg_monthly_change.toFixed(2)} PHP/month
                                </Typography>
                              </Box>
                              {comparisonData.item_2.stats.yoy_inflation != null && (
                              <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                  YoY Inflation
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5, color: comparisonData.item_2.stats.yoy_inflation >= 0 ? "#d32f2f" : "#2e7d32" }}>
                                    {comparisonData.item_2.stats.yoy_inflation >= 0 ? "+" : ""}
                                    {comparisonData.item_2.stats.yoy_inflation.toFixed(1)}%
                                  </Typography>
                                </Box>
                              )}
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1.5, textAlign: "center" }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Price Range
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                                  PHP {comparisonData.item_2.stats.min_price.toFixed(2)} - PHP {comparisonData.item_2.stats.max_price.toFixed(2)}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                )}
              </>
          </CardContent>
        </Card>
    </Box>
);
}

export default Dashboard;

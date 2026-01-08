import React, { useMemo } from "react";
import { Grid, TextField, MenuItem, ListSubheader, Paper, Typography, Box } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

function Filters({ foods, regions, filters, setFilters }) {
  // Group foods by category
  const groupedFoods = useMemo(() => {
    const groups = {};
    foods.forEach(food => {
      const categoryName = food.category_name || "Uncategorized";
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(food);
    });
    // Sort categories alphabetically
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key].sort((a, b) => a.food_name.localeCompare(b.food_name));
      return acc;
    }, {});
  }, [foods]);

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        bgcolor: "#f8f9fa"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FilterListIcon sx={{ color: "#1976d2" }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Food Item"
            fullWidth
            variant="outlined"
            value={filters.food}
            onChange={e => setFilters({ ...filters, food: e.target.value })}
            sx={{ 
              bgcolor: "white",
              minWidth: "200px",
              "& .MuiInputBase-root": {
                minWidth: "200px"
              }
            }}
          >
            {Object.entries(groupedFoods).map(([categoryName, categoryFoods]) => [
              <ListSubheader key={categoryName} sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }}>
                {categoryName}
              </ListSubheader>,
              ...categoryFoods.map(food => (
                <MenuItem key={food.food_id} value={food.food_id} sx={{ pl: 3 }}>
                  {food.food_name}
                </MenuItem>
              ))
            ])}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Region"
            fullWidth
            variant="outlined"
            value={filters.region}
            onChange={e => setFilters({ ...filters, region: e.target.value })}
            sx={{ 
              bgcolor: "white",
              minWidth: "200px",
              "& .MuiInputBase-root": {
                minWidth: "200px"
              }
            }}
          >
            {regions.map(region => (
              <MenuItem key={region.region_id} value={region.region_id}>
                {region.region_name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={6} sm={3} md={3}>
          <TextField
            label="Start Year"
            type="number"
            fullWidth
            variant="outlined"
            value={filters.startYear}
            onChange={e => setFilters({ ...filters, startYear: e.target.value })}
            sx={{ bgcolor: "white" }}
          />
        </Grid>

        <Grid item xs={6} sm={3} md={3}>
          <TextField
            label="End Year"
            type="number"
            fullWidth
            variant="outlined"
            value={filters.endYear}
            onChange={e => setFilters({ ...filters, endYear: e.target.value })}
            sx={{ bgcolor: "white" }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}

export default Filters;

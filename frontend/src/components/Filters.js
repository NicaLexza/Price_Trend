import React from "react";
import { Grid, TextField, MenuItem, Paper, Typography, Box } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

function Filters({ foods, regions, filters, setFilters }) {
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
            sx={{ bgcolor: "white" }}
          >
            {foods.map(food => (
              <MenuItem key={food.food_id} value={food.food_id}>
                {food.food_name}
              </MenuItem>
            ))}
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
            sx={{ bgcolor: "white" }}
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

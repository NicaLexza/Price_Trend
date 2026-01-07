import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { Paper, Typography } from "@mui/material";

function ComparisonBarChart({ data }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Food Item Comparison</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="food" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="price" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
}

export default ComparisonBarChart;

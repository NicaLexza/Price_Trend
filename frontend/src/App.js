import React from "react";
import { Container, Typography } from "@mui/material";
import Home from "./pages/Home";

function App() {
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" align="center" sx={{ my: 3 }}>
        FOODINSIGHTPH: Food Inflation Dashboard
      </Typography>
      <Home />
    </Container>
  );
}

export default App;

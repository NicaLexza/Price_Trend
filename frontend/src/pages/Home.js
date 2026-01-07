import React, { useEffect, useState } from "react";
import Dashboard from "../components/Dashboard";
import { fetchFoods, fetchRegions } from "../api/api";

function Home() {
  const [foods, setFoods] = useState([]);
  const [regions, setRegions] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [foodsError, setFoodsError] = useState(null);
  const [regionsError, setRegionsError] = useState(null);

  useEffect(() => {
    setFoodsLoading(true);
    setRegionsLoading(true);

    fetchFoods()
      .then((res) => {
        setFoods(res.data);
        setFoodsError(null);
      })
      .catch((err) => {
        setFoodsError(err.message || "Failed to load foods");
      })
      .finally(() => {
        setFoodsLoading(false);
      });

    fetchRegions()
      .then((res) => {
        setRegions(res.data);
        setRegionsError(null);
      })
      .catch((err) => {
        setRegionsError(err.message || "Failed to load regions");
      })
      .finally(() => {
        setRegionsLoading(false);
      });
  }, []);

  const isLoading = foodsLoading || regionsLoading;
  const errorMessage = foodsError || regionsError;

  return (
    <>
      {isLoading && (
        <div style={{ marginBottom: 16 }}>Loading reference data...</div>
      )}
      {errorMessage && (
        <div style={{ marginBottom: 16, color: "red" }}>
          Failed to load reference data: {errorMessage}
        </div>
      )}
      <Dashboard foods={foods} regions={regions} />
    </>
  );
}

export default Home;

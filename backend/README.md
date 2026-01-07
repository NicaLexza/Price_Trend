FOODINSIGHTPH Backend
=====================

This is the FastAPI backend for the FOODINSIGHTPH food inflation dashboard.
It exposes REST endpoints for foods, regions, price trends, and AI-generated
insights/forecasts, backed by a MySQL database.


## Requirements

- Python 3.10+
- MySQL server

Install Python dependencies:

```bash
pip install -r requirements.txt
```


## Configuration

The backend is configured primarily through environment variables:

- `DATABASE_URL`  
  SQLAlchemy connection string. Defaults to:
  `mysql+pymysql://root@localhost/foodinsightph`

- `CORS_ORIGINS`  
  Comma-separated list of allowed origins for CORS.  
  Default: `http://localhost:3000`

- `API_KEY`  
  API key required in the `X-API-Key` header for all endpoints.  
  Default: `dev-key`. If empty, API key checks are effectively disabled.

Example (PowerShell):

```powershell
$env:DATABASE_URL = "mysql+pymysql://user:password@localhost/foodinsightph"
$env:CORS_ORIGINS = "http://localhost:3000,http://localhost:4173"
$env:API_KEY = "change-me-in-prod"
```


## Database setup

You need a MySQL database with tables matching the SQLAlchemy models
defined in `app/models.py` (`FoodItem`, `Region`, `TimePeriod`,
`PriceObservation`, `AiInsight`, `ForecastResult`, etc.).

At minimum:

1. Create the database (if it doesn't exist):

   ```sql
   CREATE DATABASE foodinsightph CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Point `DATABASE_URL` to that database.
3. Create the tables either via your own migrations or by running a small
   script that imports `Base` from `app.database` and calls `Base.metadata.create_all(engine)`.


## Running the server

From the `backend` directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` by default.

Key endpoints:

- `GET /foods` – list available food items
- `GET /regions` – list regions
- `GET /trends` – price trend data for a food/region/year range
- `GET /analysis` – AI-powered analysis + optional persistence
- `GET /analysis/saved` – list saved insights
- `GET /analysis/forecasts` – list saved forecasts

All endpoints expect the `X-API-Key` header if `API_KEY` is set.

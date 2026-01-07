import pandas as pd

def clean_psa_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean PSA food price data.
    """
    # Standardize column names
    df.columns = df.columns.str.lower().str.strip()

    # Drop rows with missing price
    df = df.dropna(subset=["price"])

    # Convert price to numeric
    df["price"] = pd.to_numeric(df["price"], errors="coerce")

    # Normalize region names
    df["region"] = df["region"].str.upper().str.strip()

    # Ensure date consistency
    df["year"] = df["year"].astype(int)
    if "month" in df.columns:
        df["month"] = df["month"].astype(int)

    return df

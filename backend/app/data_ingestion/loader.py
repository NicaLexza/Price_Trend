import pandas as pd

def load_file(file_path: str) -> pd.DataFrame:
    """
    Load PSA CSV or Excel file into a DataFrame.
    """
    if file_path.endswith(".csv"):
        return pd.read_csv(file_path)
    elif file_path.endswith(".xlsx"):
        return pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format")

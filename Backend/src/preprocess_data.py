import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler


def load_and_preprocess_data(csv_path):
    df = pd.read_csv(csv_path)
    
    # Drop ID column if it exists
    if 'id' in df.columns:
        df = df.drop('id', axis=1)

    # Clean classification column - remove whitespace
    if 'classification' in df.columns:
        df['classification'] = df['classification'].str.strip()

    # Replace '?' with NaN and \t with ''
    df = df.replace(['?', '\t', ' '], np.nan)

    # Convert numeric columns
    for col in df.columns:
        if col != 'classification':
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # Fill missing values for numeric columns
    for col in df.select_dtypes(include=['float64', 'int64']).columns:
        if df[col].isnull().all():
            # If entire column is NaN, fill with 0
            df[col] = 0
        else:
            # Fill with median to be more robust to outliers
            df[col] = df[col].fillna(df[col].median())

    # Fill missing values for categorical columns
    for col in df.select_dtypes(include=['object']).columns:
        if col != 'classification':
            if df[col].isnull().all():
                df[col] = 'unknown'
            elif not df[col].mode().empty:
                df[col] = df[col].fillna(df[col].mode()[0])
            else:
                df[col] = df[col].fillna('unknown')

    # Encode categorical data
    le = LabelEncoder()
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = le.fit_transform(df[col])

    # Split X and y
    X = df.drop('classification', axis=1)
    y = df['classification']

    # Remove any remaining NaN values
    X = X.fillna(0)

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Final check - replace any NaN or inf with 0
    X_scaled = np.nan_to_num(X_scaled, nan=0.0, posinf=0.0, neginf=0.0)

    return X_scaled, y, scaler


if __name__ == "__main__":
    X, y, _ = load_and_preprocess_data("data/kidney_disease.csv")
    print("Preprocessing done. Shape:", X.shape)

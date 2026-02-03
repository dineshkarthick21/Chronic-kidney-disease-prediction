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

    # Replace '?' with NaN
    df.replace('?', np.nan, inplace=True)

    # Convert numeric columns
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='ignore')

    # Fill missing values
    for col in df.select_dtypes(include=['float64', 'int64']).columns:
        df[col].fillna(df[col].mean(), inplace=True)

    for col in df.select_dtypes(include=['object']).columns:
        df[col].fillna(df[col].mode()[0], inplace=True)

    # Encode categorical data
    le = LabelEncoder()
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = le.fit_transform(df[col])

    # Split X and y
    X = df.drop('classification', axis=1)
    y = df['classification']

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler


if __name__ == "__main__":
    X, y, _ = load_and_preprocess_data("data/kidney_disease.csv")
    print("Preprocessing done. Shape:", X.shape)

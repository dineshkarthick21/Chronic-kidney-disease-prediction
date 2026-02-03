import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

from preprocess_data import load_and_preprocess_data
from feature_selection import apply_feature_selection


def train_and_save_model():
    X, y, scaler = load_and_preprocess_data("data/kidney_disease.csv")
    X_selected, selector = apply_feature_selection(X, y, k=10)

    X_train, X_test, y_train, y_test = train_test_split(
        X_selected, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    with open("models/random_forest_ckd.pkl", "wb") as f:
        pickle.dump({
            "model": model,
            "scaler": scaler,
            "selector": selector
        }, f)

    print("Model trained and saved successfully!")


if __name__ == "__main__":
    train_and_save_model()

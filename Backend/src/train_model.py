import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

from preprocess_data import load_and_preprocess_data
from feature_selection import apply_feature_selection


def train_and_save_model():
    X, y, scaler = load_and_preprocess_data("data/custom_csv.csv")
    X_selected, selector = apply_feature_selection(X, y, k=15)

    X_train, X_test, y_train, y_test = train_test_split(
        X_selected, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200, 
        random_state=42,
        class_weight='balanced',
        max_depth=15,
        min_samples_split=4,
        min_samples_leaf=2
    )
    model.fit(X_train, y_train)
    
    # Quick evaluation
    y_pred = model.predict(X_test)
    print("Training completed!")
    print("\nQuick Evaluation on Test Set:")
    print(classification_report(y_test, y_pred, zero_division=0))

    with open("models/random_forest_ckd.pkl", "wb") as f:
        pickle.dump({
            "model": model,
            "scaler": scaler,
            "selector": selector
        }, f)

    print("\nModel trained and saved successfully!")


if __name__ == "__main__":
    train_and_save_model()

import pickle
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.model_selection import train_test_split

from preprocess_data import load_and_preprocess_data
from feature_selection import apply_feature_selection


def evaluate_model():
    with open("models/random_forest_ckd.pkl", "rb") as f:
        saved = pickle.load(f)

    model = saved["model"]

    X, y, _ = load_and_preprocess_data("data/kidney_disease.csv")
    X_selected, _ = apply_feature_selection(X, y, k=15)

    X_train, X_test, y_train, y_test = train_test_split(
        X_selected, y, test_size=0.2, random_state=42
    )

    y_pred = model.predict(X_test)

    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
    print("Classification Report:\n", classification_report(y_test, y_pred, zero_division=0))


if __name__ == "__main__":
    evaluate_model()

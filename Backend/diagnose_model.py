"""
Diagnose the issue with the trained model
"""
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
import sys
sys.path.insert(0, 'src')

from preprocess_data import load_and_preprocess_data
from feature_selection import apply_feature_selection

print("="*80)
print("DIAGNOSING MODEL TRAINING ISSUE")
print("="*80)

# Load the raw data
print("\n1. DATA DISTRIBUTION:")
df = pd.read_csv('data/kidney_disease.csv')
print(f"Total patients: {len(df)}")
print(f"\nClass distribution:")
print(df['classification'].value_counts())
print(f"\nRatio - CKD: {(df['classification']=='ckd').sum()}/{len(df)} "
      f"({100*(df['classification']=='ckd').sum()/len(df):.1f}%)")
print(f"Ratio - No CKD: {(df['classification']=='notckd').sum()}/{len(df)} "
      f"({100*(df['classification']=='notckd').sum()/len(df):.1f}%)")

# Load and check processed data
print("\n2. PREPROCESSING CHECK:")
X, y, scaler = load_and_preprocess_data('data/kidney_disease.csv')
print(f"Preprocessed data shape: {X.shape}")
print(f"Feature scaling - Mean: {X.mean(axis=0)[:5]}")
print(f"Feature scaling - Std: {X.std(axis=0)[:5]}")

# Check feature selection
print("\n3. FEATURE SELECTION CHECK:")
X_selected, selector = apply_feature_selection(X, y, k=15)
print(f"Selected features shape: {X_selected.shape}")
print(f"Number of features: {X_selected.shape[1]}")

# Check training/test split
print("\n4. TRAIN/TEST SPLIT:")
X_train, X_test, y_train, y_test = train_test_split(
    X_selected, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train size: {X_train.shape[0]}")
print(f"Test size: {X_test.shape[0]}")
print(f"\nTrain set CKD distribution:")
print(y_train.value_counts())
print(f"\nTest set CKD distribution:")
print(y_test.value_counts())

# Load model
print("\n5. MODEL CHECK:")
with open('models/random_forest_ckd.pkl', 'rb') as f:
    loaded = pickle.load(f)

model = loaded.get('model')
print(f"Model type: {type(model).__name__}")
print(f"Model classes: {model.classes_}")
print(f"Model n_estimators: {model.n_estimators}")
print(f"Model max_depth: {model.max_depth}")

# Get predictions on test set
print("\n6. TEST SET PERFORMANCE:")
y_pred = model.predict(X_test)
accuracy = (y_pred == y_test).mean()
print(f"Test accuracy: {accuracy:.4f}")
print(f"Predicted class distribution: {pd.Series(y_pred).value_counts()}")
print(f"True class distribution: {y_test.value_counts()}")

# Check if model is biased towards one class
ckd_pred_rate = (y_pred == 1).sum() / len(y_pred)
ckd_true_rate = (y_test == 1).sum() / len(y_test)
print(f"\nCKD prediction rate: {ckd_pred_rate*100:.1f}%")
print(f"CKD true rate in test: {ckd_true_rate*100:.1f}%")

if ckd_pred_rate < 0.1:
    print("\n⚠️ ISSUE FOUND: Model is predicting almost no CKD cases!")
    print("   This explains why it fails on CKD patients in the form.")

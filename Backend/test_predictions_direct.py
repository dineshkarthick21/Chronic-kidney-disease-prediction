"""
Direct model prediction test with sample patient data
Tests the model without needing the full API/authentication
"""
import pickle
import numpy as np
import pandas as pd
import sys
import os

# Add src to path
sys.path.insert(0, 'src')

from preprocess_data import load_and_preprocess_data
from feature_selection import apply_feature_selection


def load_model():
    """Load the trained model"""
    try:
        with open('models/random_forest_ckd.pkl', 'rb') as f:
            loaded = pickle.load(f)
        
        if isinstance(loaded, dict):
            return loaded.get('model'), loaded.get('scaler'), loaded.get('selector')
        return loaded, None, None
    except Exception as e:
        print(f"Error loading model: {e}")
        return None, None, None


def preprocess_patient_data(patient_dict):
    """Convert patient dict to model input"""
    feature_names = ['age', 'bp', 'sg', 'al', 'su', 'bgr', 'bu', 'sc', 'sod', 'pot', 
                     'hemo', 'pcv', 'wc', 'rc', 'rbc', 'pc', 'pcc', 'ba', 'htn', 'dm', 
                     'cad', 'appet', 'pe', 'ane']
    
    mappings = {
        'rbc': {'normal': 0, 'abnormal': 1},
        'pc': {'normal': 0, 'abnormal': 1},
        'pcc': {'notpresent': 0, 'present': 1},
        'ba': {'notpresent': 0, 'present': 1},
        'htn': {'no': 0, 'yes': 1},
        'dm': {'no': 0, 'yes': 1},
        'cad': {'no': 0, 'yes': 1},
        'appet': {'good': 0, 'poor': 1},
        'pe': {'no': 0, 'yes': 1},
        'ane': {'no': 0, 'yes': 1}
    }
    
    processed = []
    for feature in feature_names:
        value = patient_dict.get(feature, '')
        
        if feature in mappings:
            value = str(value).lower().strip()
            processed.append(mappings[feature].get(value, 0))
        else:
            try:
                processed.append(float(value) if value != '' else 0.0)
            except:
                processed.append(0.0)
    
    return np.array(processed).reshape(1, -1)


# Sample patient data
SAMPLE_PATIENTS = {
    "SAMPLE 1: Healthy Patient": {
        "expected": "No CKD",
        "data": {
            "patientName": "John Smith",
            "age": "35", "bp": "70", "sg": "1.025", "al": "0", "su": "0",
            "rbc": "normal", "pc": "normal", "pcc": "notpresent", "ba": "notpresent",
            "bgr": "100", "bu": "25", "sc": "0.8", "sod": "140", "pot": "4.0",
            "hemo": "15.0", "pcv": "45", "wc": "8000", "rc": "5.5",
            "htn": "no", "dm": "no", "cad": "no", "appet": "good", "pe": "no", "ane": "no"
        }
    },
    "SAMPLE 2: Healthy Patient #2": {
        "expected": "No CKD",
        "data": {
            "patientName": "Sarah Johnson",
            "age": "42", "bp": "80", "sg": "1.020", "al": "0", "su": "0",
            "rbc": "normal", "pc": "normal", "pcc": "notpresent", "ba": "notpresent",
            "bgr": "110", "bu": "30", "sc": "0.9", "sod": "138", "pot": "4.2",
            "hemo": "14.5", "pcv": "43", "wc": "7500", "rc": "5.3",
            "htn": "no", "dm": "no", "cad": "no", "appet": "good", "pe": "no", "ane": "no"
        }
    },
    "SAMPLE 3: CKD Patient": {
        "expected": "CKD",
        "data": {
            "patientName": "Michael Brown",
            "age": "55", "bp": "90", "sg": "1.015", "al": "3", "su": "2",
            "rbc": "abnormal", "pc": "abnormal", "pcc": "present", "ba": "notpresent",
            "bgr": "200", "bu": "100", "sc": "3.5", "sod": "130", "pot": "5.5",
            "hemo": "9.0", "pcv": "28", "wc": "10000", "rc": "3.8",
            "htn": "yes", "dm": "yes", "cad": "no", "appet": "poor", "pe": "yes", "ane": "yes"
        }
    },
    "SAMPLE 4: CKD Patient #2": {
        "expected": "CKD",
        "data": {
            "patientName": "Robert Wilson",
            "age": "62", "bp": "95", "sg": "1.010", "al": "2", "su": "1",
            "rbc": "abnormal", "pc": "normal", "pcc": "present", "ba": "notpresent",
            "bgr": "180", "bu": "85", "sc": "2.8", "sod": "135", "pot": "5.2",
            "hemo": "10.5", "pcv": "32", "wc": "9500", "rc": "4.0",
            "htn": "yes", "dm": "yes", "cad": "yes", "appet": "poor", "pe": "no", "ane": "yes"
        }
    },
    "SAMPLE 5: Borderline Case (Early Stage)": {
        "expected": "CKD",
        "data": {
            "patientName": "David Martinez",
            "age": "48", "bp": "85", "sg": "1.020", "al": "1", "su": "0",
            "rbc": "normal", "pc": "abnormal", "pcc": "notpresent", "ba": "notpresent",
            "bgr": "130", "bu": "50", "sc": "1.5", "sod": "138", "pot": "4.5",
            "hemo": "12.5", "pcv": "38", "wc": "8500", "rc": "5.0",
            "htn": "yes", "dm": "no", "cad": "no", "appet": "good", "pe": "no", "ane": "no"
        }
    },
    "SAMPLE 6: Severe CKD Patient": {
        "expected": "CKD",
        "data": {
            "patientName": "James Anderson",
            "age": "70", "bp": "100", "sg": "1.005", "al": "4", "su": "3",
            "rbc": "abnormal", "pc": "abnormal", "pcc": "present", "ba": "present",
            "bgr": "250", "bu": "140", "sc": "5.2", "sod": "128", "pot": "6.0",
            "hemo": "8.0", "pcv": "24", "wc": "12000", "rc": "3.2",
            "htn": "yes", "dm": "yes", "cad": "yes", "appet": "poor", "pe": "yes", "ane": "yes"
        }
    }
}


def main():
    print("\n" + "="*90)
    print("🏥 PATIENT INFORMATION FORM - PREDICTION TEST")
    print("="*90)
    
    # Load model
    print("\nLoading trained model...")
    model, scaler, selector = load_model()
    
    if model is None:
        print("❌ Error: Could not load model!")
        return
    
    print("✅ Model loaded successfully!")
    
    # Load dataset for preprocessing reference
    print("Loading dataset preprocessing info...")
    X, y, _ = load_and_preprocess_data('data/kidney_disease.csv')
    X_selected, _ = apply_feature_selection(X, y, k=15)
    
    correct_predictions = 0
    total_predictions = 0
    
    # Test each sample
    for sample_name, sample_info in SAMPLE_PATIENTS.items():
        print(f"\n{'='*90}")
        print(f"📋 {sample_name}")
        print(f"{'='*90}")
        
        patient_data = sample_info['data']
        expected = sample_info['expected']
        
        # Display patient info
        print(f"Name: {patient_data['patientName']}")
        print(f"Age: {patient_data['age']} | BP: {patient_data['bp']} | "
              f"Serum Creatinine: {patient_data['sc']} | Hemoglobin: {patient_data['hemo']}")
        print(f"Diabetes: {patient_data['dm']} | Hypertension: {patient_data['htn']} | "
              f"Appetite: {patient_data['appet']} | Anemia: {patient_data['ane']}")
        print(f"Blood Glucose: {patient_data['bgr']} | Blood Urea: {patient_data['bu']} | "
              f"Albumin: {patient_data['al']} | Sugar: {patient_data['su']}")
        
        # Preprocess
        try:
            patient_input = preprocess_patient_data(patient_data)
            
            # Apply transformations
            if scaler is not None:
                patient_input = scaler.transform(patient_input)
            
            if selector is not None:
                patient_input = selector.transform(patient_input)
            
            # Make prediction
            prediction = model.predict(patient_input)[0]
            prediction_proba = model.predict_proba(patient_input)[0]
            confidence = max(prediction_proba) * 100
            
            pred_label = "CKD" if prediction == 0 else "No CKD"
            
            # Check correctness
            is_correct = (pred_label == expected)
            if is_correct:
                correct_predictions += 1
            total_predictions += 1
            
            # Display results
            print(f"\n📊 PREDICTION RESULTS:")
            print(f"   Expected:    {expected}")
            print(f"   Predicted:   {pred_label}")
            print(f"   Confidence:  {confidence:.2f}%")
            print(f"   Status:      {'✅ CORRECT' if is_correct else '❌ INCORRECT'}")
            
            # Show probabilities
            if prediction == 1:  # CKD predicted
                print(f"   CKD Risk:    {prediction_proba[1]*100:.2f}%")
                print(f"   Normal Risk: {prediction_proba[0]*100:.2f}%")
            else:  # No CKD predicted
                print(f"   Normal Risk: {prediction_proba[0]*100:.2f}%")
                print(f"   CKD Risk:    {prediction_proba[1]*100:.2f}%")
        
        except Exception as e:
            print(f"❌ Error during prediction: {str(e)}")
            print(f"   {type(e).__name__}")
    
    # Summary
    print(f"\n{'='*90}")
    print(f"📈 FINAL SUMMARY")
    print(f"{'='*90}")
    if total_predictions > 0:
        accuracy = (correct_predictions / total_predictions) * 100
        print(f"Correct Predictions: {correct_predictions}/{total_predictions}")
        print(f"Overall Accuracy:    {accuracy:.1f}%")
        
        if accuracy == 100:
            print("🎉 Perfect! All predictions are correct!")
        elif accuracy >= 80:
            print("⭐ Excellent! Model is performing well!")
        elif accuracy >= 60:
            print("👍 Good! Model is working reasonably well.")
        else:
            print("⚠️ Performance needs improvement.")
    
    print(f"{'='*90}\n")


if __name__ == "__main__":
    main()

"""
Script to test the Patient Information Form API with sample patient data.
This helps verify the model is making correct predictions.
"""
import json
import requests
import time

# Backend API URL
API_URL = 'http://localhost:5000/api/predict'

# Sample patient data
SAMPLE_PATIENTS = {
    "Healthy_1": {
        "patientName": "John Smith",
        "age": "35",
        "bp": "70",
        "sg": "1.025",
        "al": "0",
        "su": "0",
        "rbc": "normal",
        "pc": "normal",
        "pcc": "notpresent",
        "ba": "notpresent",
        "bgr": "100",
        "bu": "25",
        "sc": "0.8",
        "sod": "140",
        "pot": "4.0",
        "hemo": "15.0",
        "pcv": "45",
        "wc": "8000",
        "rc": "5.5",
        "htn": "no",
        "dm": "no",
        "cad": "no",
        "appet": "good",
        "pe": "no",
        "ane": "no"
    },
    "Healthy_2": {
        "patientName": "Sarah Johnson",
        "age": "42",
        "bp": "80",
        "sg": "1.020",
        "al": "0",
        "su": "0",
        "rbc": "normal",
        "pc": "normal",
        "pcc": "notpresent",
        "ba": "notpresent",
        "bgr": "110",
        "bu": "30",
        "sc": "0.9",
        "sod": "138",
        "pot": "4.2",
        "hemo": "14.5",
        "pcv": "43",
        "wc": "7500",
        "rc": "5.3",
        "htn": "no",
        "dm": "no",
        "cad": "no",
        "appet": "good",
        "pe": "no",
        "ane": "no"
    },
    "CKD_1": {
        "patientName": "Michael Brown",
        "age": "55",
        "bp": "90",
        "sg": "1.015",
        "al": "3",
        "su": "2",
        "rbc": "abnormal",
        "pc": "abnormal",
        "pcc": "present",
        "ba": "notpresent",
        "bgr": "200",
        "bu": "100",
        "sc": "3.5",
        "sod": "130",
        "pot": "5.5",
        "hemo": "9.0",
        "pcv": "28",
        "wc": "10000",
        "rc": "3.8",
        "htn": "yes",
        "dm": "yes",
        "cad": "no",
        "appet": "poor",
        "pe": "yes",
        "ane": "yes"
    },
    "CKD_2": {
        "patientName": "Robert Wilson",
        "age": "62",
        "bp": "95",
        "sg": "1.010",
        "al": "2",
        "su": "1",
        "rbc": "abnormal",
        "pc": "normal",
        "pcc": "present",
        "ba": "notpresent",
        "bgr": "180",
        "bu": "85",
        "sc": "2.8",
        "sod": "135",
        "pot": "5.2",
        "hemo": "10.5",
        "pcv": "32",
        "wc": "9500",
        "rc": "4.0",
        "htn": "yes",
        "dm": "yes",
        "cad": "yes",
        "appet": "poor",
        "pe": "no",
        "ane": "yes"
    },
    "Borderline": {
        "patientName": "David Martinez",
        "age": "48",
        "bp": "85",
        "sg": "1.020",
        "al": "1",
        "su": "0",
        "rbc": "normal",
        "pc": "abnormal",
        "pcc": "notpresent",
        "ba": "notpresent",
        "bgr": "130",
        "bu": "50",
        "sc": "1.5",
        "sod": "138",
        "pot": "4.5",
        "hemo": "12.5",
        "pcv": "38",
        "wc": "8500",
        "rc": "5.0",
        "htn": "yes",
        "dm": "no",
        "cad": "no",
        "appet": "good",
        "pe": "no",
        "ane": "no"
    },
    "Severe_CKD": {
        "patientName": "James Anderson",
        "age": "70",
        "bp": "100",
        "sg": "1.005",
        "al": "4",
        "su": "3",
        "rbc": "abnormal",
        "pc": "abnormal",
        "pcc": "present",
        "ba": "present",
        "bgr": "250",
        "bu": "140",
        "sc": "5.2",
        "sod": "128",
        "pot": "6.0",
        "hemo": "8.0",
        "pcv": "24",
        "wc": "12000",
        "rc": "3.2",
        "htn": "yes",
        "dm": "yes",
        "cad": "yes",
        "appet": "poor",
        "pe": "yes",
        "ane": "yes"
    }
}

def test_with_token(token):
    """Test predictions with authentication token"""
    print("="*80)
    print("TESTING PATIENT INFORMATION FORM WITH SAMPLE DATA")
    print("="*80)
    
    results = []
    correct_predictions = 0
    total_predictions = 0
    
    for patient_type, patient_data in SAMPLE_PATIENTS.items():
        # Determine expected result based on patient type
        expected = "No CKD" if "Healthy" in patient_type else "CKD"
        
        try:
            # Make API request
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
            }
            
            response = requests.post(API_URL, json=patient_data, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                prediction = result.get('prediction', 'Unknown')
                confidence = result.get('confidence', 0)
                
                # Check if prediction is correct
                is_correct = (
                    (expected == "CKD" and prediction == "CKD") or
                    (expected == "No CKD" and prediction == "No CKD")
                )
                
                if is_correct:
                    correct_predictions += 1
                
                total_predictions += 1
                
                status = "✅ CORRECT" if is_correct else "❌ WRONG"
                
                print(f"\nPatient: {patient_data['patientName']} ({patient_type})")
                print(f"Age: {patient_data['age']}, BP: {patient_data['bp']}, "
                      f"Creatinine: {patient_data['sc']}, Hemoglobin: {patient_data['hemo']}")
                print(f"Diabetes: {patient_data['dm']}, HTN: {patient_data['htn']}, "
                      f"Appetite: {patient_data['appet']}, Anemia: {patient_data['ane']}")
                print(f"Expected:   {expected}")
                print(f"Prediction: {prediction}")
                print(f"Confidence: {confidence*100:.2f}%")
                print(f"{status}")
                
                results.append({
                    'patient': patient_type,
                    'expected': expected,
                    'prediction': prediction,
                    'confidence': confidence,
                    'correct': is_correct
                })
            else:
                print(f"\nError for {patient_type}: {response.status_code} - {response.text}")
        
        except requests.exceptions.ConnectionError:
            print(f"\n⚠️ Cannot connect to API. Make sure backend is running on {API_URL}")
            return None
        except Exception as e:
            print(f"\nError for {patient_type}: {str(e)}")
        
        time.sleep(0.5)  # Small delay between requests
    
    # Summary
    if total_predictions > 0:
        accuracy = (correct_predictions / total_predictions) * 100
        print(f"\n{'='*80}")
        print(f"SUMMARY: {correct_predictions}/{total_predictions} correct ({accuracy:.1f}% accuracy)")
        print(f"{'='*80}")
    
    return results


def get_test_token():
    """
    Get a test token - you need to be logged in first.
    Returns the token from localStorage in the frontend.
    """
    print("\n⚠️ IMPORTANT: You need to login first!")
    print("1. Go to the frontend (http://localhost:3000)")
    print("2. Login with your account")
    print("3. Open browser DevTools (F12) > Application/Storage > localStorage")
    print("4. Find the 'token' key and copy its value")
    print("5. Paste it below or run: python test_form.py <your_token>")
    
    import sys
    if len(sys.argv) > 1:
        return sys.argv[1]
    
    token = input("\nEnter your authentication token: ").strip()
    return token if token else None


if __name__ == "__main__":
    print("\n🏥 Patient Information Form Tester")
    print("This script tests the model predictions on sample patient data\n")
    
    # Get token
    token = get_test_token()
    
    if not token:
        print("\n❌ No token provided. Cannot proceed.")
        exit(1)
    
    # Run tests
    test_with_token(token)

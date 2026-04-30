// Sample Patient Input Data for Patient Information Form
// You can copy-paste these data sets into the form to test predictions

// ============================================================
// SAMPLE 1: HEALTHY PATIENT (Expected: No CKD)
// ============================================================
Patient Name: John Smith
Age: 35
Blood Pressure: 70
Specific Gravity: 1.025
Albumin: 0
Sugar: 0
RBC: normal
PC: normal
PCC: notpresent
BA: notpresent
Blood Glucose Random: 100
Blood Urea: 25
Serum Creatinine: 0.8
Sodium: 140
Potassium: 4.0
Hemoglobin: 15.0
Packed Cell Volume: 45
White Blood Cell Count: 8000
Red Blood Cell Count: 5.5
Hypertension: no
Diabetes: no
Coronary Artery Disease: no
Appetite: good
Pedal Edema: no
Anemia: no


// ============================================================
// SAMPLE 2: HEALTHY PATIENT #2 (Expected: No CKD)
// ============================================================
Patient Name: Sarah Johnson
Age: 42
Blood Pressure: 80
Specific Gravity: 1.020
Albumin: 0
Sugar: 0
RBC: normal
PC: normal
PCC: notpresent
BA: notpresent
Blood Glucose Random: 110
Blood Urea: 30
Serum Creatinine: 0.9
Sodium: 138
Potassium: 4.2
Hemoglobin: 14.5
Packed Cell Volume: 43
White Blood Cell Count: 7500
Red Blood Cell Count: 5.3
Hypertension: no
Diabetes: no
Coronary Artery Disease: no
Appetite: good
Pedal Edema: no
Anemia: no


// ============================================================
// SAMPLE 3: CKD PATIENT (Expected: CKD)
// ============================================================
Patient Name: Michael Brown
Age: 55
Blood Pressure: 90
Specific Gravity: 1.015
Albumin: 3
Sugar: 2
RBC: abnormal
PC: abnormal
PCC: present
BA: notpresent
Blood Glucose Random: 200
Blood Urea: 100
Serum Creatinine: 3.5
Sodium: 130
Potassium: 5.5
Hemoglobin: 9.0
Packed Cell Volume: 28
White Blood Cell Count: 10000
Red Blood Cell Count: 3.8
Hypertension: yes
Diabetes: yes
Coronary Artery Disease: no
Appetite: poor
Pedal Edema: yes
Anemia: yes


// ============================================================
// SAMPLE 4: CKD PATIENT #2 (Expected: CKD)
// ============================================================
Patient Name: Robert Wilson
Age: 62
Blood Pressure: 95
Specific Gravity: 1.010
Albumin: 2
Sugar: 1
RBC: abnormal
PC: normal
PCC: present
BA: notpresent
Blood Glucose Random: 180
Blood Urea: 85
Serum Creatinine: 2.8
Sodium: 135
Potassium: 5.2
Hemoglobin: 10.5
Packed Cell Volume: 32
White Blood Cell Count: 9500
Red Blood Cell Count: 4.0
Hypertension: yes
Diabetes: yes
Coronary Artery Disease: yes
Appetite: poor
Pedal Edema: no
Anemia: yes


// ============================================================
// SAMPLE 5: BORDERLINE CASE (Expected: CKD - Early Stage)
// ============================================================
Patient Name: David Martinez
Age: 48
Blood Pressure: 85
Specific Gravity: 1.020
Albumin: 1
Sugar: 0
RBC: normal
PC: abnormal
PCC: notpresent
BA: notpresent
Blood Glucose Random: 130
Blood Urea: 50
Serum Creatinine: 1.5
Sodium: 138
Potassium: 4.5
Hemoglobin: 12.5
Packed Cell Volume: 38
White Blood Cell Count: 8500
Red Blood Cell Count: 5.0
Hypertension: yes
Diabetes: no
Coronary Artery Disease: no
Appetite: good
Pedal Edema: no
Anemia: no


// ============================================================
// SAMPLE 6: SEVERE CKD PATIENT (Expected: CKD)
// ============================================================
Patient Name: James Anderson
Age: 70
Blood Pressure: 100
Specific Gravity: 1.005
Albumin: 4
Sugar: 3
RBC: abnormal
PC: abnormal
PCC: present
BA: present
Blood Glucose Random: 250
Blood Urea: 140
Serum Creatinine: 5.2
Sodium: 128
Potassium: 6.0
Hemoglobin: 8.0
Packed Cell Volume: 24
White Blood Cell Count: 12000
Red Blood Cell Count: 3.2
Hypertension: yes
Diabetes: yes
Coronary Artery Disease: yes
Appetite: poor
Pedal Edema: yes
Anemia: yes


// ============================================================
// KEY INDICATORS FOR CKD:
// ============================================================
// High Risk Indicators (Suggest CKD):
// - High Serum Creatinine (> 2.0)
// - High Blood Urea (> 80)
// - Low Hemoglobin (< 11)
// - Albumin presence (al > 0)
// - Sugar in urine (su > 0)
// - Abnormal RBC or PC
// - Presence of proteins/casts (pcc/ba = present)
// - Hypertension: yes
// - Diabetes: yes
// - Packed Cell Volume < 30

// Low Risk Indicators (Suggest No CKD):
// - Normal Serum Creatinine (< 1.2)
// - Normal Blood Urea (20-40)
// - Normal Hemoglobin (13-16)
// - No Albumin (al = 0)
// - No Sugar (su = 0)
// - Normal RBC and PC
// - No proteins/casts
// - Hypertension: no
// - Diabetes: no
// - Packed Cell Volume > 40

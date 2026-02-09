import { useState } from 'react'
import './PredictionForm.css'

const PredictionForm = ({ setResults }) => {
  const [formData, setFormData] = useState({
    age: '',
    bp: '',
    sg: '',
    al: '',
    su: '',
    rbc: 'normal',
    pc: 'normal',
    pcc: 'notpresent',
    ba: 'notpresent',
    bgr: '',
    bu: '',
    sc: '',
    sod: '',
    pot: '',
    hemo: '',
    pcv: '',
    wc: '',
    rc: '',
    htn: 'no',
    dm: 'no',
    cad: 'no',
    appet: 'good',
    pe: 'no',
    ane: 'no'
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call - Replace with actual backend endpoint
    setTimeout(() => {
      const mockResult = {
        type: 'single',
        prediction: Math.random() > 0.5 ? 'ckd' : 'notckd',
        confidence: (Math.random() * 30 + 70).toFixed(2),
        data: formData
      }
      setResults(mockResult)
      setLoading(false)
    }, 1500)

    // Actual implementation:
    // try {
    //   const response = await fetch('http://localhost:5000/api/predict', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    //   })
    //   const data = await response.json()
    //   setResults(data)
    // } catch (error) {
    //   console.error('Prediction error:', error)
    //   alert('Error making prediction. Please try again.')
    // } finally {
    //   setLoading(false)
    // }
  }

  return (
    <div className="prediction-form-container">
      <h2>Patient Information Form</h2>
      <p className="form-subtitle">Enter all medical parameters for CKD prediction</p>
      
      <form onSubmit={handleSubmit} className="prediction-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>📋 Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Age (years)</label>
              <input 
                type="number" 
                name="age" 
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g., 48"
                required
              />
            </div>
            <div className="form-group">
              <label>Blood Pressure (mm/Hg)</label>
              <input 
                type="number" 
                name="bp" 
                value={formData.bp}
                onChange={handleChange}
                placeholder="e.g., 80"
                required
              />
            </div>
          </div>
        </div>

        {/* Urine Tests */}
        <div className="form-section">
          <h3>🧪 Urine Test Results</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Specific Gravity</label>
              <input 
                type="number" 
                step="0.001"
                name="sg" 
                value={formData.sg}
                onChange={handleChange}
                placeholder="e.g., 1.020"
                required
              />
            </div>
            <div className="form-group">
              <label>Albumin (0-5)</label>
              <input 
                type="number" 
                name="al" 
                value={formData.al}
                onChange={handleChange}
                placeholder="e.g., 0"
                required
              />
            </div>
            <div className="form-group">
              <label>Sugar (0-5)</label>
              <input 
                type="number" 
                name="su" 
                value={formData.su}
                onChange={handleChange}
                placeholder="e.g., 0"
                required
              />
            </div>
            <div className="form-group">
              <label>Red Blood Cells</label>
              <select name="rbc" value={formData.rbc} onChange={handleChange}>
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Pus Cell</label>
              <select name="pc" value={formData.pc} onChange={handleChange}>
                <option value="normal">Normal</option>
                <option value="abnormal">Abnormal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Pus Cell Clumps</label>
              <select name="pcc" value={formData.pcc} onChange={handleChange}>
                <option value="notpresent">Not Present</option>
                <option value="present">Present</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bacteria</label>
              <select name="ba" value={formData.ba} onChange={handleChange}>
                <option value="notpresent">Not Present</option>
                <option value="present">Present</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blood Tests */}
        <div className="form-section">
          <h3>🩸 Blood Test Results</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Blood Glucose Random (mg/dL)</label>
              <input 
                type="number" 
                name="bgr" 
                value={formData.bgr}
                onChange={handleChange}
                placeholder="e.g., 121"
                required
              />
            </div>
            <div className="form-group">
              <label>Blood Urea (mg/dL)</label>
              <input 
                type="number" 
                name="bu" 
                value={formData.bu}
                onChange={handleChange}
                placeholder="e.g., 36"
                required
              />
            </div>
            <div className="form-group">
              <label>Serum Creatinine (mg/dL)</label>
              <input 
                type="number" 
                step="0.1"
                name="sc" 
                value={formData.sc}
                onChange={handleChange}
                placeholder="e.g., 1.2"
                required
              />
            </div>
            <div className="form-group">
              <label>Sodium (mEq/L)</label>
              <input 
                type="number" 
                name="sod" 
                value={formData.sod}
                onChange={handleChange}
                placeholder="e.g., 140"
                required
              />
            </div>
            <div className="form-group">
              <label>Potassium (mEq/L)</label>
              <input 
                type="number" 
                step="0.1"
                name="pot" 
                value={formData.pot}
                onChange={handleChange}
                placeholder="e.g., 4.5"
                required
              />
            </div>
            <div className="form-group">
              <label>Hemoglobin (g)</label>
              <input 
                type="number" 
                step="0.1"
                name="hemo" 
                value={formData.hemo}
                onChange={handleChange}
                placeholder="e.g., 15.4"
                required
              />
            </div>
            <div className="form-group">
              <label>Packed Cell Volume</label>
              <input 
                type="number" 
                name="pcv" 
                value={formData.pcv}
                onChange={handleChange}
                placeholder="e.g., 44"
                required
              />
            </div>
            <div className="form-group">
              <label>White Blood Cell Count</label>
              <input 
                type="number" 
                name="wc" 
                value={formData.wc}
                onChange={handleChange}
                placeholder="e.g., 7800"
                required
              />
            </div>
            <div className="form-group">
              <label>Red Blood Cell Count (millions/cmm)</label>
              <input 
                type="number" 
                step="0.1"
                name="rc" 
                value={formData.rc}
                onChange={handleChange}
                placeholder="e.g., 5.2"
                required
              />
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="form-section">
          <h3>📝 Medical History</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Hypertension</label>
              <select name="htn" value={formData.htn} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Diabetes Mellitus</label>
              <select name="dm" value={formData.dm} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Coronary Artery Disease</label>
              <select name="cad" value={formData.cad} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Appetite</label>
              <select name="appet" value={formData.appet} onChange={handleChange}>
                <option value="good">Good</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Pedal Edema</label>
              <select name="pe" value={formData.pe} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Anemia</label>
              <select name="ane" value={formData.ane} onChange={handleChange}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? '🔄 Analyzing...' : '🔬 Predict CKD'}
        </button>
      </form>
    </div>
  )
}

export default PredictionForm

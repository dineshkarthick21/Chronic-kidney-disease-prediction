import { useState } from 'react'
import './CSVUpload.css'

function CSVUpload({ setResults }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
    } else {
      alert('Please upload a valid CSV file')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      alert('Please select a CSV file first')
      return
    }

    setLoading(true)

    // Simulate API call - Replace with actual backend endpoint
    setTimeout(() => {
      const mockResults = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        prediction: Math.random() > 0.5 ? 'CKD' : 'Not CKD',
        confidence: (Math.random() * 30 + 70).toFixed(2)
      }))

      setResults({
        type: 'batch',
        fileName: file.name,
        results: mockResults,
        summary: {
          total: mockResults.length,
          ckd: mockResults.filter(r => r.prediction === 'CKD').length,
          notCkd: mockResults.filter(r => r.prediction === 'Not CKD').length
        }
      })
      setLoading(false)
    }, 2000)

    // TODO: Replace with actual API call
    /*
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:5000/api/predict-batch', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      setResults(result)
    } catch (error) {
      console.error('Error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
    */
  }

  const downloadSampleCSV = () => {
    const sampleData = `age,bp,sg,al,su,rbc,pc,pcc,ba,bgr,bu,sc,sod,pot,hemo,pcv,wc,rc,htn,dm,cad,appet,pe,ane
48,80,1.020,1,0,normal,normal,notpresent,notpresent,121,36,1.2,135,4.5,15.4,44,7800,5.2,yes,yes,no,good,no,no
62,80,1.010,2,3,normal,normal,notpresent,notpresent,423,53,1.8,138,3.8,9.6,31,7500,4.2,no,yes,no,poor,no,yes
45,70,1.015,0,0,normal,normal,notpresent,notpresent,117,42,1.1,140,4.2,14.5,40,6700,4.8,no,no,no,good,no,no`

    const blob = new Blob([sampleData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_ckd_data.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="csv-upload-container">
      <h2>Batch Prediction</h2>
      <p className="upload-subtitle">Upload a CSV file with patient data for batch predictions</p>

      <div className="upload-info">
        <div className="info-card">
          <h3>📋 Required CSV Format</h3>
          <p>Your CSV file must include these 24 columns:</p>
          <div className="column-list">
            <div className="column-group">
              <strong>Basic:</strong> age, bp
            </div>
            <div className="column-group">
              <strong>Urine:</strong> sg, al, su, rbc, pc, pcc, ba
            </div>
            <div className="column-group">
              <strong>Blood:</strong> bgr, bu, sc, sod, pot, hemo, pcv, wc, rc
            </div>
            <div className="column-group">
              <strong>History:</strong> htn, dm, cad, appet, pe, ane
            </div>
          </div>
          <button onClick={downloadSampleCSV} className="sample-btn">
            📥 Download Sample CSV
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div
          className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFileChange(e.target.files[0])}
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            {file ? (
              <>
                <span className="file-icon">✓</span>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
              </>
            ) : (
              <>
                <span className="upload-icon">📁</span>
                <p>Drag & drop your CSV file here</p>
                <p>or click to browse</p>
              </>
            )}
          </label>
        </div>

        {file && (
          <button type="submit" className="upload-btn" disabled={loading}>
            {loading ? '🔄 Processing...' : '🚀 Upload & Predict'}
          </button>
        )}
      </form>

      <div className="upload-notes">
        <h4>⚠️ Important Notes:</h4>
        <ul>
          <li>Maximum file size: 10 MB</li>
          <li>CSV must have header row with exact column names</li>
          <li>Categorical values must match: yes/no, good/poor, normal/abnormal, present/notpresent</li>
          <li>Missing values will be handled automatically by the model</li>
        </ul>
      </div>
    </div>
  )
}

export default CSVUpload

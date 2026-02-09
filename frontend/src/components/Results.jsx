import './Results.css'

function Results({ results, setResults }) {
  const downloadResults = () => {
    if (results.type === 'batch') {
      const csvContent = [
        ['ID', 'Prediction', 'Confidence (%)'].join(','),
        ...results.results.map(r => 
          [r.id, r.prediction, r.confidence].join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ckd_predictions_${new Date().getTime()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  if (results.type === 'single') {
    return (
      <div className="results-container">
        <div className="result-card single-result">
          <h2>Prediction Result</h2>
          
          <div className={`prediction-badge ${results.prediction === 'CKD' ? 'ckd' : 'no-ckd'}`}>
            <span className="prediction-icon">
              {results.prediction === 'CKD' ? '⚠️' : '✅'}
            </span>
            <div>
              <h3>{results.prediction}</h3>
              <p className="confidence">Confidence: {results.confidence}%</p>
            </div>
          </div>

          <div className="result-interpretation">
            <h4>Interpretation:</h4>
            {results.prediction === 'CKD' ? (
              <div className="warning-box">
                <p><strong>Chronic Kidney Disease Detected</strong></p>
                <p>The model predicts that the patient may have CKD based on the provided medical parameters.</p>
                <ul>
                  <li>Immediate consultation with a nephrologist is recommended</li>
                  <li>Further diagnostic tests may be required</li>
                  <li>Early intervention can help slow disease progression</li>
                </ul>
              </div>
            ) : (
              <div className="success-box">
                <p><strong>No Chronic Kidney Disease Detected</strong></p>
                <p>The model predicts that the patient is unlikely to have CKD based on the provided medical parameters.</p>
                <ul>
                  <li>Maintain regular health check-ups</li>
                  <li>Continue healthy lifestyle practices</li>
                  <li>Monitor blood pressure and blood sugar levels</li>
                </ul>
              </div>
            )}
          </div>

          <div className="patient-summary">
            <h4>Patient Parameters Summary:</h4>
            <div className="params-grid">
              <div className="param-item">
                <span className="param-label">Age:</span>
                <span className="param-value">{results.data.age} years</span>
              </div>
              <div className="param-item">
                <span className="param-label">BP:</span>
                <span className="param-value">{results.data.bp} mm/Hg</span>
              </div>
              <div className="param-item">
                <span className="param-label">Blood Glucose:</span>
                <span className="param-value">{results.data.bgr} mgs/dl</span>
              </div>
              <div className="param-item">
                <span className="param-label">Hemoglobin:</span>
                <span className="param-value">{results.data.hemo} gms</span>
              </div>
              <div className="param-item">
                <span className="param-label">Diabetes:</span>
                <span className="param-value">{results.data.dm}</span>
              </div>
              <div className="param-item">
                <span className="param-label">Hypertension:</span>
                <span className="param-value">{results.data.htn}</span>
              </div>
            </div>
          </div>

          <button onClick={() => setResults(null)} className="back-btn">
            🔙 New Prediction
          </button>
        </div>

        <div className="disclaimer">
          <p><strong>⚕️ Medical Disclaimer:</strong> This prediction is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.</p>
        </div>
      </div>
    )
  }

  // Batch results
  return (
    <div className="results-container">
      <div className="result-card batch-result">
        <h2>Batch Prediction Results</h2>
        <p className="file-info">File: <strong>{results.fileName}</strong></p>

        <div className="summary-section">
          <h3>Summary</h3>
          <div className="summary-cards">
            <div className="summary-card total">
              <div className="summary-number">{results.summary.total}</div>
              <div className="summary-label">Total Patients</div>
            </div>
            <div className="summary-card ckd">
              <div className="summary-number">{results.summary.ckd}</div>
              <div className="summary-label">CKD Detected</div>
            </div>
            <div className="summary-card no-ckd">
              <div className="summary-number">{results.summary.notCkd}</div>
              <div className="summary-label">No CKD</div>
            </div>
          </div>
        </div>

        <div className="results-table-container">
          <h3>Detailed Results</h3>
          <table className="results-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Prediction</th>
                <th>Confidence</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.results.map((result) => (
                <tr key={result.id}>
                  <td>#{result.id}</td>
                  <td>
                    <span className={`prediction-badge-small ${result.prediction === 'CKD' ? 'ckd' : 'no-ckd'}`}>
                      {result.prediction}
                    </span>
                  </td>
                  <td>{result.confidence}%</td>
                  <td>
                    <span className="status-icon">
                      {result.prediction === 'CKD' ? '⚠️' : '✅'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="action-buttons">
          <button onClick={downloadResults} className="download-btn">
            📥 Download Results CSV
          </button>
          <button onClick={() => setResults(null)} className="back-btn">
            🔙 New Upload
          </button>
        </div>
      </div>

      <div className="disclaimer">
        <p><strong>⚕️ Medical Disclaimer:</strong> These predictions are for informational purposes only and should not replace professional medical advice, diagnosis, or treatment.</p>
      </div>
    </div>
  )
}

export default Results

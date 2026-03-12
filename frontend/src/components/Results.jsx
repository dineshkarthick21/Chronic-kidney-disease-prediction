import './Results.css'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function Results({ results, setResults }) {
  const downloadResults = () => {
    if (results.type === 'batch') {
      try {
        const doc = new jsPDF()
        
        // Page 1: Header and Summary
        doc.setFontSize(20)
        doc.setTextColor(41, 128, 185)
        doc.text('CKD Prediction Report', 105, 20, { align: 'center' })
        
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text(`File: ${results.fileName}`, 14, 30)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35)
        doc.text(`Total Patients Analyzed: ${results.summary.total}`, 14, 40)
        
        // Draw summary boxes
        const boxY = 50
        
        // Total box
        doc.setFillColor(52, 152, 219)
        doc.rect(20, boxY, 50, 30, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.text(results.summary.total.toString(), 45, boxY + 15, { align: 'center' })
        doc.setFontSize(10)
        doc.text('Total Patients', 45, boxY + 25, { align: 'center' })
        
        // CKD box
        doc.setFillColor(231, 76, 60)
        doc.rect(80, boxY, 50, 30, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.text(results.summary.ckd.toString(), 105, boxY + 15, { align: 'center' })
        doc.setFontSize(10)
        doc.text('CKD Detected', 105, boxY + 25, { align: 'center' })
        
        // No CKD box
        doc.setFillColor(46, 204, 113)
        doc.rect(140, boxY, 50, 30, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.text(results.summary.notCkd.toString(), 165, boxY + 15, { align: 'center' })
        doc.setFontSize(10)
        doc.text('No CKD', 165, boxY + 25, { align: 'center' })
        
        // Draw pie chart
        const centerX = 55
        const centerY = 120
        const radius = 25
        const ckdPercentage = (results.summary.ckd / results.summary.total) * 100
        const ckdAngle = (ckdPercentage / 100) * 360
        
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.text('Distribution Chart', centerX, 92, { align: 'center' })
        
        // Draw pie chart using path
        if (ckdAngle > 0 && ckdAngle < 360) {
          // Draw CKD slice (red)
          doc.setFillColor(231, 76, 60)
          drawPieSlice(doc, centerX, centerY, radius, 0, ckdAngle)
          
          // Draw No CKD slice (green)
          doc.setFillColor(46, 204, 113)
          drawPieSlice(doc, centerX, centerY, radius, ckdAngle, 360)
        } else if (ckdAngle >= 360) {
          // All CKD
          doc.setFillColor(231, 76, 60)
          doc.circle(centerX, centerY, radius, 'F')
        } else {
          // No CKD (all green)
          doc.setFillColor(46, 204, 113)
          doc.circle(centerX, centerY, radius, 'F')
        }
        
        // Legend
        doc.setFontSize(9)
        doc.setFillColor(231, 76, 60)
        doc.rect(25, 150, 5, 5, 'F')
        doc.setTextColor(0)
        doc.text(`CKD: ${ckdPercentage.toFixed(1)}%`, 32, 154)
        
        doc.setFillColor(46, 204, 113)
        doc.rect(65, 150, 5, 5, 'F')
        doc.text(`No CKD: ${(100 - ckdPercentage).toFixed(1)}%`, 72, 154)
        
        // Draw Confidence Distribution Bar Chart
        doc.setFontSize(12)
        doc.setTextColor(0)
        doc.text('Confidence Distribution', 145, 92, { align: 'center' })
        
        // Group by confidence ranges
        const confidenceRanges = {
          '90-100%': 0,
          '80-89%': 0,
          '70-79%': 0,
          '<70%': 0
        }
        
        results.results.forEach(r => {
          const conf = parseFloat(r.confidence)
          if (conf >= 90) confidenceRanges['90-100%']++
          else if (conf >= 80) confidenceRanges['80-89%']++
          else if (conf >= 70) confidenceRanges['70-79%']++
          else confidenceRanges['<70%']++
        })
        
        // Draw bar chart
        const chartX = 110
        const chartY = 105
        const barWidth = 15
        const maxHeight = 40
        const maxValue = Math.max(...Object.values(confidenceRanges), 1)
        
        Object.entries(confidenceRanges).forEach(([range, count], index) => {
          const barHeight = (count / maxValue) * maxHeight
          const x = chartX + (index * 20)
          const y = chartY + maxHeight - barHeight
          
          // Draw bar
          doc.setFillColor(93, 173, 226)
          doc.rect(x, y, barWidth, barHeight, 'F')
          
          // Draw border
          doc.setDrawColor(41, 128, 185)
          doc.rect(x, y, barWidth, barHeight, 'S')
          
          // Draw value
          doc.setFontSize(8)
          doc.setTextColor(0)
          doc.text(count.toString(), x + barWidth/2, y - 2, { align: 'center' })
          
          // Draw label
          doc.text(range, x + barWidth/2, chartY + maxHeight + 8, { align: 'center', angle: 45 })
        })
        
        // Y-axis
        doc.setDrawColor(0)
        doc.line(chartX - 2, chartY, chartX - 2, chartY + maxHeight)
        // X-axis
        doc.line(chartX - 2, chartY + maxHeight, chartX + 78, chartY + maxHeight)
        
        // Results table
        autoTable(doc, {
          startY: 170,
          head: [['Patient ID', 'Prediction', 'Confidence', 'Risk Level']],
          body: results.results.map(r => [
            `#${r.id}`,
            r.prediction,
            `${r.confidence}%`,
            r.prediction === 'CKD' ? 'High Risk' : 'Low Risk'
          ]),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          styles: { fontSize: 9 },
          margin: { top: 170 }
        })
        
        // Page 2: Recovery and Recommendations
        doc.addPage()
        
        doc.setFontSize(18)
        doc.setTextColor(41, 128, 185)
        doc.text('Health Recommendations & Recovery Guidelines', 105, 20, { align: 'center' })
        
        let yPos = 35
        
        if (results.summary.ckd > 0) {
          // CKD Recovery Guidelines
          doc.setFontSize(14)
          doc.setTextColor(231, 76, 60)
          doc.text('For Patients with CKD Detection:', 14, yPos)
          yPos += 10
          
          doc.setFontSize(10)
          doc.setTextColor(0)
          const ckdGuidelines = [
            '1. Immediate Medical Consultation:',
            '   - Schedule an appointment with a nephrologist',
            '   - Get comprehensive kidney function tests (eGFR, Creatinine)',
            '   - Discuss treatment options and lifestyle modifications',
            '',
            '2. Dietary Modifications:',
            '   - Reduce sodium intake (less than 2,300mg per day)',
            '   - Limit protein intake as advised by your doctor',
            '   - Control potassium and phosphorus levels',
            '   - Stay well-hydrated (unless otherwise advised)',
            '',
            '3. Lifestyle Changes:',
            '   - Maintain healthy blood pressure (below 130/80 mmHg)',
            '   - Control blood sugar if diabetic (HbA1c < 7%)',
            '   - Regular exercise (30 minutes, 5 days/week)',
            '   - Quit smoking and limit alcohol consumption',
            '   - Achieve and maintain healthy weight',
            '',
            '4. Medication Management:',
            '   - Take prescribed medications regularly',
            '   - Avoid NSAIDs (ibuprofen, naproxen) without doctor approval',
            '   - Monitor for drug interactions',
            '',
            '5. Regular Monitoring:',
            '   - Check blood pressure daily',
            '   - Regular kidney function tests (every 3-6 months)',
            '   - Monitor for complications',
          ]
          
          ckdGuidelines.forEach(line => {
            if (yPos > 270) {
              doc.addPage()
              yPos = 20
            }
            doc.text(line, 14, yPos, { maxWidth: 180 })
            yPos += 5
          })
        }
        
        yPos += 5
        
        // General Prevention Guidelines
        doc.setFontSize(14)
        doc.setTextColor(46, 204, 113)
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        doc.text('Prevention Guidelines for All Patients:', 14, yPos)
        yPos += 10
        
        doc.setFontSize(10)
        doc.setTextColor(0)
        const preventionGuidelines = [
          '1. Healthy Diet:',
          '   - Eat plenty of fruits and vegetables',
          '   - Choose whole grains',
          '   - Limit processed foods and red meat',
          '   - Reduce salt and sugar intake',
          '',
          '2. Stay Active:',
          '   - Regular physical activity (150 minutes/week)',
          '   - Include both cardio and strength training',
          '   - Start slowly and increase gradually',
          '',
          '3. Regular Health Checkups:',
          '   - Annual comprehensive health screenings',
          '   - Monitor blood pressure and blood sugar',
          '   - Kidney function tests if at risk',
          '',
          '4. Hydration:',
          '   - Drink adequate water (8-10 glasses daily)',
          '   - Limit sugary drinks and caffeine',
          '',
          '5. Avoid Risk Factors:',
          '   - Limit alcohol consumption',
          '   - Avoid smoking and tobacco',
          '   - Manage stress through meditation or yoga',
          '   - Get adequate sleep (7-9 hours)',
        ]
        
        preventionGuidelines.forEach(line => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 14, yPos, { maxWidth: 180 })
          yPos += 5
        })
        
        // Page 3: Understanding CKD Stages
        doc.addPage()
        doc.setFontSize(16)
        doc.setTextColor(41, 128, 185)
        doc.text('Understanding Chronic Kidney Disease Stages', 105, 20, { align: 'center' })
        
        autoTable(doc, {
          startY: 30,
          head: [['Stage', 'GFR Range', 'Description', 'Action Required']],
          body: [
            ['Stage 1', '90+', 'Normal kidney function with kidney damage', 'Monitor, manage conditions'],
            ['Stage 2', '60-89', 'Mild reduction in kidney function', 'Regular monitoring, lifestyle changes'],
            ['Stage 3a', '45-59', 'Mild to moderate reduction', 'Medical management, dietary changes'],
            ['Stage 3b', '30-44', 'Moderate to severe reduction', 'Specialist care, prepare for treatment'],
            ['Stage 4', '15-29', 'Severe reduction', 'Pre-dialysis care, treatment planning'],
            ['Stage 5', '<15', 'Kidney failure', 'Dialysis or transplant required'],
          ],
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          styles: { fontSize: 9 },
        })
        
        yPos = doc.lastAutoTable.finalY + 15
        
        doc.setFontSize(14)
        doc.setTextColor(41, 128, 185)
        doc.text('Key Blood Test Parameters:', 14, yPos)
        yPos += 10
        
        autoTable(doc, {
          startY: yPos,
          head: [['Parameter', 'Normal Range', 'Significance']],
          body: [
            ['Serum Creatinine', '0.7-1.3 mg/dL (men)\n0.6-1.1 mg/dL (women)', 'Waste product filtered by kidneys'],
            ['Blood Urea Nitrogen', '7-20 mg/dL', 'Indicates kidney filtering ability'],
            ['GFR (eGFR)', '90+ mL/min/1.73m2', 'Overall kidney function measure'],
            ['Albumin', '3.5-5.5 g/dL', 'Protein levels in blood'],
            ['Hemoglobin', '13.5-17.5 g/dL (men)\n12-15.5 g/dL (women)', 'Oxygen-carrying capacity'],
          ],
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          styles: { fontSize: 8 },
          columnStyles: {
            2: { cellWidth: 60 }
          }
        })
        
        // Footer on all pages
        const pageCount = doc.internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(8)
          doc.setTextColor(150)
          doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' })
          doc.text('Medical Disclaimer: This report is for informational purposes only. Always consult healthcare professionals.', 105, 285, { align: 'center', maxWidth: 180 })
        }
        
        // Save PDF
        doc.save(`ckd_predictions_report_${new Date().getTime()}.pdf`)
      } catch (error) {
        console.error('Error generating PDF:', error)
        alert('Failed to generate PDF. Please try again.')
      }
    }
  }
  
  // Helper function to draw pie slice
  const drawPieSlice = (doc, centerX, centerY, radius, startAngle, endAngle) => {
    if (startAngle === endAngle) return
    
    const startRad = (startAngle - 90) * Math.PI / 180
    const endRad = (endAngle - 90) * Math.PI / 180
    
    // Begin path
    const path = []
    
    // Move to center
    path.push({ op: 'm', x: centerX, y: centerY })
    
    // Line to start of arc
    path.push({ 
      op: 'l', 
      x: centerX + radius * Math.cos(startRad), 
      y: centerY + radius * Math.sin(startRad) 
    })
    
    // Draw arc
    const steps = Math.max(50, Math.abs(endAngle - startAngle))
    for (let i = 1; i <= steps; i++) {
      const angle = startRad + (endRad - startRad) * i / steps
      path.push({
        op: 'l',
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      })
    }
    
    // Close path back to center
    path.push({ op: 'l', x: centerX, y: centerY })
    
    // Execute path
    doc.path(path, 'F')
  }

  const downloadSingleResult = () => {
    try {
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.setTextColor(41, 128, 185)
      doc.text('CKD Patient Prediction Report', 105, 20, { align: 'center' })
      
      // Date and patient info
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Patient: ${results.data.patientName || 'Anonymous'}`, 14, 35)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 41)
      
      // Prediction result box
      const boxY = 55
      const prediction = results.prediction === 'ckd' || results.prediction === 'CKD' ? 'CKD' : 'No CKD'
      const confidence = parseFloat(results.confidence)
      
      if (prediction === 'CKD') {
        doc.setFillColor(231, 76, 60) // Red for CKD
      } else {
        doc.setFillColor(46, 204, 113) // Green for No CKD
      }
      
      doc.rect(60, boxY, 90, 35, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.text(prediction, 105, boxY + 15, { align: 'center' })
      doc.setFontSize(14)
      doc.text(`Confidence: ${confidence}%`, 105, boxY + 28, { align: 'center' })
      
      // Patient Parameters Table
      autoTable(doc, {
        startY: 105,
        head: [['Parameter', 'Value', 'Parameter', 'Value']],
        body: [
          ['Age', `${results.data.age} years`, 'Blood Pressure', `${results.data.bp} mm/Hg`],
          ['Specific Gravity', results.data.sg, 'Albumin', results.data.al],
          ['Sugar', results.data.su, 'RBC', results.data.rbc],
          ['Pus Cell', results.data.pc, 'Pus Cell Clumps', results.data.pcc],
          ['Bacteria', results.data.ba, 'Blood Glucose', `${results.data.bgr} mgs/dl`],
          ['Blood Urea', `${results.data.bu} mgs/dl`, 'Serum Creatinine', `${results.data.sc} mgs/dl`],
          ['Sodium', `${results.data.sod} mEq/L`, 'Potassium', `${results.data.pot} mEq/L`],
          ['Hemoglobin', `${results.data.hemo} gms`, 'PCV', results.data.pcv],
          ['WBC Count', `${results.data.wc} cells/cumm`, 'RBC Count', `${results.data.rc} millions/cmm`],
          ['Hypertension', results.data.htn, 'Diabetes', results.data.dm],
          ['CAD', results.data.cad, 'Appetite', results.data.appet],
          ['Pedal Edema', results.data.pe, 'Anemia', results.data.ane],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
          2: { fontStyle: 'bold', fillColor: [240, 240, 240] }
        }
      })
      
      let yPos = doc.lastAutoTable.finalY + 15
      
      // Interpretation Section
      doc.setFontSize(14)
      doc.setTextColor(41, 128, 185)
      doc.text('Interpretation & Recommendations', 14, yPos)
      yPos += 10
      
      doc.setFontSize(10)
      doc.setTextColor(0)
      
      if (prediction === 'CKD') {
        const recommendations = [
          '⚠️ Chronic Kidney Disease Detected',
          '',
          'Immediate Actions Required:',
          '• Schedule an appointment with a nephrologist',
          '• Get comprehensive kidney function tests (eGFR, Creatinine)',
          '• Discuss treatment options and lifestyle modifications',
          '',
          'Dietary Modifications:',
          '• Reduce sodium intake (less than 2,300mg per day)',
          '• Limit protein intake as advised by your doctor',
          '• Control potassium and phosphorus levels',
          '• Stay well-hydrated (unless otherwise advised)',
          '',
          'Lifestyle Changes:',
          '• Maintain healthy blood pressure (below 130/80 mmHg)',
          '• Control blood sugar if diabetic (HbA1c < 7%)',
          '• Regular exercise (30 minutes, 5 days/week)',
          '• Quit smoking and limit alcohol consumption',
        ]
        
        recommendations.forEach(line => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 14, yPos, { maxWidth: 180 })
          yPos += 5
        })
      } else {
        const recommendations = [
          '✅ No Chronic Kidney Disease Detected',
          '',
          'Preventive Measures:',
          '• Maintain regular health check-ups',
          '• Continue healthy lifestyle practices',
          '• Monitor blood pressure and blood sugar levels',
          '• Stay well-hydrated (8-10 glasses daily)',
          '• Eat a balanced diet with fruits and vegetables',
          '• Regular exercise (150 minutes/week)',
          '• Limit processed foods and reduce salt intake',
          '• Avoid smoking and excessive alcohol',
          '• Manage stress through meditation or yoga',
          '• Get adequate sleep (7-9 hours)',
        ]
        
        recommendations.forEach(line => {
          if (yPos > 270) {
            doc.addPage()
            yPos = 20
          }
          doc.text(line, 14, yPos, { maxWidth: 180 })
          yPos += 5
        })
      }
      
      // Medical Disclaimer
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      
      yPos += 10
      doc.setFontSize(12)
      doc.setTextColor(231, 76, 60)
      doc.text('⚕️ Medical Disclaimer', 14, yPos)
      yPos += 8
      
      doc.setFontSize(9)
      doc.setTextColor(100)
      const disclaimer = 'This prediction is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions. The AI model provides predictions based on statistical patterns and should be used as a supplementary tool for clinical decision-making.'
      doc.text(disclaimer, 14, yPos, { maxWidth: 180, align: 'justify' })
      
      // Save PDF
      const patientName = results.data.patientName || 'patient'
      const fileName = `CKD_Report_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  if (results.type === 'single') {
    return (
      <div className="results-container">
        <div className="result-card single-result">
          <h2>Prediction Result</h2>
          
          <div className={`prediction-badge ${results.prediction === 'CKD' || results.prediction === 'ckd' ? 'ckd' : 'no-ckd'}`}>
            <span className="prediction-icon">
              {results.prediction === 'CKD' || results.prediction === 'ckd' ? '⚠️' : '✅'}
            </span>
            <div>
              <h3>{results.prediction === 'CKD' || results.prediction === 'ckd' ? 'CKD' : 'No CKD'}</h3>
              <p className="confidence">Confidence: {results.confidence}%</p>
            </div>
          </div>

          <div className="result-interpretation">
            <h4>Interpretation:</h4>
            {results.prediction === 'CKD' || results.prediction === 'ckd' ? (
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
                <span className="param-label">Patient Name:</span>
                <span className="param-value">{results.data.patientName || 'N/A'}</span>
              </div>
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

          <div className="action-buttons">
            <button onClick={downloadSingleResult} className="download-btn">
              📥 Download PDF Report
            </button>
            <button onClick={() => setResults(null)} className="back-btn">
              🔙 New Prediction
            </button>
          </div>
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
            📥 Download Results PDF
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

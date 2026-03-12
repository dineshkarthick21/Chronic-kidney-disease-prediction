import React, { useState, useEffect } from 'react'
import './LandingPage.css'

const LandingPage = ({ onGetStarted, onSignIn }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Medical/Healthcare themed images for CKD prediction
  const images = [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&h=1080&fit=crop', // Medical professionals
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920&h=1080&fit=crop', // Doctor with technology
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&h=1080&fit=crop', // Medical lab
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1920&h=1080&fit=crop', // Healthcare technology
    'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1920&h=1080&fit=crop', // Medical equipment
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=1920&h=1080&fit=crop', // Healthcare team
  ]

  useEffect(() => {
    // Rotate images every 2 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="landing-page light-theme">
      {/* Rotating Background Images */}
      <div className="image-carousel">
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel-image ${index === currentImageIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="carousel-overlay" />
      </div>

      {/* Carousel Indicators */}
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <div
            key={index}
            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>

      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">CKD Predictor</span>
          </div>
          <div className="nav-actions">
            <button className="nav-signin-btn" onClick={onSignIn}>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Predict Chronic Kidney Disease
              <span className="highlight"> with AI</span>
            </h1>
            <p className="hero-description">
              Advanced machine learning technology to predict chronic kidney disease risk. 
              Fast, accurate, and reliable predictions to help healthcare professionals 
              make informed decisions.
            </p>
            <div className="cta-buttons">
              <button className="cta-primary" onClick={onGetStarted}>
                Get Started
                <span className="arrow">→</span>
              </button>
              <button className="cta-secondary" onClick={onSignIn}>
                Sign In
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card card-1">
              <div className="card-icon">📊</div>
              <div className="card-text">AI Analysis</div>
            </div>
            <div className="visual-card card-2">
              <div className="card-icon">⚡</div>
              <div className="card-text">Fast Results</div>
            </div>
            <div className="visual-card card-3">
              <div className="card-icon">✓</div>
              <div className="card-text">High Accuracy</div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">Why Choose CKD Predictor?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Accurate Predictions</h3>
              <p className="feature-description">
                Powered by advanced machine learning algorithms trained on comprehensive medical data
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Instant Results</h3>
              <p className="feature-description">
                Get predictions in seconds with our optimized prediction engine
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3 className="feature-title">Batch Processing</h3>
              <p className="feature-description">
                Upload CSV files to analyze multiple patient data simultaneously
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure & Private</h3>
              <p className="feature-description">
                Your data is encrypted and protected with industry-standard security
              </p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Get Started?</h2>
            <p className="cta-text">
              Join healthcare professionals using AI-powered predictions
            </p>
            <button className="cta-button-large" onClick={onGetStarted}>
              Create Free Account
              <span className="arrow">→</span>
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2026 CKD Predictor. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default LandingPage

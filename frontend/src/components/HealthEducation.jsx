import { useState } from 'react'
import './HealthEducation.css'
import video1 from '../assets/Kidney videos/WhatsApp Video 2026-04-30 at 9.18.33 PM.mp4'
import video2 from '../assets/Kidney videos/WhatsApp Video 2026-04-30 at 9.20.58 PM (1).mp4'
import video3 from '../assets/Kidney videos/WhatsApp Video 2026-04-30 at 9.20.59 PM (2).mp4'
import video4 from '../assets/Kidney videos/WhatsApp Video 2026-04-30 at 9.20.59 PM.mp4'
import video5 from '../assets/Kidney videos/WhatsApp Video 2026-04-30 at 9.21.00 PM.mp4'
import video6 from '../assets/Kidney videos/WhatsApp Video 2026-04-30 at 9.21.07 PM.mp4'
import video7 from '../assets/Kidney videos/WhatsApp Video 2026-04-30 at 9.21.08 PM.mp4'
import video8 from '../assets/Kidney videos/WhatsApp Video 2026-04-30 at 9.21.09 PM.mp4'
import video9 from '../assets/Kidney videos/WhatsApp Video 2026-04-30 at 9.21.10 PM.mp4'

function HealthEducation({ user, onBack }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favoriteVideoIds, setFavoriteVideoIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favoriteEducationVideos') || '[]')
    } catch {
      return []
    }
  })
  // Local education videos stored in the project assets
  const videos = [
    // CKD BASICS (3 videos)
    {
      id: 1,
      title: 'Chronic Kidney Disease Explained',
      category: 'basics',
      duration: '—',
      thumbnail: '',
      videoUrl: video1,
      description: 'Understanding chronic kidney disease basics.',
      views: 'Local',
      date: 'Apr 2026'
    },
    {
      id: 2,
      title: 'How Your Kidneys Work',
      category: 'basics',
      duration: '—',
      thumbnail: '',
      videoUrl: video2,
      description: 'Kidney anatomy and function explained.',
      views: 'Local',
      date: 'Apr 2026'
    },
    {
      id: 3,
      title: 'Renal Function Tests',
      category: 'basics',
      duration: '—',
      thumbnail: '',
      videoUrl: video3,
      description: 'Understanding kidney function tests and measurements.',
      views: 'Local',
      date: 'Apr 2026'
    },
    // PREVENTION (2 videos)
    {
      id: 4,
      title: 'Preventing Kidney Disease',
      category: 'prevention',
      duration: '—',
      thumbnail: '',
      videoUrl: video4,
      description: 'Key strategies to prevent kidney disease.',
      views: 'Local',
      date: 'Apr 2026'
    },
    {
      id: 5,
      title: 'Blood Pressure and Kidney Health',
      category: 'prevention',
      duration: '—',
      thumbnail: '',
      videoUrl: video5,
      description: 'Managing hypertension for kidney protection.',
      views: 'Local',
      date: 'Apr 2026'
    },
    // DIET & NUTRITION (2 videos)
    {
      id: 6,
      title: 'Renal Diet - What to Eat',
      category: 'diet',
      duration: '—',
      thumbnail: '',
      videoUrl: video6,
      description: 'Kidney-friendly nutrition guide.',
      views: 'Local',
      date: 'Apr 2026'
    },
    {
      id: 7,
      title: 'Nutrition Management for CKD',
      category: 'diet',
      duration: '—',
      thumbnail: '',
      videoUrl: video7,
      description: 'Managing nutrition with chronic kidney disease.',
      views: 'Local',
      date: 'Apr 2026'
    },
    // TREATMENT (1 video)
    {
      id: 8,
      title: 'CKD Treatment Options',
      category: 'treatment',
      duration: '—',
      thumbnail: '',
      videoUrl: video8,
      description: 'Understanding treatment and management options.',
      views: 'Local',
      date: 'Apr 2026'
    },
    // LIFESTYLE (1 video)
    {
      id: 9,
      title: 'Living with Kidney Disease',
      category: 'lifestyle',
      duration: '—',
      thumbnail: '',
      videoUrl: video9,
      description: 'Tips for maintaining quality of life with CKD.',
      views: 'Local',
      date: 'Apr 2026'
    }
  ]

  const allVideos = [...videos]

  const categories = [
    { id: 'all', name: 'All Videos', icon: '🎥' },
    { id: 'basics', name: 'CKD Basics', icon: '📚' },
    { id: 'prevention', name: 'Prevention', icon: '🛡️' },
    { id: 'diet', name: 'Diet & Nutrition', icon: '🥗' },
    { id: 'treatment', name: 'Treatment', icon: '💊' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🏃' }
  ]

  const [selectedVideo, setSelectedVideo] = useState(null)

  const getVideoSrc = (video) => video.videoUrl

  const parseViews = (viewsValue) => {
    const normalized = (viewsValue || '0').toString().toUpperCase().trim()
    if (normalized.endsWith('M')) {
      return parseFloat(normalized) * 1000000
    }
    if (normalized.endsWith('K')) {
      return parseFloat(normalized) * 1000
    }
    return parseFloat(normalized) || 0
  }

  const persistFavorites = (ids) => {
    setFavoriteVideoIds(ids)
    localStorage.setItem('favoriteEducationVideos', JSON.stringify(ids))
  }

  const toggleFavorite = (videoId) => {
    const alreadyFavorite = favoriteVideoIds.includes(videoId)
    if (alreadyFavorite) {
      persistFavorites(favoriteVideoIds.filter((id) => id !== videoId))
      return
    }
    persistFavorites([...favoriteVideoIds, videoId])
  }

  const filteredVideos = allVideos
    .filter(video => {
      const matchesCategory = activeCategory === 'all' || video.category === activeCategory
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           video.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFavorites = !showFavoritesOnly || favoriteVideoIds.includes(video.id)
      return matchesCategory && matchesSearch && matchesFavorites
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date)
      }
      if (sortBy === 'duration') {
        return parseInt(b.duration, 10) - parseInt(a.duration, 10)
      }
      return parseViews(b.views) - parseViews(a.views)
    })

  const openVideoModal = (video) => {
    setSelectedVideo(video)
  }

  const closeVideoModal = () => {
    setSelectedVideo(null)
  }

  return (
    <div className="health-education-container">
      {/* Header */}
      <div className="education-header">
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <h1 className="education-title">
          <span className="title-icon">🎓</span>
          Health Education Center
        </h1>
      </div>

      {/* Hero Section */}
      <div className="education-hero">
        <div className="hero-content">
          <h2>Learn About Kidney Health</h2>
          <p>Watch expert videos on CKD prevention, treatment, and healthy living</p>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">{allVideos.length}</span>
            <span className="stat-label">Videos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">50+</span>
            <span className="stat-label">Hours</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Free</span>
            <span className="stat-label">Access</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" strokeWidth="2"/>
          </svg>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest First</option>
            <option value="duration">Longest Duration</option>
          </select>
          <button
            className={`favorites-toggle ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly((prev) => !prev)}
          >
            {showFavoritesOnly ? 'Show All' : `Favorites (${favoriteVideoIds.length})`}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <span className="category-count">
              {category.id === 'all' 
                ? videos.length 
                : videos.filter(v => v.category === category.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="videos-grid">
        {filteredVideos.length > 0 ? (
          filteredVideos.map(video => (
            <div key={video.id} className="video-card" onClick={() => openVideoModal(video)}>
              <div className="video-thumbnail">
                <button
                  className={`favorite-btn ${favoriteVideoIds.includes(video.id) ? 'active' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    toggleFavorite(video.id)
                  }}
                  title="Save to favorites"
                >
                  {favoriteVideoIds.includes(video.id) ? '★' : '☆'}
                </button>
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} />
                ) : (
                  <video
                    className="video-preview"
                    src={getVideoSrc(video)}
                    muted
                    preload="metadata"
                  />
                )}
                <div className="video-duration">{video.duration}</div>
                <div className="play-overlay">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
              </div>
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-description">{video.description}</p>
                <div className="video-meta">
                  <span className="video-views">👁️ {video.views} views</span>
                  <span className="video-date">📅 {video.date}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" strokeWidth="2"/>
            </svg>
            <h3>No videos found</h3>
            <p>Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal" onClick={closeVideoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeVideoModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
              </svg>
            </button>
            <div className="modal-video">
              <video
                src={getVideoSrc(selectedVideo)}
                controls
                autoPlay
                playsInline
              />
            </div>
            <div className="modal-info">
              <h2>{selectedVideo.title}</h2>
              <div className="modal-meta">
                <span>👁️ {selectedVideo.views} views</span>
                <span>📅 {selectedVideo.date}</span>
                <span>⏱️ {selectedVideo.duration}</span>
              </div>
              <p>{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Educational Tips Section */}
      <div className="education-tips">
        <h2>💡 Quick Health Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <span className="tip-icon">💧</span>
            <h3>Stay Hydrated</h3>
            <p>Drink 8-10 glasses of water daily unless restricted by your doctor</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">🥗</span>
            <h3>Eat Healthy</h3>
            <p>Follow a kidney-friendly diet low in sodium and processed foods</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">🏃</span>
            <h3>Exercise Regularly</h3>
            <p>30 minutes of moderate activity 5 days a week</p>
          </div>
          <div className="tip-card">
            <span className="tip-icon">💊</span>
            <h3>Take Medications</h3>
            <p>Always take prescribed medications as directed</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthEducation

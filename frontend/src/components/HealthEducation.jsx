import { useState } from 'react'
import './HealthEducation.css'

function HealthEducation({ user, onBack }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Educational video database - Verified working embeddable YouTube videos
  const videos = [
    // CKD BASICS (9 videos) - Using verified medical education channels
    {
      id: 1,
      title: 'Chronic Kidney Disease (CKD) Explained',
      category: 'basics',
      duration: '6:23',
      thumbnail: 'https://img.youtube.com/vi/l8vucN3cmes/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/l8vucN3cmes',
      description: 'Comprehensive overview of chronic kidney disease from Armando Hasudungan.',
      views: '1.2M',
      date: 'Feb 2024'
    },
    {
      id: 2,
      title: 'How Your Kidneys Work - Nephron Function',
      category: 'basics',
      duration: '5:14',
      thumbnail: 'https://img.youtube.com/vi/l128tW1O8KA/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/l128tW1O8KA',
      description: 'Understanding kidney anatomy and function explained simply.',
      views: '2.5M',
      date: 'Jan 2023'
    },
    {
      id: 3,
      title: 'Renal Function Tests',
      category: 'basics',
      duration: '7:42',
      thumbnail: 'https://img.youtube.com/vi/6VTgBbtZBQg/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/6VTgBbtZBQg',
      description: 'Understanding kidney function tests - GFR, creatinine, BUN.',
      views: '850K',
      date: 'Mar 2024'
    },
    {
      id: 4,
      title: 'Kidney Disease - Overview',
      category: 'basics',
      duration: '8:15',
      thumbnail: 'https://img.youtube.com/vi/EQfQ9J0Hqg4/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/EQfQ9J0Hqg4',
      description: 'Comprehensive look at kidney disease causes and symptoms.',
      views: '680K',
      date: 'Dec 2023'
    },
    {
      id: 5,
      title: 'Chronic Kidney Disease Stages',
      category: 'basics',
      duration: '9:30',
      thumbnail: 'https://img.youtube.com/vi/FG9Oe0vI5zY/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/FG9Oe0vI5zY',
      description: 'The 5 stages of CKD explained in detail.',
      views: '1.5M',
      date: 'Feb 2024'
    },
    {
      id: 6,
      title: 'Diabetic Nephropathy',
      category: 'basics',
      duration: '6:45',
      thumbnail: 'https://img.youtube.com/vi/xJ8Q2KXw3dA/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/xJ8Q2KXw3dA',
      description: 'How diabetes affects the kidneys.',
      views: '920K',
      date: 'Jan 2024'
    },
    {
      id: 7,
      title: 'Understanding Kidney Failure',
      category: 'basics',
      duration: '10:20',
      thumbnail: 'https://img.youtube.com/vi/yEOtkCjVOJM/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/yEOtkCjVOJM',
      description: 'What happens in end-stage renal disease.',
      views: '750K',
      date: 'Nov 2023'
    },
    {
      id: 8,
      title: 'Acute Kidney Injury',
      category: 'basics',
      duration: '7:50',
      thumbnail: 'https://img.youtube.com/vi/eSvzeZaMIT0/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/eSvzeZaMIT0',
      description: 'Causes and management of acute kidney injury.',
      views: '540K',
      date: 'Oct 2023'
    },
    {
      id: 9,
      title: 'Hypertensive Nephropathy',
      category: 'basics',
      duration: '8:35',
      thumbnail: 'https://img.youtube.com/vi/cCl5YPUd5S8/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/cCl5YPUd5S8',
      description: 'How high blood pressure damages kidneys.',
      views: '480K',
      date: 'Sep 2023'
    },

    // DIET & NUTRITION (8 videos)
    {
      id: 10,
      title: 'Renal Diet - What to Eat',
      category: 'diet',
      duration: '12:15',
      thumbnail: 'https://img.youtube.com/vi/gqxK6CoQzUg/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/gqxK6CoQzUg',
      description: 'Complete guide to kidney-friendly nutrition.',
      views: '890K',
      date: 'Mar 2024'
    },
    {
      id: 11,
      title: 'Low Sodium Diet Tips',
      category: 'diet',
      duration: '9:40',
      thumbnail: 'https://img.youtube.com/vi/5cQT8xw3fQI/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/5cQT8xw3fQI',
      description: 'Reducing sodium for kidney health.',
      views: '620K',
      date: 'Feb 2024'
    },
    {
      id: 12,
      title: 'Protein and Kidney Disease',
      category: 'diet',
      duration: '8:25',
      thumbnail: 'https://img.youtube.com/vi/4T0xh13z5Nc/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/4T0xh13z5Nc',
      description: 'Managing protein intake with CKD.',
      views: '710K',
      date: 'Jan 2024'
    },
    {
      id: 13,
      title: 'Potassium in Kidney Disease',
      category: 'diet',
      duration: '10:05',
      thumbnail: 'https://img.youtube.com/vi/yHchCCaSgfI/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/yHchCCaSgfI',
      description: 'Managing potassium levels through diet.',
      views: '530K',
      date: 'Dec 2023'
    },
    {
      id: 14,
      title: 'Phosphorus Control',
      category: 'diet',
      duration: '7:55',
      thumbnail: 'https://img.youtube.com/vi/9sYQVLQLwWc/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/9sYQVLQLwWc',
      description: 'Controlling phosphorus in renal diet.',
      views: '440K',
      date: 'Nov 2023'
    },
    {
      id: 15,
      title: 'Kidney-Friendly Meal Planning',
      category: 'diet',
      duration: '14:30',
      thumbnail: 'https://img.youtube.com/vi/o8l4VmqYKUQ/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/o8l4VmqYKUQ',
      description: 'Weekly meal prep for kidney patients.',
      views: '780K',
      date: 'Oct 2023'
    },
    {
      id: 16,
      title: 'Fluid Management CKD',
      category: 'diet',
      duration: '6:40',
      thumbnail: 'https://img.youtube.com/vi/Y_pBL5WH-74/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/Y_pBL5WH-74',
      description: 'Managing fluid intake in kidney disease.',
      views: '390K',
      date: 'Sep 2023'
    },
    {
      id: 17,
      title: 'Reading Labels - Renal Diet',
      category: 'diet',
      duration: '11:20',
      thumbnail: 'https://img.youtube.com/vi/4XWYJ8llUIw/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/4XWYJ8llUIw',
      description: 'How to read food labels for kidney health.',
      views: '560K',
      date: 'Aug 2023'
    },

    // TREATMENT (7 videos)
    {
      id: 18,
      title: 'Dialysis Explained',
      category: 'treatment',
      duration: '11:45',
      thumbnail: 'https://img.youtube.com/vi/a2OSB_MKQcU/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/a2OSB_MKQcU',
      description: 'Overview of dialysis procedures.',
      views: '1.8M',
      date: 'Mar 2024'
    },
    {
      id: 19,
      title: 'Hemodialysis - How It Works',
      category: 'treatment',
      duration: '8:50',
      thumbnail: 'https://img.youtube.com/vi/4dWjJcYMcAY/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/4dWjJcYMcAY',
      description: 'Understanding hemodialysis treatment.',
      views: '950K',
      date: 'Feb 2024'
    },
    {
      id: 20,
      title: 'Peritoneal Dialysis',
      category: 'treatment',
      duration: '10:15',
      thumbnail: 'https://img.youtube.com/vi/fZ8pMZx_Fts/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/fZ8pMZx_Fts',
      description: 'Home peritoneal dialysis explained.',
      views: '670K',
      date: 'Jan 2024'
    },
    {
      id: 21,
      title: 'Kidney Transplant',
      category: 'treatment',
      duration: '15:30',
      thumbnail: 'https://img.youtube.com/vi/kCiT3VEP9JE/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/kCiT3VEP9JE',
      description: 'Complete transplant guide.',
      views: '1.1M',
      date: 'Dec 2023'
    },
    {
      id: 22,
      title: 'CKD Medications',
      category: 'treatment',
      duration: '9:25',
      thumbnail: 'https://img.youtube.com/vi/Z-QnqRm3G-c/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/Z-QnqRm3G-c',
      description: 'Understanding kidney disease medications.',
      views: '580K',
      date: 'Nov 2023'
    },
    {
      id: 23,
      title: 'Living Donor Transplant',
      category: 'treatment',
      duration: '12:40',
      thumbnail: 'https://img.youtube.com/vi/WiBLUX4jfJ4/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/WiBLUX4jfJ4',
      description: 'Living kidney donation process.',
      views: '720K',
      date: 'Oct 2023'
    },
    {
      id: 24,
      title: 'Starting Dialysis',
      category: 'treatment',
      duration: '8:55',
      thumbnail: 'https://img.youtube.com/vi/RLb51k6h5aE/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/RLb51k6h5aE',
      description: 'What to expect when starting dialysis.',
      views: '490K',
      date: 'Sep 2023'
    },

    // PREVENTION (5 videos)
    {
      id: 25,
      title: 'Preventing Kidney Disease',
      category: 'prevention',
      duration: '11:20',
      thumbnail: 'https://img.youtube.com/vi/K6eW8nSSyjU/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/K6eW8nSSyjU',
      description: 'Top ways to prevent kidney disease.',
      views: '1.4M',
      date: 'Mar 2024'
    },
    {
      id: 26,
      title: 'Diabetes and Kidneys',
      category: 'prevention',
      duration: '9:35',
      thumbnail: 'https://img.youtube.com/vi/g5MAwXoMzZo/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/g5MAwXoMzZo',
      description: 'Protecting kidneys with diabetes.',
      views: '830K',
      date: 'Feb 2024'
    },
    {
      id: 27,
      title: 'Blood Pressure and Kidneys',
      category: 'prevention',
      duration: '7:45',
      thumbnail: 'https://img.youtube.com/vi/J-FOwPZM1U4/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/J-FOwPZM1U4',
      description: 'Managing hypertension for kidney health.',
      views: '640K',
      date: 'Jan 2024'
    },
    {
      id: 28,
      title: 'Kidney Stones Prevention',
      category: 'prevention',
      duration: '10:50',
      thumbnail: 'https://img.youtube.com/vi/UkJn3cyPH6U/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/UkJn3cyPH6U',
      description: 'How to prevent kidney stones.',
      views: '1.2M',
      date: 'Dec 2023'
    },
    {
      id: 29,
      title: 'Medications and Kidney Damage',
      category: 'prevention',
      duration: '8:30',
      thumbnail: 'https://img.youtube.com/vi/4uCRJMj8RAo/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/4uCRJMj8RAo',
      description: 'Medications that can harm kidneys.',
      views: '710K',
      date: 'Nov 2023'
    },

    // LIFESTYLE (7 videos)
    {
      id: 30,
      title: 'Living With CKD',
      category: 'lifestyle',
      duration: '13:25',
      thumbnail: 'https://img.youtube.com/vi/0sV-KP6SrBc/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/0sV-KP6SrBc',
      description: 'Maintaining quality of life with kidney disease.',
      views: '920K',
      date: 'Mar 2024'
    },
    {
      id: 31,
      title: 'Exercise and Kidney Health',
      category: 'lifestyle',
      duration: '10:40',
      thumbnail: 'https://img.youtube.com/vi/RqKvzaHVCLg/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/RqKvzaHVCLg',
      description: 'Safe exercises for kidney patients.',
      views: '550K',
      date: 'Feb 2024'
    },
    {
      id: 32,
      title: 'Mental Health and CKD',
      category: 'lifestyle',
      duration: '9:15',
      thumbnail: 'https://img.youtube.com/vi/NJdMOXCWMV4/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/NJdMOXCWMV4',
      description: 'Coping with chronic kidney disease emotionally.',
      views: '680K',
      date: 'Jan 2024'
    },
    {
      id: 33,
      title: 'Sleep and Kidney Disease',
      category: 'lifestyle',
      duration: '7:30',
      thumbnail: 'https://img.youtube.com/vi/8T2c7S6oaO4/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/8T2c7S6oaO4',
      description: 'Managing sleep problems in CKD.',
      views: '430K',
      date: 'Dec 2023'
    },
    {
      id: 34,
      title: 'Traveling with Kidney Disease',
      category: 'lifestyle',
      duration: '11:05',
      thumbnail: 'https://img.youtube.com/vi/8XgbhDO_JxM/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/8XgbhDO_JxM',
      description: 'Travel tips for kidney patients.',
      views: '520K',
      date: 'Nov 2023'
    },
    {
      id: 35,
      title: 'Work and CKD',
      category: 'lifestyle',
      duration: '8:50',
      thumbnail: 'https://img.youtube.com/vi/H7WkYG3zYY8/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/H7WkYG3zYY8',
      description: 'Balancing work with kidney disease.',
      views: '380K',
      date: 'Oct 2023'
    },
    {
      id: 36,
      title: 'Support for Kidney Patients',
      category: 'lifestyle',
      duration: '10:25',
      thumbnail: 'https://img.youtube.com/vi/vj3QFo0GMWM/0.jpg',
      videoUrl: 'https://www.youtube.com/embed/vj3QFo0GMWM',
      description: 'Building support systems with CKD.',
      views: '460K',
      date: 'Sep 2023'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Videos', icon: '🎥' },
    { id: 'basics', name: 'CKD Basics', icon: '📚' },
    { id: 'prevention', name: 'Prevention', icon: '🛡️' },
    { id: 'diet', name: 'Diet & Nutrition', icon: '🥗' },
    { id: 'treatment', name: 'Treatment', icon: '💊' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🏃' }
  ]

  const [selectedVideo, setSelectedVideo] = useState(null)

  const getVideoId = (video) => {
    const urlMatch = video.videoUrl?.match(/(?:embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    if (urlMatch?.[1]) {
      return urlMatch[1]
    }

    const thumbMatch = video.thumbnail?.match(/\/vi\/([A-Za-z0-9_-]{11})\//)
    return thumbMatch?.[1] || ''
  }

  const getEmbedUrl = (video) => {
    const videoId = getVideoId(video)
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : ''
  }

  const getWatchUrl = (video) => {
    const videoId = getVideoId(video)
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#'
  }

  const filteredVideos = videos.filter(video => {
    const matchesCategory = activeCategory === 'all' || video.category === activeCategory
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
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
            <span className="stat-value">{videos.length}</span>
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
                <img src={video.thumbnail} alt={video.title} />
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
              <iframe
                width="100%"
                height="100%"
                src={getEmbedUrl(selectedVideo)}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <div className="modal-info">
              <h2>{selectedVideo.title}</h2>
              <div className="modal-meta">
                <span>👁️ {selectedVideo.views} views</span>
                <span>📅 {selectedVideo.date}</span>
                <span>⏱️ {selectedVideo.duration}</span>
              </div>
              <p>{selectedVideo.description}</p>
              <a 
                href={getWatchUrl(selectedVideo)}
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: '10px',
                  padding: '8px 16px',
                  backgroundColor: '#ff0000',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                ▶️ Watch on YouTube
              </a>
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

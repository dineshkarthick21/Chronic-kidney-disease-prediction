import { useState, useEffect } from 'react'
import './Loader.css'

const Loader = ({ message = 'Loading...', subMessage = 'Please wait', onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          onComplete()
        }, 500)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div className={`loader-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <svg className="pl" viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pl-grad1" x1="1" y1="0.5" x2="0" y2="0.5">
            <stop offset="0%" stopColor="hsl(313,90%,55%)" />
            <stop offset="100%" stopColor="hsl(223,90%,55%)" />
          </linearGradient>
          <linearGradient id="pl-grad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(313,90%,55%)" />
            <stop offset="100%" stopColor="hsl(223,90%,55%)" />
          </linearGradient>
        </defs>
        <circle className="pl__ring pl__ring--a" cx="100" cy="100" r="105" fill="none" stroke="#000" strokeWidth="20" strokeDasharray="0 660" strokeDashoffset="-330" strokeLinecap="round" />
        <circle className="pl__ring pl__ring--b" cx="100" cy="100" r="35" fill="none" stroke="#000" strokeWidth="20" strokeDasharray="0 220" strokeDashoffset="-110" strokeLinecap="round" />
        <circle className="pl__ring pl__ring--c" cx="100" cy="100" r="70" fill="none" stroke="#000" strokeWidth="20" strokeDasharray="0 440" strokeLinecap="round" />
        <circle className="pl__ring pl__ring--d" cx="100" cy="100" r="70" fill="none" stroke="#000" strokeWidth="20" strokeDasharray="0 440" strokeLinecap="round" />
      </svg>
      <div className="loader-text">{message}</div>
      {subMessage && <div className="loader-subtext">{subMessage}</div>}
    </div>
  )
}

export default Loader

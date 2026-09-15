import { useEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import './PageTransition.css'

export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()
  const [displayOutlet, setDisplayOutlet] = useState(outlet)
  const [displayKey, setDisplayKey] = useState(location.pathname)
  const [phase, setPhase] = useState<'idle' | 'cover' | 'reveal'>('idle')

  useEffect(() => {
    if (location.pathname === displayKey) return

    setPhase('cover')
    const coverTimer = window.setTimeout(() => {
      setDisplayOutlet(outlet)
      setDisplayKey(location.pathname)
      setPhase('reveal')
    }, 300)

    const revealTimer = window.setTimeout(() => {
      setPhase('idle')
    }, 300 + 500)

    return () => {
      window.clearTimeout(coverTimer)
      window.clearTimeout(revealTimer)
    }
  }, [location.pathname, outlet, displayKey])

  return (
    <div className="page-transition">
      <div key={displayKey} className="page-transition__content">
        {displayOutlet}
      </div>
      <div
        className={`page-transition__curtain is-${phase}`}
        aria-hidden="true"
      />
    </div>
  )
}

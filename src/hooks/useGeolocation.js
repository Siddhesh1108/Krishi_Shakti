import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null) // { lat, lon }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    const success = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      })
      setLoading(false)
    }

    const handleError = (error) => {
      console.warn('Geolocation error:', error.message)
      setError(error.message)
      setLoading(false)
    }

    navigator.geolocation.getCurrentPosition(success, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    })
  }, [])

  return { location, loading, error }
}

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginButton() {
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // We could check initial state, but for dev this is fine
  const router = useRouter()

  const handleLogin = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'dev@payloadcms.com',
          password: 'test',
        }),
      })

      if (res.ok) {
        setIsLoggedIn(true)
        alert('Logged in successfully as dev@payloadcms.com!')
        router.refresh()
      } else {
        alert('Failed to login.')
      }
    } catch (e) {
      alert('Error logging in.')
    } finally {
      setLoading(false)
    }
  }

  if (isLoggedIn) {
    return <span className="nav-link" style={{ color: 'var(--lfrs-star-active)' }}>Logged in ✓</span>
  }

  return (
    <button onClick={handleLogin} disabled={loading} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
      {loading ? 'Logging in...' : 'Login to Test'}
    </button>
  )
}

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setLoading(true)
      await fetch('/api/users/logout', { method: 'POST' })
      router.push('/posts')
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleLogout} disabled={loading} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  )
}

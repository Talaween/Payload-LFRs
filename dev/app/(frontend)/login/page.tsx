'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return setError('Please enter both email and password.')
    
    try {
      setLoading(true)
      setError('')
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push('/posts')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to login.')
      }
    } catch (e) {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
      <h1 className="page-title">Login</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Welcome back. Please login to your account.
      </p>
      
      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white', fontFamily: 'inherit' }} 
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'white', fontFamily: 'inherit' }} 
            placeholder="••••••••"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="btn-fav" 
          style={{ justifyContent: 'center', marginTop: '1rem' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>
        Don't have an account? <Link href="/register" style={{ color: 'var(--primary)' }}>Register here</Link>
      </div>
    </div>
  )
}

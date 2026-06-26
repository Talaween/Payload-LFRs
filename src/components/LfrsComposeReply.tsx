'use client'

import React, { useState } from 'react'

import styles from './styles/lfrs.module.css'

/**
 * Props for the `LfrsComposeReply` component.
 */
export interface LfrsComposeReplyProps {
  /** The base path of the REST API (defaults to '/api') */
  apiBase?: string
  /** Optional CSS class name to apply to the root form element */
  className?: string
  /** Callback triggered when the API returns a 401 Unauthorized status */
  onAuthError?: () => void
  /** Callback triggered when the cancel button is clicked. If not provided, the cancel button is omitted. */
  onCancel?: () => void
  /** Callback triggered after a reply is successfully submitted */
  onSuccess?: () => void
  /** The unique identifier of the review being replied to */
  reviewId: string
}

/**
 * `LfrsComposeReply` is a form component for composing and submitting a reply to a review.
 * 
 * **Component Purpose:**
 * - Allows users to write comments/replies to existing reviews.
 * - Handles the API submission to the reply endpoint.
 * - Displays error messages and submission/loading states.
 * 
 * **User Interaction:**
 * - **Typing:** Users can enter their reply in the required textarea.
 * - **Submitting:** Submitting the form triggers an asynchronous POST request to `${apiBase}/lfrs/reply`.
 * - **Canceling:** Users can abort composing by clicking the "Cancel" button (if `onCancel` is provided).
 * - **State Feedback:** The submit button disables during loading or when the input is empty/whitespace.
 */
export const LfrsComposeReply: React.FC<LfrsComposeReplyProps> = ({
  apiBase = '/api',
  className = '',
  onAuthError,
  onCancel,
  onSuccess,
  reviewId,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [body, setBody] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) {
      setError('Please write a reply')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${apiBase}/lfrs/reply`, {
        body: JSON.stringify({ body, reviewId }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!res.ok) {
        if (res.status === 401 && onAuthError) {
          onAuthError()
          return
        }
        const err = await res.json()
        throw new Error(err.error || 'Failed to submit reply')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={`${styles.composeForm} ${className}`} onSubmit={handleSubmit}>
      {error && <div style={{ color: 'var(--lfrs-dislike-active)', fontSize: '14px' }}>{error}</div>}

      <textarea
        aria-label="Reply body"
        className={styles.composeTextarea}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a reply..."
        required
        value={body}
      />

      <div className={styles.composeActions}>
        {onCancel && (
          <button
            className={`${styles.button} ${styles.buttonSecondary}`}
            disabled={loading}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        )}
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={loading || !body.trim()}
          type="submit"
        >
          {loading ? 'Submitting...' : 'Submit Reply'}
        </button>
      </div>
    </form>
  )
}

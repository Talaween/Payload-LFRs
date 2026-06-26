'use client'

import React, { useState } from 'react'

import { LfrsRating } from './LfrsRating.js'
import styles from './styles/lfrs.module.css'

/**
 * Props for the `LfrsComposeReview` component.
 */
export interface LfrsComposeReviewProps {
  /** The base path of the REST API (defaults to '/api') */
  apiBase?: string
  /** Optional CSS class name to apply to the root form element */
  className?: string
  /** Pre-filled review data used when editing an existing review */
  initialData?: {
    body?: string
    id?: string
    score?: number
    title?: string
  }
  /** Whether rating selection (e.g. stars) is enabled (defaults to true) */
  enableReviewRating?: boolean
  /** Whether media file uploads are enabled (defaults to false) */
  mediaEnabled?: boolean
  /** Callback triggered when the API returns a 401 Unauthorized status */
  onAuthError?: () => void
  /** Callback triggered when the cancel button is clicked. If not provided, the cancel button is omitted. */
  onCancel?: () => void
  /** Callback triggered after the review is successfully submitted */
  onSuccess?: () => void
  /** Configuration options for the rating stars/hearts (defaults to 5 stars) */
  ratingConfig?: { icon: string; max: number; step: number }
  /** The slug of the Payload CMS collection containing the reviewed item (e.g. 'posts', 'products') */
  targetCollection: string
  /** The unique ID of the specific item being reviewed within targetCollection */
  targetDoc: string
}

/**
 * `LfrsComposeReview` is a form component for creating or editing reviews.
 * 
 * **Component Purpose:**
 * - Allows users to write reviews, provide ratings, and add optional titles for specific collection documents.
 * - Handles API submission to create or update a review.
 * - Displays error messages and submission states.
 * 
 * **User Interaction:**
 * - **Rating Selection:** Users can click icons (e.g., stars or hearts) to choose their rating (if `enableReviewRating` is true).
 * - **Input Fields:** Users can enter an optional title and a required review body description.
 * - **Submitting:** Submitting the form triggers a POST request to `${apiBase}/lfrs/review`.
 * - **Canceling:** Users can abort composition by clicking the "Cancel" button (if `onCancel` is provided).
 */
export const LfrsComposeReview: React.FC<LfrsComposeReviewProps> = ({
  apiBase = '/api',
  className = '',
  enableReviewRating = true,
  initialData,
  mediaEnabled = false,
  onAuthError,
  onCancel,
  onSuccess,
  ratingConfig = { icon: 'star', max: 5, step: 1 },
  targetCollection,
  targetDoc,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const [score, setScore] = useState(initialData?.score ?? 0)
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [body, setBody] = useState(initialData?.body ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (enableReviewRating && score === 0) {
      setError('Please select a rating')
      return
    }
    if (!body.trim()) {
      setError('Please write a review')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${apiBase}/lfrs/review`, {
        body: JSON.stringify({
          id: targetDoc,
          body,
          collection: targetCollection,
          reviewId: initialData?.id,
          score: enableReviewRating ? score : undefined,
          title,
          // media arrays would go here if we implemented the upload flow
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      if (!res.ok) {
        if (res.status === 401 && onAuthError) {
          onAuthError()
          return
        }
        const err = await res.json()
        throw new Error(err.error || 'Failed to submit review')
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
      <h3 style={{ margin: 0 }}>{initialData?.id ? 'Edit your review' : 'Write a review'}</h3>
      
      {error && <div style={{ color: 'var(--lfrs-dislike-active)', fontSize: '14px' }}>{error}</div>}

      {enableReviewRating && (
        <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
          <span>Rating:</span>
          <LfrsRating
            icon={ratingConfig.icon}
            max={ratingConfig.max}
            onChange={setScore}
            step={ratingConfig.step}
            value={score}
          />
        </div>
      )}

      <input
        aria-label="Review title"
        className={styles.composeInput}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title (optional)"
        type="text"
        value={title}
      />

      <textarea
        aria-label="Review body"
        className={styles.composeTextarea}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What did you think?"
        required
        value={body}
      />

      {mediaEnabled && (
        <div style={{ color: 'var(--lfrs-text-muted)', fontSize: '12px' }}>
          (Media upload placeholder - requires integration with Payload upload endpoint)
        </div>
      )}

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
          disabled={loading || (enableReviewRating && score === 0) || !body.trim()}
          type="submit"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  )
}

'use client'

import React, { useState } from 'react'

import { LfrsComposeReply } from './LfrsComposeReply.js'
import { LfrsRating } from './LfrsRating.js'
import { LfrsReplyCard } from './LfrsReplyCard.js'
import styles from './styles/lfrs.module.css'
import { formatRelativeTime } from '../utilities/formatRelativeTime.js'

/**
 * Props for the `LfrsReviewCard` component.
 */
export interface LfrsReviewCardProps {
  /** The base path of the REST API (defaults to '/api') */
  apiBase?: string
  /** Optional CSS class name to apply to the card container */
  className?: string
  /** Callback triggered when the API returns a 401 Unauthorized status */
  onAuthError?: () => void
  /** Callback triggered after a nested reply is successfully submitted */
  onReplySuccess?: () => void
  /** Configuration settings for displaying ratings (icon shape, scale max, step increments) */
  ratingConfig: { icon: string; max: number; step: number }
  /** Whether the user is allowed to reply to this review (defaults to false) */
  repliesEnabled?: boolean
  /** The review details object (contains user info, body text, title, rating score, media list, and existing replies list) */
  review: any
  /** Optional inline styles to apply to the card container */
  style?: React.CSSProperties
}

/**
 * `LfrsReviewCard` displays a review including user metadata, body, score rating, and media attachments.
 * 
 * **Component Purpose:**
 * - Formats and displays a review's rating score (via `LfrsRating`), title, description, and relative timestamp.
 * - Renders a grid of attached media images (if any).
 * - Renders a list of nested replies (via `LfrsReplyCard`).
 * - Manages an inline reply form toggle.
 * 
 * **User Interaction:**
 * - **Toggling Reply Form:** Click the "Reply" action link (if `repliesEnabled` is true) to toggle the compose form (`LfrsComposeReply`).
 * - **Composing Reply:** Interact with the inline text input and buttons to submit a reply.
 */
export const LfrsReviewCard: React.FC<LfrsReviewCardProps> = React.memo(
  ({
    apiBase = '/api',
    className = '',
    onAuthError,
    onReplySuccess,
    ratingConfig,
    repliesEnabled = false,
    review,
    style,
  }) => {
    const [isReplying, setIsReplying] = useState(false)

    const authorName = review.user?.name || review.user?.email || 'Anonymous'
    const dateStr = formatRelativeTime(review.createdAt)

    const handleReplySuccess = () => {
      setIsReplying(false)
      onReplySuccess?.()
    }

    return (
      <div className={`${styles.reviewCard} ${className}`} style={style}>
        <div className={styles.reviewHeader}>
          <div>
            <div className={styles.reviewAuthor}>{authorName}</div>
            {typeof review.score === 'number' && (
              <div style={{ marginTop: '4px' }}>
                <LfrsRating
                  icon={ratingConfig.icon}
                  max={ratingConfig.max}
                  readonly
                  step={ratingConfig.step}
                  value={review.score}
                />
              </div>
            )}
          </div>
          <div className={styles.reviewDate}>{dateStr}</div>
        </div>

        {review.title && <h4 className={styles.reviewTitle}>{review.title}</h4>}
        <p className={styles.reviewBody}>{review.body}</p>

        {review.media && review.media.length > 0 && (
          <div className={styles.reviewMedia}>
            {review.media.map((item: any, idx: number) => {
              if (!item.file?.url) {
                return null
              }
              return (
                <img
                  alt="Review attachment"
                  className={styles.reviewMediaItem}
                  key={idx}
                  src={item.file.url}
                />
              )
            })}
          </div>
        )}

        {repliesEnabled && (
          <div className={styles.reviewActions}>
            <button
              className={styles.buttonText}
              onClick={() => setIsReplying(!isReplying)}
              type="button"
            >
              Reply
            </button>
          </div>
        )}

        {isReplying && (
          <div style={{ marginTop: '16px' }}>
            <LfrsComposeReply
              apiBase={apiBase}
              onAuthError={onAuthError}
              onCancel={() => setIsReplying(false)}
              onSuccess={handleReplySuccess}
              reviewId={review.id}
            />
          </div>
        )}

        {review.replies && review.replies.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            {review.replies.map((reply: any) => (
              <LfrsReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>
    )
  },
)

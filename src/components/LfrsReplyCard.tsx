'use client'

import React from 'react'

import styles from './styles/lfrs.module.css'
import { formatRelativeTime } from '../utilities/formatRelativeTime.js'

/**
 * Props for the `LfrsReplyCard` component.
 */
export interface LfrsReplyCardProps {
  /** Optional CSS class name to apply to the card container */
  className?: string
  /** The reply details object (contains `user` info, `createdAt` timestamp, and `body` text) */
  reply: any
  /** Optional inline styles to apply to the card container */
  style?: React.CSSProperties
  /** The currently logged-in user's ID, to determine ownership */
  currentUserId?: string
  /** Callback triggered when the edit button is clicked */
  onEdit?: (reply: any) => void
}

/**
 * `LfrsReplyCard` is a presentational card that displays a single reply to a review.
 * 
 * **Component Purpose:**
 * - Formats and renders a reply's metadata (author name or email, relative timestamp).
 * - Displays the text body of the reply.
 * 
 * **User Interaction:**
 * - This component is **read-only** and does not support user interactions.
 */
export const LfrsReplyCard: React.FC<LfrsReplyCardProps> = React.memo(
  ({ className = '', currentUserId, onEdit, reply, style }) => {
    const authorName = reply.user?.name || reply.user?.email || 'Anonymous'
    const dateStr = formatRelativeTime(reply.createdAt)

    return (
      <div className={`${styles.replyCard} ${className}`} style={style}>
        <div className={styles.reviewHeader}>
          <div className={styles.reviewAuthor}>{authorName}</div>
          <div className={styles.reviewDate}>{dateStr}</div>
        </div>
        <p className={styles.reviewBody}>{reply.body}</p>
        
        {currentUserId && (reply.user === currentUserId || reply.user?.id === currentUserId) && onEdit && (
          <div className={styles.reviewActions} style={{ marginTop: '8px' }}>
            <button
              className={styles.buttonText}
              onClick={() => onEdit(reply)}
              type="button"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    )
  },
)

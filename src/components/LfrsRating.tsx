'use client'

import React, { useState } from 'react'

import styles from './styles/lfrs.module.css'

/**
 * Props for the `LfrsRating` component.
 */
export interface LfrsRatingProps {
  /** Optional CSS class name to apply to the rating container */
  className?: string
  /** The type of icon to render ('star' | 'heart'; defaults to 'star') */
  icon?: string
  /** The maximum rating value / number of icons (defaults to 5) */
  max?: number
  /** Callback triggered when a rating icon is clicked (only when readonly is false) */
  onChange?: (value: number) => void
  /** If true, interactions (hover and click) are disabled (defaults to false) */
  readonly?: boolean
  /** The configuration step value (defaults to 1) */
  step?: number
  /** The current rating value (defaults to 0) */
  value?: number
}

const StarIcon = ({ active }: { active?: boolean }) => (
  <svg
    className={`${styles.ratingIcon} ${active ? styles.active : ''}`}
    viewBox="0 0 24 24"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const HeartIcon = ({ active }: { active?: boolean }) => (
  <svg
    className={`${styles.ratingIcon} ${active ? styles.active : ''}`}
    viewBox="0 0 24 24"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

/**
 * `LfrsRating` is a star or heart rating rendering component.
 * 
 * **Component Purpose:**
 * - Displays a row of icons (stars or hearts) representing a numeric rating.
 * - Supports both read-only display mode and interactive input mode.
 * 
 * **User Interaction:**
 * - **Hovering:** When `readonly` is false, hovering over icons temporarily updates the filled icons to reflect the hovered rating.
 * - **Clicking:** Clicking an icon selects that rating, calling the `onChange` callback.
 * - **Read-only Mode:** When `readonly` is true, hover effects are disabled, and clicking has no effect.
 */
export const LfrsRating: React.FC<LfrsRatingProps> = ({
  className = '',
  icon = 'star',
  max = 5,
  onChange,
  readonly = false,
  step: _step = 1,
  value = 0,
}) => {
  const [hoverValue, setHoverValue] = useState<null | number>(null)

  const renderIcon = (active: boolean) => {
    switch (icon) {
      case 'heart':
        return <HeartIcon active={active} />
      case 'star':
      default:
        return <StarIcon active={active} />
    }
  }

  const items = Array.from({ length: max }, (_, i) => i + 1)

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div 
      className={`${styles.rating} ${readonly ? styles.ratingReadonly : ''} ${className}`}
      onMouseLeave={() => !readonly && setHoverValue(null)}
    >
      {items.map((item) => {
        const isActive = hoverValue !== null ? item <= hoverValue : item <= value
        return (
          <button
            key={item}
            onClick={() => !readonly && onChange?.(item)}
            onMouseEnter={() => !readonly && setHoverValue(item)}
            style={{ cursor: readonly ? 'default' : 'pointer', display: 'flex', border: 'none', background: 'transparent', padding: 0 }}
            type="button"
            aria-label={`Rate ${item} out of ${max}`}
          >
            {renderIcon(isActive)}
          </button>
        )
      })}
    </div>
  )
}

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  LfrsFavourite as BaseLfrsFavourite,
  LfrsLikeDislike as BaseLfrsLikeDislike,
  LfrsReviewsSection as BaseLfrsReviewsSection
} from 'payload-lfrs/client'

export const LfrsFavourite = (props: React.ComponentProps<typeof BaseLfrsFavourite>) => {
  const router = useRouter()
  return <BaseLfrsFavourite {...props} onAuthError={() => router.push('/login')} />
}

export const LfrsLikeDislike = (props: React.ComponentProps<typeof BaseLfrsLikeDislike>) => {
  const router = useRouter()
  return <BaseLfrsLikeDislike {...props} onAuthError={() => router.push('/login')} />
}

export const LfrsReviewsSection = (props: React.ComponentProps<typeof BaseLfrsReviewsSection>) => {
  const router = useRouter()
  return <BaseLfrsReviewsSection {...props} onAuthError={() => router.push('/login')} />
}

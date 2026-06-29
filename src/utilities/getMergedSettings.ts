import type { PayloadRequest } from 'payload'

import type { SanitizedCollectionOptions, SanitizedLfrsConfig } from '../types.js'

import { getCachedLfrsSettings } from './lfrsSettingsCache.js'

export async function getMergedGlobalSettings(
  sanitized: SanitizedLfrsConfig,
  req: PayloadRequest,
) {
  const adminSettings = await getCachedLfrsSettings(req.payload, req)

  return {
    mediaEnabled: adminSettings?.enableReviewMedia ?? sanitized.mediaEnabled,
    reviewModeration: adminSettings?.reviewModeration ?? sanitized.reviewModeration,
  }
}

export async function getMergedCollectionSettings(
  options: SanitizedCollectionOptions,
  collectionSlug: string,
  req: PayloadRequest,
) {
  const adminSettings = await getCachedLfrsSettings(req.payload, req)
  const collectionAdminSettings = adminSettings?.[collectionSlug]

  return {
    allowMultipleReviews:
      collectionAdminSettings?.allowMultipleReviews ?? options.allowMultipleReviews,
  }
}

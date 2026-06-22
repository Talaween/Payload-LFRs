# Payload LFRs Plugin

A comprehensive plugin for [Payload CMS 3.x](https://payloadcms.com) that adds **Likes**, **Favourites**, **Ratings**, and **Reviews** (LFRs) capabilities to your existing collections.

## Features

- **Likes & Dislikes**: Allow users to like or dislike documents. Dislikes are mutually exclusive with likes.
- **Favourites**: Enable users to save documents to their favourites.
- **Ratings**: Add customizable rating systems (e.g., 5-star, 10-point scale, half-stars).
- **Reviews & Replies**: Let users write reviews and others to reply to them.
- **Media Uploads**: Support for attaching images or videos to reviews.
- **Fine-grained Access Control**: Configure who can interact with each feature per collection (e.g., specific roles, custom logic).
- **Automated Aggregation**: Automatically calculates and injects total likes, average ratings, and interaction states into your documents.
- **Review Moderation**: Built-in admin view to moderate pending reviews.

## Installation

```bash
npm install payload-lf-rs
# or
pnpm add payload-lf-rs
# or
yarn add payload-lf-rs
```

## Basic Usage

Add the plugin to your Payload configuration:

```typescript
import { buildConfig } from 'payload'
import { payloadLfRs } from 'payload-lf-rs'

export default buildConfig({
  // ... your existing config
  plugins: [
    payloadLfRs({
      collections: {
        // Enable LFRs features on the 'posts' collection
        posts: {
          likes: true,
          favourites: true,
          ratings: true,
          reviews: true,
        },
      },
    }),
  ],
})
```

## Configuration

The `payloadLfRs` plugin accepts a configuration object with the following properties:

### `collections` (Required)

A map of collection slugs to enable LFRs features on. For each collection, you can enable specific features and configure access control.

```typescript
collections: {
  posts: {
    likes: true, // Enable likes for any authenticated user
    dislikes: false, // Disabled
    favourites: ['admin', 'subscriber'], // Only specific roles can favourite
    ratings: true,
    reviews: true,
    replies: true, // Enable replies to reviews
  }
}
```

#### Access Control

For each feature (`likes`, `dislikes`, `favourites`, `ratings`, `reviews`, `replies`), you can provide:

- `true`: Any authenticated user can use the feature (default if the feature key is omitted but the feature is mentioned, depending on implementation/type defaults).
- `false`: Feature disabled for this collection.
- `string[]`: Only users whose `roles` array includes at least one of these roles can use the feature.
- `Function`: A custom async function receiving the request and target document. Return `true` to allow, `false` to deny.

```typescript
likes: async ({ req, targetCollection, targetDoc }) => {
  // Custom logic: e.g., only users who purchased this product can review it
  return true;
}
```

### `rating`

Configure the rating system (default: 5-star, whole numbers).

```typescript
rating: {
  max: 5,        // Maximum rating value (default: 5)
  step: 0.5,     // Step increment, e.g., 0.5 for half-stars (default: 1)
  icon: 'star',  // Icon identifier hint for frontend (default: 'star')
}
```

### `reviewMedia`

Allow users to attach media to their reviews. **Note:** You must provide the slug of an existing upload-enabled collection.

```typescript
reviewMedia: {
  uploadCollection: 'media', // REQUIRED: an existing upload collection in your payload config
  allowedMimeTypes: ['image/jpeg', 'image/png'], // default: ['image/*']
  maxFiles: 3, // default: 5
  maxFileSize: 5 * 1024 * 1024, // 5MB limit
}
```

### `reviewModeration`

Set to `true` to require reviews to be approved before they are publicly visible (default: `false`). This also adds a dedicated Review Moderation view in the Admin panel.

```typescript
reviewModeration: true
```

### `usersCollectionSlug`

The slug of your users collection for authentication (default: `'users'`).

### `adminGroup`

The group name under which the LFRs collections will appear in the Admin UI (default: `'LFRs'`).

### `collectionSlugs`

Override the default slugs for the internal collections created by the plugin (`likes`, `dislikes`, `favourites`, `ratings`, `reviews`, `replies`).

## How It Works

1. **Collections Added**: The plugin automatically creates collections to store interactions (e.g. `lfrs_likes`, `lfrs_reviews`).
2. **Fields Injected**: It injects an `lfrs` field group into your target collections, containing aggregate data (e.g., `lfrs.likesCount`, `lfrs.averageRating`).
3. **Endpoints Created**: It registers REST endpoints under `/api/lfrs/...` to handle interactions (e.g., `/api/lfrs/like`, `/api/lfrs/rate`).
4. **Admin UI**: Adds custom components and moderation views to the Payload Admin panel.

## API Endpoints

The plugin exposes several endpoints for interacting with the LFRs features from your frontend:

- `POST /api/lfrs/like`
- `POST /api/lfrs/dislike`
- `POST /api/lfrs/favourite`
- `POST /api/lfrs/rate`
- `POST /api/lfrs/review`
- `POST /api/lfrs/reply`
- `DELETE /api/lfrs/reply`
- `GET /api/lfrs/status` - Get the current user's interaction status for a document.
- `GET /api/lfrs/interactions` - Get paginated lists of interactions.
- `GET /api/lfrs/distribution` - Get the rating distribution for a document.

*Authentication is required for `POST` and `DELETE` endpoints.*

## Architecture & Developer Guide

If you are reviewing, contributing to, or debugging the plugin, here's an overview of the codebase structure and internal architecture.

### Code Organization

- `src/plugin.ts`: The main entry point. It accepts user configuration, sanitizes it (applying defaults), and injects the collections, fields, and endpoints into the Payload config.
- `src/collections/`: Contains the definitions for the plugin-managed collections (`likes`, `dislikes`, `favourites`, `ratings`, `reviews`, `replies`). These store the actual user interactions.
- `src/fields/`: 
  - `aggregateFields.ts`: Generates the `lfrs` field group (e.g., `lfrs.likesCount`, `lfrs.averageRating`) that gets injected into target collections.
  - `joinFields.ts`: Injects Payload Join fields so administrators can see related LFRs documents directly from the target document's admin UI.
- `src/endpoints/`: The REST API implementations. These handle incoming user requests, enforce access control, and perform the database operations.
- `src/hooks/`: Contains Payload lifecycle hooks. E.g., `cascadeDelete.ts` ensures that when a target document is deleted, all associated interactions are also removed to prevent orphaned records.
- `src/admin/`: React components for Payload's Admin panel. Includes status widgets and the Review Moderation view.
- `src/types.ts`: TypeScript interfaces and types for configuration, internal sanitized config, and feature access.

### Aggregation Mechanism

Instead of querying all interactions on the fly, the plugin uses an aggregation strategy:
1. When a user interacts (e.g., likes a post), an endpoint (e.g., `src/endpoints/like.ts`) processes the request.
2. The endpoint creates or deletes the interaction record in the corresponding collection (e.g., `lfrs_likes`).
3. The endpoint then recalculates the totals and updates the target document's `lfrs` aggregate fields.

This ensures high performance when reading documents, as the aggregated counts and averages are stored directly on the document itself.

### Access Control

Access checks are performed centrally in the endpoints. If a user provides a custom `Function` for access control, the endpoint awaits its result before proceeding with the database transaction.

## License

MIT

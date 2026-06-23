import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { LfrsFavourite } from '../components/LfrsWithRedirects'

export default async function PostsPage() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    limit: 100,
  })

  return (
    <div>
      <h1 className="page-title">All Posts</h1>
      <div className="grid">
        {posts.docs.map((post) => (
          <div key={post.id} className="card">
            <div className="card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="card-fav-wrapper">
                <LfrsFavourite targetCollection="posts" targetDoc={post.id as string} />
              </div>
              <Link href={`/posts/${post.id}`}>
                <h2 className="card-title">{post.title}</h2>
              </Link>
            </div>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>
              This is a short description for post: {post.title}
            </p>
            <Link href={`/posts/${post.id}`} className="nav-link" style={{ marginTop: 'auto', display: 'inline-block', paddingTop: '1rem' }}>
              Read more &rarr;
            </Link>
          </div>
        ))}
        {posts.docs.length === 0 && (
          <p className="text-muted">No posts found. Please add some via the admin panel.</p>
        )}
      </div>
    </div>
  )
}

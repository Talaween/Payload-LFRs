import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import { LfrsFavourite } from '../components/LfrsWithRedirects'
import { headers } from 'next/headers'

export default async function FavsPage() {
  const payload = await getPayload({ config: configPromise })
  
  // In a real app we'd get the user from payload.auth. Here we try:
  const { user } = await payload.auth({ headers: await headers() })
  
  const where: any = {
    targetCollection: { equals: 'posts' },
  }
  
  if (user) {
    where.user = { equals: user.id }
  }

  const favs = await payload.find({
    collection: 'lfrs-favourites',
    where,
    limit: 100,
  })

  // get post IDs
  const postIds = favs.docs.map((fav) => fav.targetDoc)
  
  let posts: any[] = []
  if (postIds.length > 0) {
    const postsRes = await payload.find({
      collection: 'posts',
      where: {
        id: { in: postIds }
      },
      limit: 100,
    })
    posts = postsRes.docs
  }

  return (
    <div>
      <h1 className="page-title">{user ? 'My Favs' : 'All Favourited Posts'}</h1>
      <div className="grid">
        {posts.map((post) => (
          <div key={post.id} className="card">
            <div className="card-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="card-fav-wrapper">
                <LfrsFavourite targetCollection="posts" targetDoc={post.id as string} initialFavourited={true} />
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
        {posts.length === 0 && (
          <p className="text-muted">No favourite posts found.</p>
        )}
      </div>
    </div>
  )
}

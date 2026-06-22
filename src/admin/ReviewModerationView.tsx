'use client'

import { usePayloadAPI } from '@payloadcms/ui'
import React from 'react'

export const ReviewModerationView: React.FC = () => {
  // We can fetch pending reviews
  const [{ data: reviewsData, isLoading: reviewsLoading }, { setParams: setReviewsParams }] = usePayloadAPI('/api/lfrs-reviews', {
    initialParams: {
      where: {
        status: {
          equals: 'pending'
        }
      },
      limit: 10,
    }
  })

  // We can fetch pending replies
  const [{ data: repliesData, isLoading: repliesLoading }, { setParams: setRepliesParams }] = usePayloadAPI('/api/lfrs-replies', {
    initialParams: {
      where: {
        status: {
          equals: 'pending'
        }
      },
      limit: 10,
    }
  })

  const handleApprove = async (collection: string, id: string) => {
    try {
      await fetch(`/api/${collection}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      })
      // Refresh
      setReviewsParams((prev: any) => ({ ...prev }))
      setRepliesParams((prev: any) => ({ ...prev }))
    } catch (e) {
      console.error(e)
    }
  }

  const handleReject = async (collection: string, id: string) => {
    try {
      await fetch(`/api/${collection}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })
      // Refresh
      setReviewsParams((prev: any) => ({ ...prev }))
      setRepliesParams((prev: any) => ({ ...prev }))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>LFRs Moderation Queue</h1>
      <p style={{ color: 'var(--theme-elevation-400)' }}>Review and moderate pending reviews and replies.</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>Pending Reviews ({reviewsData?.totalDocs || 0})</h2>
        {reviewsLoading ? (
          <div>Loading...</div>
        ) : reviewsData?.docs?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviewsData.docs.map((doc: any) => (
              <div key={doc.id} style={{ padding: '1rem', border: '1px solid var(--theme-elevation-200)', borderRadius: '4px', background: 'var(--theme-elevation-50)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <strong>{doc.title || 'No title'} (Score: {doc.score})</strong>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleApprove('lfrs-reviews', doc.id)} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => handleReject('lfrs-reviews', doc.id)} style={{ padding: '0.5rem 1rem', background: '#e00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
                <p>{doc.body}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-400)' }}>
                  User: {typeof doc.user === 'object' ? doc.user?.email || doc.user?.id : doc.user} | Target: {doc.targetCollection} ({doc.targetDoc})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending reviews.</p>
        )}
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2>Pending Replies ({repliesData?.totalDocs || 0})</h2>
        {repliesLoading ? (
          <div>Loading...</div>
        ) : repliesData?.docs?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {repliesData.docs.map((doc: any) => (
              <div key={doc.id} style={{ padding: '1rem', border: '1px solid var(--theme-elevation-200)', borderRadius: '4px', background: 'var(--theme-elevation-50)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <strong>Reply to Review ID: {typeof doc.review === 'object' ? doc.review?.id : doc.review}</strong>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleApprove('lfrs-replies', doc.id)} style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => handleReject('lfrs-replies', doc.id)} style={{ padding: '0.5rem 1rem', background: '#e00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
                <p>{doc.body}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--theme-elevation-400)' }}>
                  User: {typeof doc.user === 'object' ? doc.user?.email || doc.user?.id : doc.user}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending replies.</p>
        )}
      </section>
    </div>
  )
}

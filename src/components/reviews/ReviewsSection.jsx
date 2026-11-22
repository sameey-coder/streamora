import { useState } from 'react'
import Button from '../ui/Button.jsx'
import StarRating from './StarRating.jsx'
import { useAuthSession } from '../../hooks/useAuthSession.js'
import { PATHS } from '../../routes/paths.js'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'streamora:reviews'

function readReviews() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeReviews(reviews) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  } catch {
    // ignore
  }
}

function ReviewsSection({ movieId }) {
  const { user, isAuthenticated } = useAuthSession()
  const [reviewsMap, setReviewsMap] = useState(readReviews())
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const list = reviewsMap[movieId] || []
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0

  function save(map) {
    setReviewsMap(map)
    writeReviews(map)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!rating) return setError('Please select a rating')
    if (!text.trim()) return setError('Review text cannot be empty')
    if (text.trim().length > 500) return setError('Review too long (max 500)')
    setSubmitting(true)
    const map = readReviews()
    const arr = map[movieId] || []
    const existing = arr.findIndex((r) => r.userId === user?.id)
    const review = {
      id: Date.now(),
      userId: user?.id,
      userName: user?.fullName || 'User',
      rating,
      text: text.trim(),
      date: new Date().toISOString(),
    }
    if (existing >= 0) arr[existing] = review
    else arr.push(review)
    map[movieId] = arr
    save(map)
    setRating(0)
    setText('')
    setSubmitting(false)
  }

  function handleDelete(r) {
    if (!isAuthenticated || r.userId !== user?.id) return
    const map = readReviews()
    const arr = (map[movieId] || []).filter((x) => x.id !== r.id)
    map[movieId] = arr
    save(map)
  }

  return (
    <section className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-8">
      <h2 className="text-lg font-semibold text-white">Reviews & Ratings</h2>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="text-3xl font-bold text-white">{avg.toFixed(1)} <span className="text-base text-neutral-400">/ 5</span></div>
        <StarRating value={Math.round(avg)} readOnly />
        <div className="text-sm text-neutral-400">{list.length} {list.length === 1 ? 'Review' : 'Reviews'}</div>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
            rows="3"
            maxLength="500"
            placeholder="Share your thoughts..."
          />
          <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</Button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-neutral-400">
          Log in to leave a review.{' '}
          <Link to={PATHS.login} className="text-brand-400">Login</Link>
        </p>
      )}

      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <p className="text-sm text-neutral-400">No reviews yet. Be the first to share your thoughts.</p>
        ) : (
          list.map((r) => (
            <div key={r.id} className="rounded-lg border border-neutral-800 bg-neutral-950/40 p-4">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium text-white">{r.userName}</div>
                  <StarRating value={r.rating} readOnly size="sm" />
                </div>
                <div className="text-xs text-neutral-500">{new Date(r.date).toLocaleDateString()}</div>
              </div>
              <p className="mt-2 text-sm text-neutral-300">{r.text}</p>
              {isAuthenticated && user?.id === r.userId && (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => handleDelete(r)}>Delete</Button>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
export default ReviewsSection
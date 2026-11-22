import { Link } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import MovieCard from '../components/movies/MovieCard.jsx'
import Button from '../components/ui/Button.jsx'
import { useWatchHistory } from '../hooks/useWatchHistory.js'
import { PATHS } from '../routes/paths.js'

const GRID_CLASSES =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

function formatWatchedAt(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function EmptyHistory() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-14 text-center sm:px-10 sm:py-20">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto size-10 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <h2 className="mt-5 text-lg font-semibold text-white sm:text-xl">No watch history yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
        Movies you start watching will appear here. Open a movie and select Play to add it to your history.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button as={Link} to={PATHS.browse} variant="primary">Browse movies</Button>
        <Button as={Link} to={PATHS.home} variant="outline">Go to Home</Button>
      </div>
    </div>
  )
}

function WatchHistory() {
  const { history, count, clearHistory } = useWatchHistory()

  function handleClearAll() {
    if (window.confirm(`Clear all ${count} watched ${count === 1 ? 'movie' : 'movies'} from your history?`)) {
      clearHistory()
    }
  }

  return (
    <PageShell title="Watch History" description="Movies you have started watching.">
      {count === 0 ? (
        <EmptyHistory />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-neutral-400">{count} watched {count === 1 ? 'movie' : 'movies'}</p>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>Clear history</Button>
          </div>
          <ul className={GRID_CLASSES}>
            {history.map((movie) => (
              <li key={movie.id} className="flex flex-col">
                <MovieCard movie={movie} />
                <p className="mt-2 px-1 text-xs text-neutral-500">
                  Watched {formatWatchedAt(movie.watchedAt) || 'recently'}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  )
}

export default WatchHistory

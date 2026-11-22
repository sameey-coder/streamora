import { Link } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import MovieCard from '../components/movies/MovieCard.jsx'
import Button from '../components/ui/Button.jsx'
import { useFavourites } from '../hooks/useFavourites.js'
import { PATHS } from '../routes/paths.js'

const GRID_CLASSES =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

function EmptyHeartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mx-auto size-10 text-neutral-700"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function EmptyFavourites() {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-14 text-center sm:px-10 sm:py-20">
      <EmptyHeartIcon />

      <h2 className="mt-5 text-lg font-semibold text-white sm:text-xl">
        No favourites yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
        Select the heart on any movie card to save it here. Your favourites are
        stored on this device, so they will still be waiting for you next time
        you visit.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button as={Link} to={PATHS.browse} variant="primary">
          Browse movies
        </Button>
        <Button as={Link} to={PATHS.home} variant="outline">
          Go to Home
        </Button>
      </div>
    </div>
  )
}

function Favourites() {
  const { favourites, count, clearFavourites } = useFavourites()

  function handleClearAll() {
    const confirmed = window.confirm(
      `Remove all ${count} saved ${count === 1 ? 'movie' : 'movies'} from your favourites? This cannot be undone.`,
    )

    if (confirmed) clearFavourites()
  }

  return (
    <PageShell
      title="Favourites"
      description="The films you have saved for later."
    >
      {count === 0 ? (
        <EmptyFavourites />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-sm text-neutral-400">
              {count} saved {count === 1 ? 'film' : 'films'}
            </p>

            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Clear all
            </Button>
          </div>

          <ul className={GRID_CLASSES}>
            {favourites.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ul>
        </>
      )}
    </PageShell>
  )
}

export default Favourites

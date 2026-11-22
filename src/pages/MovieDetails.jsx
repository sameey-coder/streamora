import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Container from '../components/common/Container.jsx'
import TmdbImage from '../components/movies/TmdbImage.jsx'
import Button from '../components/ui/Button.jsx'
import ReviewsSection from '../components/reviews/ReviewsSection.jsx'
import { useAuthSession } from '../hooks/useAuthSession.js'
import { useTmdbMovies } from '../hooks/useTmdbMovies.js'
import { useWatchHistory } from '../hooks/useWatchHistory.js'
import { PATHS } from '../routes/paths.js'

const MOVIE_ID_PATTERN = /^\d+$/
const NOT_FOUND_PATTERN = /\(404\)/

function isNotFoundError(error) {
  return Boolean(error?.message) && NOT_FOUND_PATTERN.test(error.message)
}

function formatReleaseDate(value) {
  if (!value) return null

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatRuntime(minutes) {
  if (!minutes || minutes < 1) return null
  if (minutes < 60) return `${minutes} min`

  const hours = Math.floor(minutes / 60)
  const minutesLeft = minutes % 60

  return minutesLeft ? `${hours}h ${minutesLeft}m` : `${hours}h`
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  )
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-neutral-400 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <ArrowIcon />
      Back
    </button>
  )
}

function DetailsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
    >
      <div className="h-48 w-full animate-pulse bg-neutral-800 sm:h-64 lg:h-80" />

      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:gap-8 sm:p-8">
        <div className="aspect-2/3 w-28 shrink-0 animate-pulse rounded-lg bg-neutral-800 sm:w-36 lg:w-44" />

        <div className="min-w-0 flex-1">
          <div className="h-8 w-3/4 animate-pulse rounded bg-neutral-800" />
          <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-neutral-800" />
          <div className="mt-5 h-6 w-2/3 animate-pulse rounded bg-neutral-800" />
          <div className="mt-6 h-3 w-full animate-pulse rounded bg-neutral-800" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-neutral-800" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-neutral-800" />
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-900 bg-red-950/40 p-6 sm:p-8"
    >
      <h2 className="text-lg font-semibold text-red-200">Could not load this movie</h2>
      <p className="mt-2 text-sm text-red-300">{message}</p>
      <p className="mt-1 text-sm text-red-300/70">
        TMDB may be unreachable right now. Please try again in a moment.
      </p>

      <Button as={Link} to={PATHS.browse} variant="secondary" className="mt-6">
        Back to Browse
      </Button>
    </div>
  )
}

function MissingMovieState() {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center sm:p-10"
    >
      <h2 className="text-lg font-semibold text-white">Movie not found</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-400">
        We could not find that movie in the TMDB catalogue. It may have been
        removed, or the link may be incorrect.
      </p>

      <Button as={Link} to={PATHS.browse} variant="primary" className="mt-6">
        Browse movies
      </Button>
    </div>
  )
}

function MovieDetailsView({ movie }) {
  const { isAuthenticated } = useAuthSession()
  const { addToHistory } = useWatchHistory()
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false)
  const title = movie.title || movie.original_title || 'Untitled'
  const releaseDate = formatReleaseDate(movie.release_date)
  const runtime = formatRuntime(movie.runtime)
  const hasRating = movie.vote_count > 0 && movie.vote_average > 0
  const genres = (Array.isArray(movie.genres) ? movie.genres : []).filter(
    (genre) => genre?.name,
  )
  const overview = movie.overview?.trim()

  function handlePlay() {
    if (!isAuthenticated) {
      navigate(PATHS.login)
      return
    }
    addToHistory(movie)
    setIsPlaying(true)
  }

  return (
    <article className="relative isolate overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <TmdbImage
        path={movie.backdrop_path}
        variant="backdrop"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/85 to-neutral-950/50"
      />

      <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:gap-8 sm:p-8 lg:p-10">
        <TmdbImage
          path={movie.poster_path}
          variant="poster"
          alt={`${title} poster`}
          className="aspect-2/3 w-28 shrink-0 rounded-lg border border-neutral-800 object-cover shadow-lg sm:w-36 lg:w-44"
        />

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {title}
          </h1>

          {movie.tagline ? (
            <p className="mt-2 text-sm text-neutral-400 italic">{movie.tagline}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-neutral-300">
            {releaseDate ? <span>{releaseDate}</span> : null}

            {releaseDate && runtime ? (
              <span aria-hidden="true" className="text-neutral-600">
                |
              </span>
            ) : null}

            {runtime ? <span>{runtime}</span> : null}

            {hasRating ? (
              <>
                <span className="rounded bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {Math.round(Number(movie.vote_average) * 10)}%
                </span>
                <span className="text-xs text-neutral-500">
                  {Number(movie.vote_average).toFixed(1)}/10 ·{' '}
                  {Number(movie.vote_count).toLocaleString('en-GB')} votes
                </span>
              </>
            ) : (
              <span className="text-xs text-neutral-500">No rating yet</span>
            )}
          </div>

          {genres.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <li
                  key={genre.id ?? genre.name}
                  className="rounded-full border border-neutral-700 bg-neutral-800/60 px-3 py-1 text-xs font-medium text-neutral-200"
                >
                  {genre.name}
                </li>
              ))}
            </ul>
          ) : null}

          <h2 className="mt-6 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Overview
          </h2>

          <p className="mt-2 max-w-3xl leading-relaxed text-neutral-300">
            {overview || 'No overview available for this movie yet.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" onClick={handlePlay}>
              {isPlaying ? 'Playing' : 'Play'}
            </Button>
            {isPlaying ? (
              <span className="self-center text-xs text-neutral-400">
                Added to your Watch History.
              </span>
            ) : null}
          </div>

          {isPlaying ? (
            <div className="mt-5 rounded-xl border border-neutral-800 bg-neutral-950/70 px-4 py-4 text-sm text-neutral-300">
              <p className="font-medium text-white">Now playing: {title}</p>
              <p className="mt-1 text-xs text-neutral-500">
                STREAMORA does not include full movie playback in this demo. This action records the movie in your Watch History.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function MovieDetailsContent({ id }) {
  const { data, loading, error } = useTmdbMovies(`movie/${id}`)

  if (loading) return <DetailsSkeleton />
  if (error) {
    return isNotFoundError(error) ? (
      <MissingMovieState />
    ) : (
      <ErrorState message={error.message} />
    )
  }
  if (!data?.id) return <MissingMovieState />

  return (
    <>
      <MovieDetailsView movie={data} />
      <ReviewsSection movieId={data.id} />
    </>
  )
}

function MovieDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const isValidId = MOVIE_ID_PATTERN.test(id ?? '')

  const handleBack = () => {
    if (location.state?.from) {
      navigate(-1)
      return
    }
    navigate(PATHS.browse)
  }

  return (
    <Container size="wide" className="py-6 sm:py-8">
      <BackButton onClick={handleBack} />

      {isValidId ? (
        <MovieDetailsContent id={id} />
      ) : (
        <MissingMovieState />
      )}
    </Container>
  )
}

export default MovieDetails
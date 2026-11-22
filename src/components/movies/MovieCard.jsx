import { Link, useLocation } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { moviePath } from '../../routes/paths.js'
import Button from '../ui/Button.jsx'
import FavouriteButton from './FavouriteButton.jsx'
import TmdbImage from './TmdbImage.jsx'

const DESKTOP_QUERY = '(min-width: 1024px)'

function MovieCard({ movie, expanded = false, active = false, onEnter, onLeave }) {
  const location = useLocation()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const title = movie.title || movie.original_title
  const releaseDate = movie.release_date || null
  const hasRating = movie.vote_count > 0 && movie.vote_average > 0
  const overview = movie.overview ? movie.overview.slice(0, 70) + (movie.overview.length > 70 ? '...' : '') : null
  const year = releaseDate ? releaseDate.slice(0, 4) : null
  const match = hasRating ? Math.min(95, Math.max(70, Math.round(movie.vote_average * 10))) : null
  const genres = Array.isArray(movie.genre_ids) && movie.genre_ids.length > 0 ? movie.genre_ids.slice(0, 3) : null

  if (!isDesktop) {
    return (
      <li className="relative shrink-0 w-36 sm:w-40 lg:w-44">
        <Link
          to={moviePath(movie.id)}
          state={{ from: location.pathname }}
          className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-sm">
            <TmdbImage
              path={movie.poster_path}
              variant="poster"
              alt={`${title} poster`}
              className="aspect-2/3 w-full object-cover"
            />
          </div>
          <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-neutral-100">
            {title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-400">
            {year ? <span>{year}</span> : <span>{releaseDate ?? '—'}</span>}
            {hasRating ? (
              <>
                <span className="font-medium text-brand-400">⭐ {movie.vote_average.toFixed(1)}</span>
                {match ? <span className="text-green-400">{match}% Match</span> : null}
              </>
            ) : (
              <span>No rating yet</span>
            )}
          </div>
          {genres && genres.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {genres.map((gid) => (
                <span key={gid} className="rounded-full bg-neutral-800/70 px-2 py-0.5 text-[10px] text-neutral-300">
                  Genre
                </span>
              ))}
            </div>
          ) : null}
        </Link>
        <FavouriteButton movie={movie} className="absolute top-2 right-2 z-10 shadow-sm" />
      </li>
    )
  }

  const base = 'w-36 sm:w-40 lg:w-44'
  const wide = 'w-[360px] sm:w-[380px] lg:w-[400px]'
  const liWidth = expanded ? wide : base

  return (
    <li
      className={`${liWidth} group relative shrink-0`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        className={`relative h-full rounded-lg border border-neutral-800 bg-neutral-900 shadow-sm transition-all duration-200 ease-out ${
          active || expanded ? '-translate-y-1 scale-[1.06] border-red-500/80 shadow-xl shadow-red-900/40 shadow-black/50' : ''
        }`}
      >
        <div className="flex h-56 sm:h-64 lg:h-72">
          <Link
            to={moviePath(movie.id)}
            state={{ from: location.pathname }}
            className="block shrink-0 rounded-l-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <div className="relative overflow-hidden rounded-l-lg">
              <TmdbImage
                path={movie.poster_path}
                variant="poster"
                alt={`${title} poster`}
                className="aspect-2/3 h-56 w-36 object-cover sm:h-64 sm:w-40 lg:h-72 lg:w-44 transition-transform duration-200 ease-out group-hover:scale-[1.02] group-hover:brightness-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
            </div>
          </Link>

          <div
            className={`flex flex-1 flex-col justify-between overflow-hidden rounded-r-lg bg-neutral-900 p-3 transition-opacity duration-200 ease-out ${
              expanded ? 'opacity-100 w-[200px] sm:w-[220px] lg:w-[240px]' : 'opacity-0 w-0'
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <Link to={moviePath(movie.id)} state={{ from: location.pathname }} className="text-sm font-semibold text-white hover:text-brand-400 line-clamp-1">
                {title}
              </Link>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-300">
                {match ? <span className="text-green-400">{match}% Match</span> : null}
                {year ? <span>{year}</span> : null}
                {hasRating ? <span className="font-medium text-brand-400">⭐ {movie.vote_average.toFixed(1)}</span> : null}
              </div>
              {genres && genres.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {genres.map((gid) => (
                    <span key={gid} className="rounded-full border border-neutral-700 px-1.5 py-0 text-[9px] text-neutral-300">
                      Genre
                    </span>
                  ))}
                </div>
              ) : null}
              {overview ? <p className="line-clamp-2 text-[11px] leading-relaxed text-neutral-300">{overview}</p> : null}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Button as={Link} to={moviePath(movie.id)} variant="primary" size="sm" className="h-8 px-2 text-xs">
                Watch Now
              </Button>
              <FavouriteButton movie={movie} size="sm" className="relative" />
              <Button as={Link} to={moviePath(movie.id)} variant="secondary" size="sm" className="h-8 px-2 text-xs">
                More Info
              </Button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-red-500/40 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
        <FavouriteButton movie={movie} className={`absolute top-2 right-2 z-10 shadow-sm transition-opacity duration-200 ${expanded ? 'opacity-0' : 'opacity-100'}`} />
      </div>
    </li>
  )
}

export default MovieCard
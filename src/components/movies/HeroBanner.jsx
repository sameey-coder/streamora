import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import TmdbImage from './TmdbImage.jsx'
import { PATHS } from '../../routes/paths.js'

function HeroBanner({ movie, eyebrow }) {
  const [expanded, setExpanded] = useState(false)

  if (!movie) return null

  const title = movie.title || movie.original_title
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null
  const hasRating = movie.vote_count > 0 && movie.vote_average > 0
  const label = typeof eyebrow === 'string' && eyebrow.trim().length > 0 ? eyebrow.trim() : 'Featured this week'

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <TmdbImage
        path={movie.backdrop_path}
        variant="backdrop"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/0"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/50 to-neutral-950/5"
      />

      <div className="relative flex min-h-[24rem] flex-col justify-end p-5 sm:min-h-[30rem] sm:p-8 md:min-h-[34rem] md:p-10 lg:min-h-[42rem] lg:p-14">
        <p className="text-[10px] font-semibold tracking-widest text-brand-400 uppercase sm:text-xs">
          {label}
        </p>

        <h1 className="mt-2 max-w-3xl text-2xl font-bold tracking-tight text-white sm:mt-3 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
          {title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-neutral-200 sm:mt-4 sm:text-sm">
          {year ? <span>{year}</span> : null}
          {hasRating ? (
            <span className="rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:text-xs">
              {Math.round(movie.vote_average * 10)}%
            </span>
          ) : null}
          {movie.popularity ? (
            <span className="text-neutral-300">
              Popularity {Math.round(movie.popularity)}
            </span>
          ) : null}
        </div>

        {movie.overview ? (
          <p
            className={`mt-4 max-w-lg leading-relaxed text-neutral-100 ${expanded ? '' : 'line-clamp-2 sm:line-clamp-3'}`}
          >
            {movie.overview}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6 sm:gap-3">
          <Button as={Link} to={PATHS.browse} variant="primary" size="md" className="sm:text-base">
            Browse movies
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setExpanded((value) => !value)}
            className="sm:text-base"
          >
            {expanded ? 'Show less' : 'More info'}
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HeroBanner
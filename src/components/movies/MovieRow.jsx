import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MovieCard from './MovieCard.jsx'
import { PATHS } from '../../routes/paths.js'

const ROW_CLASSES =
  'flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-2 pb-4 sm:gap-4 sm:px-4 lg:px-6 items-stretch [&>li]:shrink-0 [&>li]:self-stretch [&>li]:transition-[width] [&>li]:duration-300 [&>li]:ease-out'

const DELAY = 250

function RowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="w-36 shrink-0 sm:w-40 lg:w-44">
          <div className="aspect-2/3 w-full animate-pulse rounded-lg bg-neutral-800" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-neutral-800" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-neutral-800" />
        </div>
      ))}
    </div>
  )
}

function MovieRow({ title, movies, loading, error }) {
  const [expandedId, setExpandedId] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const timerRef = useRef(null)

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const onEnter = (id) => {
    clear()
    setActiveId(id)
    timerRef.current = setTimeout(() => {
      setExpandedId(id)
      timerRef.current = null
    }, DELAY)
  }

  const onLeave = () => {
    clear()
    setActiveId(null)
    setExpandedId(null)
  }

  return (
    <section className="mt-10 sm:mt-14 lg:mt-16">
      <div className="mb-4 flex items-baseline justify-between gap-4 sm:mb-5">
        <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl lg:text-2xl">
          {title}
        </h2>

        <Link
          to={PATHS.browse}
          className="shrink-0 text-sm font-medium whitespace-nowrap text-neutral-400 transition-colors hover:text-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 rounded-md px-1 -mx-1"
        >
          View all
        </Link>
      </div>

      {loading ? <RowSkeleton /> : null}

      {!loading && error ? (
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Could not load {title.toLowerCase()}: {error.message}
        </p>
      ) : null}

      {!loading && !error && movies?.length === 0 ? (
        <p className="text-sm text-neutral-500">Nothing to show yet.</p>
      ) : null}

      {!loading && !error && movies?.length > 0 ? (
        <div className="relative" onMouseLeave={onLeave}>
          <ul className={ROW_CLASSES}>
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                expanded={expandedId === movie.id}
                active={activeId === movie.id}
                onEnter={() => onEnter(movie.id)}
                onLeave={onLeave}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

export default MovieRow
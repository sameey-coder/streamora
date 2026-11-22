import { useMemo, useState } from 'react'
import PageShell from '../components/common/PageShell.jsx'
import GenreFilter from '../components/movies/GenreFilter.jsx'
import MovieCard from '../components/movies/MovieCard.jsx'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'
import { useTmdbMovies } from '../hooks/useTmdbMovies.js'

const MIN_QUERY_LENGTH = 2
const SEARCH_DEBOUNCE_MS = 400

const GRID_CLASSES =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-neutral-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function SearchField({ value, onChange }) {
  return (
    <div className="relative">
      <label htmlFor="browse-search" className="sr-only">
        Search movies by title
      </label>

      <SearchIcon />

      <input
        id="browse-search"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search movies by title"
        autoComplete="off"
        spellCheck="false"
        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2.5 pr-10 pl-10 text-sm text-neutral-100 transition-colors placeholder:text-neutral-500 hover:border-neutral-700 focus:border-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:py-3 sm:text-base [&::-webkit-search-cancel-button]:hidden"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className={GRID_CLASSES} aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index}>
          <div className="aspect-2/3 w-full animate-pulse rounded-lg bg-neutral-800" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-neutral-800" />
          <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-neutral-800" />
        </div>
      ))}
    </div>
  )
}

function BrowseMovies() {
  const [query, setQuery] = useState('')
  const [selectedGenreId, setSelectedGenreId] = useState(null)

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)
  const trimmedQuery = debouncedQuery.trim()
  const isSearching = trimmedQuery.length >= MIN_QUERY_LENGTH

  const { data: genreData } = useTmdbMovies('genre/movie/list')
  const genres = useMemo(() => genreData?.genres ?? [], [genreData])

  const endpoint = isSearching
    ? 'search/movie'
    : selectedGenreId !== null
      ? 'discover/movie'
      : 'movie/popular'

  const params = isSearching
    ? { query: trimmedQuery }
    : selectedGenreId !== null
      ? { with_genres: selectedGenreId, sort_by: 'popularity.desc' }
      : { page: 1 }

  const { movies, loading, error } = useTmdbMovies(endpoint, params)

  const visibleMovies = useMemo(() => {
    if (!movies) return null
    if (isSearching && selectedGenreId !== null) {
      return movies.filter((movie) => movie.genre_ids?.includes(selectedGenreId))
    }
    return movies
  }, [movies, isSearching, selectedGenreId])

  const selectedGenreName =
    genres.find((genre) => genre.id === selectedGenreId)?.name ?? null

  const needsMoreCharacters =
    query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH

  const count = visibleMovies?.length ?? 0
  const isEmpty = !loading && !error && visibleMovies?.length === 0

  let context
  if (isSearching && selectedGenreName) {
    context = ` in ${selectedGenreName}`
  } else if (selectedGenreName) {
    context = ` in ${selectedGenreName}`
  }

  function emptyMessage() {
    if (isSearching && selectedGenreName) {
      return `No movies match "${trimmedQuery}" in ${selectedGenreName}. Try another genre or a shorter search.`
    }
    if (isSearching) {
      return `No movies match "${trimmedQuery}". Try a different title or a shorter search.`
    }
    if (selectedGenreName) {
      return `No movies found in ${selectedGenreName} right now. Please try again shortly.`
    }
    return 'TMDB returned no movies right now. Please try again shortly.'
  }

  function statusMessage() {
    if (isSearching) {
      return `Searching TMDB for "${trimmedQuery}"…`
    }
    if (selectedGenreName) {
      return `Loading ${selectedGenreName} movies from TMDB…`
    }
    return 'Loading movies from TMDB…'
  }

  return (
    <PageShell
      title="Browse Movies"
      description="Every film in the STREAMORA library."
    >
      <div className="mb-6 space-y-4 sm:mb-8 sm:space-y-6">
        <div>
          <SearchField value={query} onChange={setQuery} />

          {needsMoreCharacters ? (
            <p className="mt-2 text-xs text-neutral-500">
              Type at least {MIN_QUERY_LENGTH} characters to search.
            </p>
          ) : null}
        </div>

        {genres.length > 0 ? (
          <GenreFilter
            genres={genres}
            value={selectedGenreId}
            onChange={setSelectedGenreId}
          />
        ) : null}
      </div>

      {loading ? (
        <div>
          <p role="status" className="mb-4 text-sm text-neutral-400">
            {statusMessage()}
          </p>
          <GridSkeleton />
        </div>
      ) : null}

      {!loading && error ? (
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Could not load movies from TMDB: {error.message}
        </p>
      ) : null}

      {!loading && !error && isEmpty ? (
        <p className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
          {emptyMessage()}
        </p>
      ) : null}

      {!loading && !error && !isEmpty ? (
        <>
          <p className="mb-4 text-sm text-neutral-400" role="status">
            {count} {count === 1 ? 'movie' : 'movies'}
            {isSearching ? ` matching "${trimmedQuery}"` : ''}
            {context}
          </p>

          <ul className={GRID_CLASSES}>
            {visibleMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ul>
        </>
      ) : null}
    </PageShell>
  )
}

export default BrowseMovies
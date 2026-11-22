const TMDB_URL = 'https://www.themoviedb.org/'

function MarkGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0 text-neutral-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function TmdbAttribution() {
  return (
    <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-4 sm:mt-10 sm:px-5">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <a
          href={TMDB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-2.5 py-1.5 transition-colors hover:border-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <MarkGlyph />
          <span className="text-xs font-bold tracking-widest text-neutral-200">
            TMDB
          </span>
          <span className="sr-only">
            The Movie Database (opens in a new tab)
          </span>
        </a>

        <p className="text-xs leading-relaxed text-neutral-400">
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
      </div>
    </div>
  )
}

export default TmdbAttribution

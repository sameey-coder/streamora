import Container from '../components/common/Container.jsx'
import HeroBanner from '../components/movies/HeroBanner.jsx'
import MovieRow from '../components/movies/MovieRow.jsx'
import { useTmdbMovies } from '../hooks/useTmdbMovies.js'
import { useContent } from '../hooks/useContent.js'

function HeroSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[26rem] animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900 sm:min-h-[34rem] lg:min-h-[42rem]"
    />
  )
}

function Home() {
  const popular = useTmdbMovies('movie/popular', { page: 1 })
  const trending = useTmdbMovies('trending/movie/week', { page: 1 })
  const topRated = useTmdbMovies('movie/top_rated', { page: 1 })
  const { heroMovie, promo } = useContent()

  const tmdbFeatured = popular.movies?.find((movie) => movie.backdrop_path) ?? null
  const featured = heroMovie ?? tmdbFeatured

  const eyebrow = promo.enabled && promo.text.trim().length > 0 ? promo.text.trim() : undefined

  return (
    <Container size="wide" className="py-6 sm:py-8">
      {featured ? (
        <HeroBanner movie={featured} eyebrow={eyebrow} />
      ) : popular.error ? (
        <p className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          Could not reach TMDB: {popular.error.message}
        </p>
      ) : (
        <HeroSkeleton />
      )}

      <MovieRow title="Popular Movies" {...popular} />
      <MovieRow title="Trending Movies" {...trending} />
      <MovieRow title="Top Rated Movies" {...topRated} />
    </Container>
  )
}

export default Home
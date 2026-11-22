import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn.js'
import { useAuthSession } from '../../hooks/useAuthSession.js'
import { useFavourites } from '../../hooks/useFavourites.js'
import { PATHS } from '../../routes/paths.js'

const BASE_CLASSES =
  'inline-flex shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-150 ease-out active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 shadow-sm'

const SIZES = {
  sm: 'size-8',
  md: 'size-9 sm:size-8',
}

const STATE_CLASSES = {
  active:
    'border-brand-500 bg-brand-600 text-white hover:border-brand-400 hover:bg-brand-500',
  inactive:
    'border-neutral-600/70 bg-neutral-950/70 text-neutral-300 hover:border-brand-500 hover:text-brand-400 hover:bg-neutral-950/80',
}

function HeartIcon({ filled }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function FavouriteButton({ movie, size = 'md', className }) {
  const { isAuthenticated } = useAuthSession()
  const { isFavourite, toggleFavourite } = useFavourites()
  const navigate = useNavigate()

  const title = movie.title || movie.original_title || 'this movie'
  const active = isAuthenticated ? isFavourite(movie.id) : false

  function handleClick() {
    if (!isAuthenticated) {
      navigate(PATHS.login)
      return
    }
    toggleFavourite(movie)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Add'} ${title} ${active ? 'from' : 'to'} favourites`}
      title={`${active ? 'Remove from' : 'Add to'} favourites`}
      className={cn(
        BASE_CLASSES,
        SIZES[size] ?? SIZES.md,
        active ? STATE_CLASSES.active : STATE_CLASSES.inactive,
        className,
      )}
    >
      <HeartIcon filled={active} />
    </button>
  )
}

export default FavouriteButton

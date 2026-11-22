import { cn } from '../../utils/cn.js'

const CHIP_BASE =
  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:px-4 sm:py-2 sm:text-sm'

const CHIP_SELECTED = 'border-brand-500 bg-brand-600 text-white'
const CHIP_UNSELECTED =
  'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white'

function GenreFilter({ genres, value, onChange, disabled = false }) {
  const options = [{ id: null, name: 'All Genres' }, ...genres]

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
      <div
        role="group"
        aria-label="Filter movies by genre"
        className="flex w-max gap-2 py-1 sm:w-full sm:flex-wrap"
      >
        {options.map((genre) => {
          const isSelected = genre.id === value

          return (
            <button
              key={genre.id ?? 'all'}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => onChange(genre.id)}
              className={cn(
                CHIP_BASE,
                isSelected ? CHIP_SELECTED : CHIP_UNSELECTED,
                disabled && 'cursor-not-allowed opacity-50',
              )}
            >
              {genre.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default GenreFilter
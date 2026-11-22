function StarRating({ value, onChange, max = 5, size = 'md', readOnly = false }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)
  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(s)}
          aria-label={`${s} star`}
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <svg
            viewBox="0 0 24 24"
            className={`${size === 'sm' ? 'size-4' : 'size-5'} ${s <= value ? 'text-yellow-400' : 'text-neutral-600'}`}
            fill="currentColor"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  )
}
export default StarRating
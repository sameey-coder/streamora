import { useState } from 'react'
import { tmdbImageUrl } from '../../services/tmdb.js'

const SIZES = {
  poster: 'w342',
  backdrop: 'w1280',
}

function TmdbImage({ path, variant = 'poster', alt, className }) {
  const [failed, setFailed] = useState(false)
  const src = tmdbImageUrl(path, SIZES[variant] ?? SIZES.poster)

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-center justify-center bg-neutral-800 text-neutral-600 ${className ?? ''}`}
      >
        <span className="px-2 text-center text-xs">No image</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}

export default TmdbImage
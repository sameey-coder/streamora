import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from '../ui/Button.jsx'
import { cn } from '../../utils/cn.js'

function PlanSelectModal({ open, onClose, plan }) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    const { body, documentElement } = document
    const prev = [body.style.overflow, documentElement.style.overflow]
    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      body.style.overflow = prev[0]
      documentElement.style.overflow = prev[1]
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-title"
        className={cn(
          'fixed inset-0 z-[90] flex items-center justify-center px-4',
          'transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div
          className={cn(
            'w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl',
            'transition-transform duration-200 ease-out',
            open ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2',
          )}
        >
          <div className="p-6">
            <h2 id="plan-title" className="text-lg font-semibold text-white">
              Subscription Selected (Demo)
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              You have selected <span className="font-medium text-white">{plan?.name}</span> at{' '}
              <span className="font-medium text-brand-400">{plan?.price}</span>.
            </p>
            <p className="mt-2 text-xs text-neutral-500">This is a frontend-only demo subscription flow.</p>
            <div className="mt-6 flex justify-end">
              <Button ref={closeRef} variant="primary" size="sm" onClick={onClose}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

export default PlanSelectModal
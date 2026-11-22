import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from '../ui/Button.jsx'
import { cn } from '../../utils/cn.js'

function LogoutConfirmModal({ open, onCancel, onConfirm }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel()
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
  }, [open, onCancel])

  useEffect(() => {
    if (open) confirmRef.current?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onCancel}
        className={cn(
          'fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm',
          'transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        aria-describedby="logout-desc"
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
            <h2 id="logout-title" className="text-lg font-semibold text-white">
              Log out of STREAMORA?
            </h2>
            <p id="logout-desc" className="mt-2 text-sm text-neutral-400">
              Are you sure you want to log out?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={onCancel}>
                Cancel
              </Button>
              <Button ref={confirmRef} variant="primary" size="sm" onClick={onConfirm} autoFocus>
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

export default LogoutConfirmModal
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthSession } from '../../hooks/useAuthSession.js'
import { isAdminUser } from '../../utils/roles.js'
import { PATHS } from '../../routes/paths.js'
import { cn } from '../../utils/cn.js'

function ChevronIcon({ open }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn('size-4 transition-transform duration-200', open && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  )
}

function AdminIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />
      <path d="M9.5 12l1.8 1.8 3.5-3.6" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

const MENU_ITEM_CLASSES =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

function UserMenu({ onLogout }) {
  const { user } = useAuthSession()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  const firstName = user?.fullName?.split(' ')[0] || 'User'

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 xl:text-base',
          open && 'bg-neutral-800 text-white',
        )}
      >
        <span className="max-w-[10rem] truncate">Hi, {firstName}</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl border border-neutral-800 bg-neutral-900 p-1.5 shadow-2xl shadow-black/60"
        >
          <Link
            to={PATHS.profile}
            role="menuitem"
            onClick={() => setOpen(false)}
            className={MENU_ITEM_CLASSES}
          >
            <UserIcon />
            Profile
          </Link>
          {isAdminUser(user) ? (
            <Link
              to={PATHS.admin}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={MENU_ITEM_CLASSES}
            >
              <AdminIcon />
              Admin Dashboard
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className={cn(MENU_ITEM_CLASSES, 'text-neutral-300 hover:text-white')}
          >
            <LogoutIcon />
            Log Out
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default UserMenu

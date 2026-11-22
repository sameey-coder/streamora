import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ACCOUNT_LINKS, PRIMARY_LINKS } from '../../routes/navigation.js'
import { PATHS } from '../../routes/paths.js'
import { isAdminUser } from '../../utils/roles.js'
import { cn } from '../../utils/cn.js'
import NavLinkItem from './NavLinkItem.jsx'

export const MOBILE_MENU_ID = 'mobile-nav-menu'

function LinkGroup({ heading, links, onNavigate }) {
  return (
    <div>
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {heading}
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {links.map(({ to, label, end }) => (
          <li key={to}>
            <NavLinkItem
              to={to}
              end={end}
              className="block w-full rounded-md px-3 py-3 text-base"
              onClick={onNavigate}
            >
              {label}
            </NavLinkItem>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function MobileNavMenu({ open, onClose, isAuthenticated = false, user, onLogout }) {
  const closeButtonRef = useRef(null)

  function handleLogout() {
    if (onLogout) onLogout()
    onClose()
  }

  useEffect(() => {
    if (open) closeButtonRef.current?.focus()
  }, [open])

  return createPortal(
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden',
          'transition-opacity duration-300 ease-out motion-reduce:transition-none',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      />

      <div
        id={MOBILE_MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        className={cn(
          'fixed inset-y-0 right-0 z-[70] flex w-full flex-col sm:max-w-[320px] lg:hidden',
          'border-l border-neutral-800 bg-neutral-950 shadow-2xl',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          open ? 'visible translate-x-0' : 'invisible translate-x-full',
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-800 px-4 py-3">
          <span className="text-lg font-black tracking-tight text-white">
            STREAMORA
          </span>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close main menu"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <CloseIcon />
          </button>
        </div>

        <nav
          aria-label="Mobile"
          className="flex flex-col gap-6 overflow-y-auto px-4 py-5"
        >
          <LinkGroup
            heading="Navigation"
            links={PRIMARY_LINKS}
            onNavigate={onClose}
          />
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Account
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  <li>
                    <span className="block w-full rounded-md px-3 py-3 text-base text-neutral-300">
                      Hi, {user?.fullName?.split(' ')[0] || 'User'}
                    </span>
                  </li>
                  <li>
                    <NavLinkItem
                      to={PATHS.profile}
                      className="block w-full rounded-md px-3 py-3 text-base"
                      onClick={onClose}
                    >
                      Profile
                    </NavLinkItem>
                  </li>
                  {isAdminUser(user) ? (
                    <li>
                      <NavLinkItem
                        to={PATHS.admin}
                        className="block w-full rounded-md px-3 py-3 text-base"
                        onClick={onClose}
                      >
                        Admin Dashboard
                      </NavLinkItem>
                    </li>
                  ) : null}
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-md px-3 py-3 text-left text-base text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
                    >
                      Log Out
                    </button>
                  </li>
                </>
              ) : (
                ACCOUNT_LINKS.map(({ to, label, end }) => (
                  <li key={to}>
                    <NavLinkItem
                      to={to}
                      end={end}
                      className="block w-full rounded-md px-3 py-3 text-base"
                      onClick={onClose}
                    >
                      {label}
                    </NavLinkItem>
                  </li>
                ))
              )}
            </ul>
          </div>
        </nav>
      </div>
    </>,
    document.body,
  )
}

export default MobileNavMenu
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { useAuthSession } from '../../hooks/useAuthSession.js'
import { AUTH_LINKS, PRIMARY_LINKS } from '../../routes/navigation.js'
import { PATHS } from '../../routes/paths.js'
import { cn } from '../../utils/cn.js'
import Container from './Container.jsx'
import LogoutConfirmModal from './LogoutConfirmModal.jsx'
import MobileNavMenu, { MOBILE_MENU_ID } from './MobileNavMenu.jsx'
import NavLinkItem from './NavLinkItem.jsx'
import UserMenu from './UserMenu.jsx'

const TAILWIND_XL_QUERY = '(min-width: 1280px)'

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useMediaQuery(TAILWIND_XL_QUERY)
  const isMenuOpen = isOpen && !isDesktop
  const triggerRef = useRef(null)
  const { user, isAuthenticated, logout } = useAuthSession()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogoutClick = () => setLogoutOpen(true)
  const handleLogoutCancel = () => setLogoutOpen(false)
  const handleLogoutConfirm = () => {
    logout()
    setLogoutOpen(false)
    navigate(PATHS.login)
  }

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    const { body, documentElement } = document
    const previous = [body.style.overflow, documentElement.style.overflow]
    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      body.style.overflow = previous[0]
      documentElement.style.overflow = previous[1]
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) triggerRef.current?.focus()
  }, [isMenuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
      <Container as="nav" aria-label="Main">
        <div className="flex items-center justify-between gap-x-6 gap-y-3 py-3">
          <NavLinkItem
            to={PATHS.home}
            end
            className="text-base font-black tracking-tight text-white sm:text-lg"
          >
            STREAMORA
          </NavLinkItem>

          <ul className="hidden items-center gap-1 lg:flex xl:gap-2">
            {PRIMARY_LINKS.map(({ to, label, end }) => (
              <li key={to}>
                <NavLinkItem to={to} end={end} className="px-2.5 py-2 text-sm xl:text-base">
                  {label}
                </NavLinkItem>
              </li>
            ))}
          </ul>

          <ul className="hidden items-center gap-1 lg:flex xl:gap-2">
            {isAuthenticated ? (
              <li>
                <UserMenu onLogout={handleLogoutClick} />
              </li>
            ) : (
              AUTH_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLinkItem to={to} className="px-2.5 py-2 text-sm xl:text-base">
                    {label}
                  </NavLinkItem>
                </li>
              ))
            )}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            <NavLinkItem
              to={PATHS.favourites}
              className="hidden items-center rounded-md px-2 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:inline-flex"
            >
              Favourites
            </NavLinkItem>
            <NavLinkItem
              to={PATHS.browse}
              className="hidden items-center rounded-md px-2 py-2 text-sm text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:inline-flex"
            >
              Browse
            </NavLinkItem>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setIsOpen(true)}
              aria-expanded={isMenuOpen}
              aria-controls={MOBILE_MENU_ID}
              aria-label="Open main menu"
              className={cn(
                'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 sm:size-10',
                isMenuOpen && 'invisible',
              )}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </Container>

      <MobileNavMenu
        open={isMenuOpen}
        onClose={() => setIsOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogoutClick}
      />
      <LogoutConfirmModal open={logoutOpen} onCancel={handleLogoutCancel} onConfirm={handleLogoutConfirm} />
    </header>
  )
}

export default Navbar

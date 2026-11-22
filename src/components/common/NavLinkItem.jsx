import { NavLink } from 'react-router-dom'
import { cn } from '../../utils/cn.js'

const BASE_CLASSES =
  'rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

const VARIANTS = {
  nav: {
    base: 'px-3 py-2',
    active: 'bg-neutral-800 text-white',
    inactive: 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white',
  },
  muted: {
    base: 'inline-block px-0 py-1',
    active: 'text-white',
    inactive: 'text-neutral-400 hover:text-white',
  },
}

function NavLinkItem({
  to,
  children,
  className,
  variant = 'nav',
  end = false,
  ...rest
}) {
  const { base, active, inactive } = VARIANTS[variant] ?? VARIANTS.nav

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(BASE_CLASSES, base, isActive ? active : inactive, className)
      }
      {...rest}
    >
      {children}
    </NavLink>
  )
}

export default NavLinkItem

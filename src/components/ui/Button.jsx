import { forwardRef } from 'react'
import { cn } from '../../utils/cn.js'

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 shadow-sm'

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-500 active:bg-brand-700',
  secondary: 'bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-800',
  outline: 'border border-neutral-700 bg-transparent text-neutral-100 hover:border-neutral-500 hover:bg-neutral-900',
  ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-white',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

const Button = forwardRef(function Button(
  { as: Component = 'button', variant = 'primary', size = 'md', type = 'button', className, children, ...rest },
  ref,
) {
  const isNativeButton = Component === 'button'

  return (
    <Component
      ref={ref}
      {...(isNativeButton ? { type } : {})}
      className={cn(
        BASE_CLASSES,
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  )
})

export default Button

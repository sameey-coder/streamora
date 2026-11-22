import { cn } from '../../utils/cn.js'

const SIZES = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-[100rem]',
}

function Container({
  as: Component = 'div',
  size = 'default',
  className,
  children,
  ...rest
}) {
  return (
    <Component
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', SIZES[size], className)}
      {...rest}
    >
      {children}
    </Component>
  )
}

export default Container

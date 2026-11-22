import Container from './Container.jsx'

function PageShell({ title, description, className, children }) {
  return (
    <Container className={`py-8 sm:py-12 lg:py-14 ${className ?? ''}`}>
      <header className="mb-6 sm:mb-8 lg:mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl leading-relaxed text-neutral-400 sm:mt-3">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </Container>
  )
}

export default PageShell

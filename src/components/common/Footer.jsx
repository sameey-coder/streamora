import {
  ACCOUNT_LINKS,
  LEGAL_LINKS,
  PRIMARY_LINKS,
} from '../../routes/navigation.js'
import Container from './Container.jsx'
import NavLinkItem from './NavLinkItem.jsx'
import TmdbAttribution from './TmdbAttribution.jsx'

const SUPPORT_LINKS = ['Help Center', 'Contact Us', 'Accessibility']

const CURRENT_YEAR = new Date().getFullYear()

function LinkColumn({ heading, children }) {
  return (
    <div>
      <h2 className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
        {heading}
      </h2>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function PlaceholderList({ items }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item}>
          <span className="text-sm text-neutral-500">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-950">
      <Container className="py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-16">
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              About STREAMORA
            </h2>
            <p className="mt-3 text-lg font-black tracking-tight text-white">
              STREAMORA
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
              A premium home for film. Stream curated movies in 4K with
              subtitles, keep your favourites in one place, and pick the plan
              that suits how you watch.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            <LinkColumn heading="Explore">
              <ul className="flex flex-col gap-2.5">
                {PRIMARY_LINKS.map(({ to, label, end }) => (
                  <li key={to}>
                    <NavLinkItem to={to} end={end} variant="muted">
                      {label}
                    </NavLinkItem>
                  </li>
                ))}
              </ul>
            </LinkColumn>

            <LinkColumn heading="Account">
              <ul className="flex flex-col gap-2.5">
                {ACCOUNT_LINKS.map(({ to, label }) => (
                  <li key={to}>
                    <NavLinkItem to={to} variant="muted">
                      {label}
                    </NavLinkItem>
                  </li>
                ))}
              </ul>
            </LinkColumn>

            <LinkColumn heading="Support">
              <PlaceholderList items={SUPPORT_LINKS} />
            </LinkColumn>

            <LinkColumn heading="Legal">
              <ul className="flex flex-col gap-2.5">
                {LEGAL_LINKS.map(({ to, label }) => (
                  <li key={to}>
                    <NavLinkItem to={to} variant="muted">
                      {label}
                    </NavLinkItem>
                  </li>
                ))}
              </ul>
            </LinkColumn>
          </div>
        </div>

        <TmdbAttribution />

        <div className="mt-10 flex flex-col gap-2 border-t border-neutral-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-600">
            &copy; {CURRENT_YEAR} STREAMORA. All rights reserved.
          </p>
          <p className="text-xs text-neutral-600">Premium movie streaming.</p>
        </div>
      </Container>
    </footer>
  )
}

export default Footer

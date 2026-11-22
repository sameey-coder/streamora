import { Link, useParams } from 'react-router-dom'
import PageShell from '../components/common/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import { PATHS } from '../routes/paths.js'

const DOCUMENTS = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookies: 'Cookie Policy',
}

function LegalDocument() {
  const { slug } = useParams()
  const title = DOCUMENTS[slug]

  if (!title) {
    return (
      <PageShell title="Legal" description="That document does not exist.">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center sm:p-10">
          <h2 className="text-lg font-semibold text-white">Document not found</h2>
          <p className="mt-2 text-sm text-neutral-400">
            We could not find that legal document.
          </p>

          <Button as={Link} to={PATHS.home} variant="primary" className="mt-6">
            Back to Home
          </Button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={title}
      description="This document has not been published yet."
    >
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Nothing here yet</h2>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
          No {title.toLowerCase()} has been written for STREAMORA yet. We are not
          publishing placeholder legal wording, so this page will stay empty
          until the real document is ready.
        </p>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400">
          In the meantime, the movie data and imagery on this site come from
          TMDB. The required attribution notice is shown in the footer of every
          page.
        </p>

        <Button as={Link} to={PATHS.browse} variant="secondary" className="mt-6">
          Back to Browse
        </Button>
      </div>
    </PageShell>
  )
}

export default LegalDocument

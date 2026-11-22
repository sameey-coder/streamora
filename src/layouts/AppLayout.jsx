import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../components/common/Footer.jsx'
import Navbar from '../components/common/Navbar.jsx'

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span className="text-sm text-neutral-500">Loading…</span>
    </div>
  )
}

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

export default AppLayout

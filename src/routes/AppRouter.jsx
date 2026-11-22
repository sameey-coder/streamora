import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'
import RequireAdmin from './RequireAdmin.jsx'
import RequireAuth from './RequireAuth.jsx'
import { PATHS } from './paths.js'

const Home = lazy(() => import('../pages/Home.jsx'))
const BrowseMovies = lazy(() => import('../pages/BrowseMovies.jsx'))
const MovieDetails = lazy(() => import('../pages/MovieDetails.jsx'))
const Login = lazy(() => import('../pages/Login.jsx'))
const Register = lazy(() => import('../pages/Register.jsx'))
const Favourites = lazy(() => import('../pages/Favourites.jsx'))
const WatchHistory = lazy(() => import('../pages/WatchHistory.jsx'))
const SubscriptionPlans = lazy(() => import('../pages/SubscriptionPlans.jsx'))
const Profile = lazy(() => import('../pages/Profile.jsx'))
const AdminLogin = lazy(() => import('../pages/AdminLogin.jsx'))
const AdminDashboard = lazy(() => import('../pages/AdminDashboard.jsx'))
const LegalDocument = lazy(() => import('../pages/LegalDocument.jsx'))
const Payment = lazy(() => import('../pages/Payment.jsx'))
const PaymentSuccess = lazy(() => import('../pages/PaymentSuccess.jsx'))
const PaymentCancel = lazy(() => import('../pages/PaymentCancel.jsx'))
const NotFound = lazy(() => import('../pages/NotFound.jsx'))

const routes = [
  {
    element: <AppLayout />,
    children: [
      { path: PATHS.home, element: <Home /> },
      { path: PATHS.browse, element: <BrowseMovies /> },
      { path: PATHS.movieDetail, element: <MovieDetails /> },
      { path: PATHS.login, element: <Login /> },
      { path: PATHS.register, element: <Register /> },
      { path: PATHS.favourites, element: <RequireAuth><Favourites /></RequireAuth> },
      { path: PATHS.history, element: <RequireAuth><WatchHistory /></RequireAuth> },
      { path: PATHS.subscription, element: <RequireAuth><SubscriptionPlans /></RequireAuth> },
      { path: PATHS.payment, element: <RequireAuth><Payment /></RequireAuth> },
      { path: PATHS.paymentSuccess, element: <RequireAuth><PaymentSuccess /></RequireAuth> },
      { path: PATHS.paymentCancel, element: <RequireAuth><PaymentCancel /></RequireAuth> },
      { path: PATHS.profile, element: <RequireAuth><Profile /></RequireAuth> },
      { path: PATHS.adminLogin, element: <AdminLogin /> },
      {
        path: PATHS.admin,
        element: (
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        ),
      },
      { path: PATHS.legalDocument, element: <LegalDocument /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]

const router = createBrowserRouter(routes)

function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter

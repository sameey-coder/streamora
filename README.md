# STREAMORA

A movie streaming platform demo built with React, Vite, and Express — showcasing frontend development, API integration, and demo payment flows.

## About the Project

Streamora is a personal portfolio/demo project that simulates a movie streaming-style experience. It demonstrates responsive UI development, client-side routing, TMDB-powered movie discovery, local demo authentication, user-scoped favourites/watch history, subscription plan selection, Flutterwave test-mode checkout with server-side payment verification, and an admin dashboard for demo management tasks.

This project is **not** a real commercial streaming service. It does not provide real subscriptions, licensed content delivery, or actual movie streaming playback.

## Features

- **Responsive streaming-style interface** — Dark-themed layout with desktop/mobile navigation and responsive page layouts.
- **Movie browsing and search** — Browse popular movies, search by title, and view paginated/discover results.
- **Genre filtering** — Filter browse results by TMDB genres.
- **Movie details** — Dedicated movie detail pages with metadata, ratings, and related content sections.
- **Featured movie hero section** — Home hero/banner with featured content; admin can configure featured hero/promo content in demo mode.
- **Favourites** — Logged-in users can add/remove favourites; favourites are user-scoped and persist in browser storage.
- **User registration and login demo** — Local demo account registration/login using browser storage and session state.
- **User profile** — Profile page showing account details and current subscription status.
- **Watch history** — Records movies when a user clicks Play on the movie details page; history is user-scoped and persists locally.
- **Subscription plans** — Standard and Premium plan options.
- **Flutterwave test-mode payment integration** — Initiates Flutterwave hosted checkout through the Express backend.
- **Payment verification and subscription activation** — Backend verifies payments before activating subscriptions; cancelled/failed/unverified payments do not activate plans.
- **Admin dashboard** — Demo admin area for overview metrics and management sections.
- **User and content management** — Demo user activation/deactivation and content management controls.
- **Payment history** — Admin view of subscription/payment records returned by the backend.

## Tech Stack

**Frontend**
- [React 19](https://react.dev/)
- [React Router 7](https://reactrouter.com/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html)

**Backend**
- [Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/)
- [Axios](https://axios-http.com/) (Flutterwave API requests)
- [dotenv](https://github.com/motdotla/dotenv)
- [cors](https://github.com/expressjs/cors)
- [uuid](https://github.com/uuidjs/uuid)

**External Services**
- [TMDB API](https://www.themoviedb.org/documentation/api) for movie data
- [Flutterwave](https://flutterwave.com/) test mode for demo checkout/payment verification

## Screenshots

Add project screenshots here.

<!-- Example:
![Home page](./docs/screenshots/home.png)
![Browse page](./docs/screenshots/browse.png)
![Movie details](./docs/screenshots/movie-details.png)
![Admin dashboard](./docs/screenshots/admin-dashboard.png)
-->

## Getting Started

### Requirements

- Node.js (latest LTS recommended)
- npm
- A TMDB API key
- Flutterwave **test** API keys (public and secret) for payment demo functionality

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd streamora
```

### 2. Install dependencies

Install frontend/root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
cd ..
```

### 3. Configure environment variables

Copy the example environment file to `.env` in the project root:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

Fill in the required values in `.env`. Do not commit `.env`.

### 4. Run the app

Run frontend and backend in **separate terminals**.

**Terminal 1 — Frontend (Vite):**

```bash
npm run dev
```

**Terminal 2 — Backend (Express):**

```bash
npm run dev:server
```

Alternatively, from the project root you can run both with:

```bash
npm run dev:all
```

The frontend runs on Vite's local dev server (typically `http://localhost:5173`) and the backend runs on `http://localhost:5000` by default.

## Environment Variables

Create a root `.env` file based on `.env.example`. The frontend uses Vite `VITE_*` variables, and the backend loads the root `.env` through `server/index.js`.

| Variable | Purpose |
|---|---|
| `VITE_TMDB_API_KEY` | TMDB API key used by the frontend to fetch movie data. |
| `VITE_API_BASE_URL` | Base URL for the Express backend (e.g., `http://localhost:5000`). |
| `FLW_PUBLIC_KEY` | Flutterwave public test key for backend/payment configuration. |
| `FLW_SECRET_KEY` | Flutterwave secret test key used by the backend for payment initiation/verification. **Server-only; never expose in frontend code.** |
| `FRONTEND_URL` | Frontend URL used by the backend for payment redirect/callback flow. |
| `PORT` | Port for the Express backend server. |
| `ADMIN_RESET_TOKEN` | Demo-only token required by the backend admin reset endpoint. Use a strong random value locally; not production authentication. |

## Demo Limitations & Security

- **Demo authentication only** — Authentication/session behavior is implemented for demo purposes and is not production-grade authentication or authorization.
- **Not a real streaming service** — Streamora is a portfolio project. It does not stream licensed movies or provide commercial subscription services.
- **TMDB data** — Movie metadata/images are provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
- **Flutterwave test mode** — Payment integration is intended for Flutterwave test mode only. No real charges or real subscriptions should be processed.
- **No real playback/subscriptions** — “Play” actions record watch history for demo purposes; there is no actual movie streaming. Subscription activation is demo app state based on verified test payments.
- **Demo admin/user functionality** — Some admin and user features are browser/demo oriented and not hardened for production use.
- **Secrets** — Never expose secret keys, never commit `.env`, and never place backend secrets in `VITE_*` variables or frontend code.

## Credits

- Movie data and images provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).
- This product uses the TMDB API but is not endorsed or certified by TMDB.

## License

No license has been specified for this project.

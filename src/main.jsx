import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthProvider.jsx'
import { SubscriptionProvider } from './context/SubscriptionProvider.jsx'
import FavouritesProvider from './context/FavouritesProvider.jsx'
import { WatchHistoryProvider } from './context/WatchHistoryProvider.jsx'
import { ContentProvider } from './context/ContentProvider.jsx'
import AppRouter from './routes/AppRouter.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <FavouritesProvider>
          <WatchHistoryProvider>
            <ContentProvider>
              <AppRouter />
            </ContentProvider>
          </WatchHistoryProvider>
        </FavouritesProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </StrictMode>,
)

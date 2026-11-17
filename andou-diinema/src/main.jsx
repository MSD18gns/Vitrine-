import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { ContentProvider } from './hooks/useContent'
import { ProgressProvider } from './hooks/useProgress'
import ErrorBoundary from './components/ErrorBoundary'
import { LanguageProvider } from './i18n'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
        <AuthProvider>
          <ContentProvider>
            <ProgressProvider>
              <App />
            </ProgressProvider>
          </ContentProvider>
        </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

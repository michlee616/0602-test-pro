import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CurrentUserProvider } from './auth/useCurrentUser.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CurrentUserProvider>
      <App />
    </CurrentUserProvider>
  </StrictMode>,
)

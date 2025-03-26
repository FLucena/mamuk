import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'

// Clear any existing app state on dev refresh
if (import.meta.env.DEV) {
  localStorage.removeItem('mamuk-auth-storage')
  localStorage.removeItem('mamuk-workouts-storage')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

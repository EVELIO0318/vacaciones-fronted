import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThApp } from './ThApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThApp />
  </StrictMode>,
)

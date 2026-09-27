import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './ui/application.tsx'

createRoot(document.getElementById('root')!).render(
    <App />
)

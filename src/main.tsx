import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:24px;color:red;font-family:monospace">root element not found</div>';
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { registerPWA } from './utils/pwaRegistration'
import { syncService } from './services/syncService'

registerPWA();
syncService.initAutoSync();
syncService.syncIfPending();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
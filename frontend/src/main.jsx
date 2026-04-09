import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* The Router MUST be the parent of App */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
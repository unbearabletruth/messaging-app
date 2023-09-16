import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './contexts/AuthContext.jsx'
import { CurrentChatContextProvider } from './contexts/CurrentChatContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthContextProvider>
      <CurrentChatContextProvider>
        <App />
      </CurrentChatContextProvider>
    </AuthContextProvider>
  </React.StrictMode>,
)

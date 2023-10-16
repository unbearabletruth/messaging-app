import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthContextProvider } from './contexts/AuthContext.jsx'
import { CurrentChatContextProvider } from './contexts/CurrentChatContext.jsx'
import { OnlineUsersContextProvider } from './contexts/OnlineUsers.jsx'
import { ThemeContextProvider } from './contexts/ThemeContext.jsx'
import { ChatsContextProvider } from './contexts/ChatsContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthContextProvider>
    <ChatsContextProvider>
      <CurrentChatContextProvider>
        <OnlineUsersContextProvider>
          <ThemeContextProvider>
            <App />
          </ThemeContextProvider>
        </OnlineUsersContextProvider>
      </CurrentChatContextProvider>
    </ChatsContextProvider>
  </AuthContextProvider>
)

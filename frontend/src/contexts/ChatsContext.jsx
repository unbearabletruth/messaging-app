import { useState, createContext } from "react";

export const ChatsContext = createContext()

export const ChatsContextProvider = ({children}) => {
  const [chats, setChats] = useState([])

  const handleChats = (chats) => {
    const sortedChats = [...chats].sort((a, b) => a.latestMessage.updatedAt < b.latestMessage.updatedAt ? 1 : -1)
    setChats(sortedChats)
  }

  return (
    <ChatsContext.Provider value={{ chats, handleChats }}>
      {children}
    </ChatsContext.Provider>
  )
}
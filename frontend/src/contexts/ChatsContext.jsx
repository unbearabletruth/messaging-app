import { useState, createContext } from "react";

export const ChatsContext = createContext()

export const ChatsContextProvider = ({children}) => {
  const [chats, setChats] = useState([])

  const handleChats = (chats) => {
    setChats(chats)
  }

  return (
    <ChatsContext.Provider value={{ chats, handleChats }}>
      {children}
    </ChatsContext.Provider>
  )
}
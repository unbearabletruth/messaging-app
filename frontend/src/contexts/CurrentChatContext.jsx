import { createContext } from "react";
import { useState } from "react";

export const CurrentChatContext = createContext()

export const CurrentChatContextProvider = ({children}) => {
  const [currentChat, setCurrentChat] = useState(null)

  const handleCurrentChat = (chat) => {
    setCurrentChat(chat)
  }

  return (
    <CurrentChatContext.Provider value={{ currentChat, handleCurrentChat }}>
      {children}
    </CurrentChatContext.Provider>
  )
}
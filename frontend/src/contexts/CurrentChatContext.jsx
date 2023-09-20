import { createContext } from "react";
import { useState } from "react";

export const CurrentChatContext = createContext()

export const CurrentChatContextProvider = ({children}) => {
  const [currentChat, setCurrentChat] = useState(JSON.parse(sessionStorage.getItem('currentChat')))

  const handleCurrentChat = (chat) => {
    setCurrentChat(chat)
    sessionStorage.setItem("currentChat", JSON.stringify(chat));
  }

  return (
    <CurrentChatContext.Provider value={{ currentChat, handleCurrentChat }}>
      {children}
    </CurrentChatContext.Provider>
  )
}
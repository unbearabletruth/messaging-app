import { createContext } from "react";
import { useState } from "react";

export const CurrentChatContext = createContext()

export const CurrentChatContextProvider = ({children}) => {
  const [currentChat, setCurrentChat] = useState(null)

  return (
    <CurrentChatContext.Provider value={{ currentChat, setCurrentChat }}>
      {children}
    </CurrentChatContext.Provider>
  )
}
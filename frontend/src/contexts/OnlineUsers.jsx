import { useState, createContext } from "react";

export const OnlineUsersContext = createContext()

export const OnlineUsersContextProvider = ({children}) => {
  const [onlineUsers, setOnlineUsers] = useState([])

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, setOnlineUsers }}>
      {children}
    </OnlineUsersContext.Provider>
  )
}
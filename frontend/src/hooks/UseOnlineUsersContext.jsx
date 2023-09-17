import { OnlineUsersContext } from "../contexts/OnlineUsers";
import { useContext } from "react";

export function useOnlineUsersContext() {
  const context = useContext(OnlineUsersContext)
  if (!context) {
    throw Error('must be used inside OnlineUsersContextProvider')
  }
  return context
}
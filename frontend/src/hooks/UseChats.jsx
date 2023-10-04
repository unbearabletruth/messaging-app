import { ChatsContext } from "../contexts/ChatsContext";
import { useContext } from "react";

export function useChatsContext() {
  const context = useContext(ChatsContext)
  if (!context) {
    throw Error('must be used inside ChatsContextProvider')
  }
  return context
}
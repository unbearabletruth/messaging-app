import { CurrentChatContext } from "../contexts/CurrentChatContext";
import { useContext } from "react";

export function useCurrentChatContext() {
  const context = useContext(CurrentChatContext)
  if (!context) {
    throw Error('must be used inside CurrentChatContextProvider')
  }
  return context
}
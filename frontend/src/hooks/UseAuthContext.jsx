import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw Error('must be used inside AuthContextProvider')
  }
  return context
}
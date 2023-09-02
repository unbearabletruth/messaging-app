import { createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext()

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'set':
      return {user: action.payload}
    case 'login':
      return {user: action.payload}
    case 'logout':
      return {user: null}
    default:
      return state
  }
}

export const AuthContextProvider = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: JSON.parse(localStorage.getItem('user'))
  })

  console.log('authcontext state:', state)

  return (
    <AuthContext.Provider value={{...state, dispatch}}>
      {children}
    </AuthContext.Provider>
  )
}
import { createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext()

export const authReducer = (state, action) => {
  switch (action.type) {
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

  /*useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (user) {
      dispatch({type: 'login', payload: user})
    }
  }, [])*/            //dive deeper 

  console.log('authcontext state:', state)

  return (
    <AuthContext.Provider value={{...state, dispatch}}>
      {children}
    </AuthContext.Provider>
  )
}
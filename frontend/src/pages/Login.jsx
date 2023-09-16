import { useState } from "react"
import { useAuthContext } from "../hooks/UseAuthContext"
import { useNavigate  } from "react-router-dom";
import Signup from "../components/SignupPopup";
import '../assets/styles/Login.css'

function Login() {
  const navigate = useNavigate()
  const {dispatch} = useAuthContext()
  const [user, setUser] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState() 
  const [isLoading, setIsLoading] = useState()
  const [signup, setSignup] = useState(false)

  const handleInput = (e) => {
    setUser({
      ...user,
      [e.target.name] : e.target.value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const login = async (user) => {
      setIsLoading(true)
      setError(null)
  
      const response = await fetch(`http://localhost:3000/users/login`, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
          'Content-type': 'application/json'
        }
      })
      const json = await response.json()
      if (!response.ok) {
        setIsLoading(false)
        setError(json.error)
      }
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(json))
        dispatch({type: 'login', payload: json})
        setIsLoading(false)
        navigate("/");
      }
    }
    await login(user)
  }

  const closePopup = () => {
    setSignup(false)
  }

  return (
      <div id="loginPage">
        <h1 id="loginTitle">Sign in to Messenger</h1>
        <form id="loginForm" onSubmit={handleLogin}>
          <input 
            type="text"
            className="loginInput" 
            name="username" 
            onChange={handleInput}
            aria-label="username"
            placeholder="Name"
          >
          </input>
          <input 
            type="password"
            className="loginInput" 
            name="password" 
            onChange={handleInput}
            aria-label="password"
            placeholder="Password"
          >
          </input>
          <button disabled={isLoading} className="formButton">Log in</button>
          {error && <p>{error}</p>}
        </form>
        <div id="dontHaveAccount">
          <p>Don't have an account?</p>
          <button className="fontButton" onClick={() => setSignup(true)}>Sign up</button>
        </div>
        {signup && <Signup closePopup={closePopup}/>}
    </div>
  )
}

export default Login
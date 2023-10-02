import { useState } from "react"
import { useAuthContext } from "../hooks/UseAuthContext"
import { useNavigate  } from "react-router-dom";
import Signup from "../components/SignupPopup";
import '../assets/styles/Login.css'
import uniqid from 'uniqid';

function Login() {
  const navigate = useNavigate()
  const {dispatch} = useAuthContext()
  const [user, setUser] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState(null) 
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
      setErrors(null)
  
      const response = await fetch(`http://localhost:3000/users/login`, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: {
          'Content-type': 'application/json'
        }
      })
      const json = await response.json()
      if (!response.ok) {
        console.log(json)
        setIsLoading(false)
        setErrors(json.errors)
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
          <div className="loginInputWithError">
            <input 
              type="text"
              className="loginInput" 
              name="username" 
              onChange={handleInput}
              aria-label="username"
              placeholder="Name"
            >
            </input>
            {errors && errors.map(err => {
              return (
                err.path === 'username' &&
                  <span key={uniqid()} className="loginErrorMessage">{err.msg}</span>
              )
            })}
          </div>
          <div className="loginInputWithError">
            <input 
              type="password"
              className="loginInput" 
              name="password" 
              onChange={handleInput}
              aria-label="password"
              placeholder="Password"
            >
            </input>
            {errors && errors.map(err => {
              return (
                err.path === 'password' &&
                  <span key={uniqid()} className="loginErrorMessage">{err.msg}</span>
              )
            })}
          </div>
          <button disabled={isLoading} className="formButton">Log in</button>
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
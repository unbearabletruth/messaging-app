import { useState } from "react"
import { useAuthContext } from "../hooks/UseAuthContext"
import { useNavigate  } from "react-router-dom";
import Signup from "../components/SignupPopup";
import '../assets/styles/Login.css'
import uniqid from 'uniqid';
import { URL } from "../constants";

function Login() {
  const navigate = useNavigate()
  const { dispatch } = useAuthContext()
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

  const login = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors(null)

    const response = await fetch(`${URL}/users/login`, {
      method: 'POST',
      body: JSON.stringify(user),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (!response.ok) {
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

  const closePopup = () => {
    setSignup(false)
  }

  return (
      <div id="loginPage">
        <h1 id="loginTitle">Sign in to Messenger</h1>
        <form id="loginForm" onSubmit={login}>
          <div className="loginInputWithError">
            <input 
              type="text"
              className={`loginInput ${errors && errors.some(err => err.path === 'username') ? 'invalid' : ''}`} 
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
              className={`loginInput ${errors && errors.some(err => err.path === 'password') ? 'invalid' : ''}`} 
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
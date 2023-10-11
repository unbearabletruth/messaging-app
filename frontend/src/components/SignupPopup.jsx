import { useState } from "react"
import { useAuthContext } from "../hooks/UseAuthContext"
import { useNavigate  } from "react-router-dom";
import closeIcon from '../assets/images/close-icon.svg'
import uniqid from 'uniqid';
import { useWelcomeChat } from "../hooks/UseWelcomeChat";

function Signup({closePopup}) {
  const navigate = useNavigate()
  const { dispatch } = useAuthContext()
  const [user, setUser] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState(null) 
  const [isLoading, setIsLoading] = useState()
  const { initBot } = useWelcomeChat()

  const handleInput = (e) => {
    setUser({
      ...user,
      [e.target.name] : e.target.value
    })
  }

  const signup = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors(null)

    const response = await fetch(`http://localhost:3000/users/signup`, {
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
      initBot(json._id)
    }
  }

  return (
    <div className="popupBackground">
      <div className="popup" id="signupPopup">
        <button onClick={closePopup} className="mainButton closePopup">
          <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
        </button>
        <h1 id="signupTitle">Sign up</h1>
        <form id="signupForm" onSubmit={signup}>
          <div id="signupInputsWrapper">
            <div className="loginInputWithError">
              <input 
                type="text"
                className={`signupInput ${errors && errors.some(err => err.path === 'username') ? 'invalid' : ''}`}
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
                className={`signupInput ${errors && errors.some(err => err.path === 'password') ? 'invalid' : ''}`}
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
          </div>
          <button disabled={isLoading} className="formButton">Sign up</button>
        </form>
      </div>
    </div>
  )
}

export default Signup
import { useState } from "react"
import { useAuthContext } from "../hooks/UseAuthContext"
import { useNavigate  } from "react-router-dom";
import closeIcon from '../assets/images/close-icon.svg'

function Signup({closePopup}) {
  const navigate = useNavigate()
  const {dispatch} = useAuthContext()
  const [user, setUser] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState() 
  const [isLoading, setIsLoading] = useState()

  const handleInput = (e) => {
    setUser({
      ...user,
      [e.target.name] : e.target.value
    })
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    const signup = async (user) => {
      setIsLoading(true)
      setError(null)
  
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
        setError(json.error)
      }
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(json))
        dispatch({type: 'login', payload: json})
        setIsLoading(false)
        navigate("/");
      }
    }
    await signup(user)
  }

  return (
    <div id="popupBackground">
      <div className="popup" id="signupPopup">
        <button onClick={closePopup} className="closePopup">
          <img src={closeIcon} alt="x" className="closeIcon"></img>
        </button>
        <h1 id="signupTitle">Sign up</h1>
        <form id="signupForm" onSubmit={handleSignup}>
          <input 
            className="loginInput" 
            name="username" 
            onChange={handleInput}
            aria-label="username"
            placeholder="Name"
          >
          </input>
          <input 
            className="loginInput" 
            name="password" 
            onChange={handleInput}
            aria-label="password"
            placeholder="Password"
          >
          </input>
          <button disabled={isLoading} className="formButton">Sign up</button>
          {error && <p>{error}</p>}
        </form>
      </div>
    </div>
  )
}

export default Signup
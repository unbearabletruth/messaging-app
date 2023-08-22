import { useState } from "react"
import { useAuthContext } from "../hooks/UseAuthContext"
import { useNavigate  } from "react-router-dom";

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
  console.log(user)
  return (
    <>
      <div id="formWrapper">
        <form id="loginForm" onSubmit={handleLogin}>
          <label htmlFor='username'>Username</label>
          <input className="formInput" name="username" onChange={handleInput}></input>
          <label htmlFor='password'>Password</label>
          <input className="formInput" name="password" onChange={handleInput}></input>
          <button disabled={isLoading} className="button">Log in</button>
          {error && <p>{error}</p>}
        </form>
      </div>
      <div>
        <p>Don't have an account?</p>
        <button onClick={() => setSignup(true)}>Sign up</button>
      </div>
      {signup &&
        <div id="formWrapper">
          <form id="signupForm" onSubmit={handleSignup}>
            <label htmlFor='username'>Username</label>
            <input className="formInput" name="username" onChange={handleInput}></input>
            <label htmlFor='password'>Password</label>
            <input className="formInput" name="password" onChange={handleInput}></input>
            <button disabled={isLoading} className="button">Log in</button>
            {error && <p>{error}</p>}
          </form>
        </div>
      }
    </>
  )
}

export default Login
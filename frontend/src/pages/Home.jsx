import { useAuthContext } from "../hooks/UseAuthContext"

function Home() {
  const {dispatch} = useAuthContext()

  const handleLogout = () => {
    localStorage.removeItem('user')
    dispatch({type: 'logout'})
  }

  return (
    <button onClick={handleLogout}>Log out</button>
  )
}

export default Home
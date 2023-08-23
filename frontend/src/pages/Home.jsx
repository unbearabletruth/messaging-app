import { useAuthContext } from "../hooks/UseAuthContext"

function Home() {
  const {dispatch} = useAuthContext()

  const handleLogout = () => {
    localStorage.removeItem('user')
    dispatch({type: 'logout'})
  }

  return (
    <div className="background">

    </div>
  )
}

export default Home
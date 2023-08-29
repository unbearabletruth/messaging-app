import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import { useAuthContext } from './hooks/UseAuthContext';

function App() {
  const {user} = useAuthContext()
  const [chats, setChats] = useState(null)
  const [fetchChats, setFetchChats] = useState(false)

  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch(`http://localhost:3000/chats/users/${user.id}`)
      const json = await response.json()
      if (response.ok) {
        setChats(json)
      }
    }

    fetchChats()
  }, [fetchChats])

  const handleChats = (chats) => {
    setChats(chats)
  }

  const refetchChats = () => {
    setFetchChats(!fetchChats)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/*' element={user ? 
          <Sidebar chats={chats} handleChats={handleChats} refetchChats={refetchChats}/>
          : 
          <Navigate to='/login' />} />
        <Route path="/login" element={<Login />} />                            
      </Routes>
    </BrowserRouter>
  )
}

export default App

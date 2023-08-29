import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import MainWindow from './components/MainWindow';
import Login from './pages/Login';
import { useAuthContext } from './hooks/UseAuthContext';

function App() {
  const {user} = useAuthContext()
  const [chats, setChats] = useState(null)

  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch(`http://localhost:3000/chats/users/${user.id}`)
      const json = await response.json()
      if (response.ok) {
        setChats(json)
      }
    }

    fetchChats()
  }, [])

  const updateChats = (chats) => {
    setChats(chats)
  }

  console.log('app chats', chats)
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/*' element={user ? 
          <MainWindow chats={chats} updateChats={updateChats} />
          : 
          <Navigate to='/login' />} />
        <Route path="/login" element={<Login />} />                            
      </Routes>
    </BrowserRouter>
  )
}

export default App

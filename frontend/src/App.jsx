import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import './assets/styles/Buttons.css'
import './assets/styles/Popups.css'
import MainWindow from './pages/MainWindow';
import Login from './pages/Login';
import { useAuthContext } from './hooks/UseAuthContext';
import { useEffect } from 'react';
import backgroundLight from './assets/images/background.jpg'
import backgroundDark from './assets/images/background-dark.jpg'

function App() {
  const {user} = useAuthContext()

  useEffect(() => {
    new Image().src = backgroundLight
    new Image().src = backgroundDark
  }, [])
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/*' element={user ? 
          <MainWindow />
          : 
          <Navigate to='/login' />} />
        <Route path="/login" element={<Login />} />                            
      </Routes>
    </BrowserRouter>
  )
}

export default App

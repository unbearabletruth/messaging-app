import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import './assets/styles/Buttons.css'
import MainWindow from './pages/MainWindow';
import Login from './pages/Login';
import { useAuthContext } from './hooks/UseAuthContext';

function App() {
  const {user} = useAuthContext()
 
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

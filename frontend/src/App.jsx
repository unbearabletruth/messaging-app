import { useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import Sidebar from './components/Sidebar';
import Content from './components/Content';
import Login from './pages/Login';
import { useAuthContext } from './hooks/UseAuthContext';

function App() {
  const {user} = useAuthContext()
  console.log(user)
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/*' element={ <><Sidebar /><Content /></>} />
        <Route path="/login" element={<Login />} />                            
      </Routes>
    </BrowserRouter>
  )
}

export default App

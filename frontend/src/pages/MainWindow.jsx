import { useState, useEffect } from "react"
import '../assets/styles/Sidebar.css'
import '../assets/styles/Content.css'
import Sidebar from "../components/Sidebar";
import Chat from '../components/Chat';
import Home from '../components/Home';
import { useAuthContext } from '../hooks/UseAuthContext';

function MainWindow() {
  const {user} = useAuthContext()
  const [chats, setChats] = useState(null)
  const [currentChat, setCurrentChat] = useState(null)

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

  const handleChat = (chat) => {
    setCurrentChat(chat)
  }

  return (
    <>
      <Sidebar
        chats={chats}
        handleChat={handleChat}
        updateChats={updateChats} 
      />
      {currentChat ?
        <Chat 
          chat={currentChat}
          handleChat={handleChat}
          chats={chats} 
          updateChats={updateChats} 
        />
      :
        <Home />
      }
    </>
  )
}

export default MainWindow
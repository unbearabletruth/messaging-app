import { useState } from "react"
import '../assets/styles/Sidebar.css'
import '../assets/styles/Content.css'
import Sidebar from "./Sidebar";
import Chat from './Chat';
import Home from './Home';

function MainWindow({chats, updateChats}) {
  const [currentChat, setCurrentChat] = useState(null)

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
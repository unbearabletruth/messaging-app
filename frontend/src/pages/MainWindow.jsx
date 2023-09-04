import { useState, useEffect } from "react"
import '../assets/styles/Sidebar.css'
import '../assets/styles/Content.css'
import Sidebar from "../components/Sidebar";
import Chat from '../components/Chat';
import { useAuthContext } from '../hooks/UseAuthContext';
import { socket } from '../socket';

function MainWindow() {
  const {user, dispatch} = useAuthContext()
  const [chats, setChats] = useState(null)
  const [currentChat, setCurrentChat] = useState(null)
  const [refetch, setRefetch] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`http://localhost:3000/users/${user._id}`)
      const json = await response.json()
      if (response.ok) {
        dispatch({type: 'set', payload: json})
      }
    }
    if (user) {
      fetchUser()
    }
  }, [])

  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch(`http://localhost:3000/chats/users/${user._id}`)
      const json = await response.json()
      if (response.ok) {
        setChats(json)
      }
    }

    fetchChats()
  }, [refetch])

  useEffect(() => {
    socket.emit('setup', user)
    socket.on('online', (users) => {
      setOnlineUsers(users)
    })
  }, [])

  useEffect(() => {
    const handleOnlineStatus = async () => {
      if (document.visibilityState === 'visible') {
        socket.emit("online", user);
        socket.on("online", (users) => {
          setOnlineUsers(users)
        });
      } else {
        socket.emit("offline", user)  
      }
    };

    window.addEventListener("visibilitychange", handleOnlineStatus);
    return () => {
        window.removeEventListener("visibilitychange", handleOnlineStatus);
    };  
  }, []);

  const updateChats = (chats) => {
    setChats(chats)
  }

  const handleChat = (chat) => {
    setCurrentChat(chat)
  }

  const refetchChats = () => {
    setRefetch(!refetch)
  }

  return (
    <>
      <Sidebar
        chats={chats}
        handleChat={handleChat}
        updateChats={updateChats} 
      />
      <Chat 
        chat={currentChat}
        handleChat={handleChat}
        chats={chats} 
        updateChats={updateChats}
        refetchChats={refetchChats} 
      />
    </>
  )
}

export default MainWindow
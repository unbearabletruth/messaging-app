import { useState, useEffect } from "react"
import '../assets/styles/Sidebar.css'
import '../assets/styles/Content.css'
import Sidebar from "../components/Sidebar";
import Chat from '../components/Chat';
import { useAuthContext } from '../hooks/UseAuthContext';
import { useCurrentChatContext } from "../hooks/UseCurrentChatContext";
import { socket } from '../socket';

function MainWindow() {
  const {user, dispatch} = useAuthContext()
  const {currentChat, handleCurrentChat} = useCurrentChatContext()
  const [chats, setChats] = useState(null)
  const [messages, setMessages] = useState([])
  const [refetch, setRefetch] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [screenWidth, setScreenWidth] = useState(window.innerWidth)

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

  const newChat = async (e, partnerId) => {
    e.preventDefault()
    const newChat = {
      isGroupChat: false,
      users: [user._id, partnerId]
    }
    const response = await fetch(`http://localhost:3000/chats`, {
      method: 'POST',
      body: JSON.stringify(newChat),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      updateChats([json, ...chats])
      handleCurrentChat(json)
    }
  }

  const openChat = (e, userId) => {
    if (userId === user._id) return
    
    for (let chat of chats) {
      const chatExists = chat.users.find(u => u._id === userId)
      if (chatExists && !chat.isGroupChat) {
        handleCurrentChat(chat)
        return
      }
    };
    newChat(e, userId)
  }

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await Promise.all(chats.map(chat => 
        fetch(`http://localhost:3000/chats/${chat._id}/messages`)
          .then(res => res.json())
          .then(json => {
            return {id: chat._id, messages: json}
          })
      ))
      if (response) {
        setMessages(response)
      }
    }
    if (chats) {
      fetchMessages()
    }
  }, [chats])

  useEffect(() => {
    socket.emit('setup', user)
    socket.emit("online", user);
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

  useEffect(() => {
    const handleWindowResize = () => {
      setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [])

  const updateChats = (chats) => {
    setChats(chats)
  }

  const refetchChats = () => {
    setRefetch(!refetch)
  }

  return (
    screenWidth >= 768 ?
      <>
        <Sidebar
          chats={chats}
          updateChats={updateChats}
          onlineUsers={onlineUsers}
          allMessages={messages}
          openChat={openChat}
        />
        <Chat 
          chats={chats} 
          updateChats={updateChats}
          refetchChats={refetchChats}
          onlineUsers={onlineUsers}
          openChat={openChat} 
        />
      </>
      : currentChat !== null ?
        <Chat 
          chats={chats} 
          updateChats={updateChats}
          refetchChats={refetchChats}
          onlineUsers={onlineUsers} 
          screenWidth={screenWidth}
          openChat={openChat} 
        />
      :
        <Sidebar
          chats={chats}
          updateChats={updateChats}
          onlineUsers={onlineUsers} 
          allMessages={messages}
          openChat={openChat} 
        />
  )
}

export default MainWindow
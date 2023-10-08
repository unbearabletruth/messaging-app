import { useState, useEffect } from "react"
import '../assets/styles/Sidebar.css'
import '../assets/styles/Content.css'
import '../assets/styles/UserCard.css'
import Sidebar from "../components/sidebar/Sidebar";
import Chat from '../components/chat/Chat';
import { useAuthContext } from '../hooks/UseAuthContext';
import { useCurrentChatContext } from "../hooks/UseCurrentChatContext";
import { useOnlineUsersContext } from "../hooks/UseOnlineUsersContext";
import { useChatsContext } from "../hooks/UseChats";
import { socket } from '../socket';

function MainWindow() {
  const { user, dispatch } = useAuthContext()
  const { currentChat, handleCurrentChat } = useCurrentChatContext()
  const { setOnlineUsers } = useOnlineUsersContext()
  const { chats, handleChats } = useChatsContext()
  const [messages, setMessages] = useState([])
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
        handleChats(json)
      }
    }

    fetchChats()
  }, [user])

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
      handleChats([json, ...chats])
      handleCurrentChat(json)
    }
  }

  const openChat = (e, user2) => {
    if (user2 === user._id) return

    const fetchChat = async () => {
      const response = await fetch(`http://localhost:3000/chats/byUsers?user1=${user._id}&user2=${user2}`)
      const json = await response.json()
      if (!response.ok) {
        newChat(e, user2)
      }
      if (response.ok) {
        if (json.deletedBy.includes(user._id)) {
          return addUserBackToChat(json)
        }
        handleCurrentChat(json)
      }
    }
    fetchChat()
  }

  const addUserBackToChat = async (chat, incoming = false) => {
    const userId = {user: user._id}
    const response = await fetch(`http://localhost:3000/chats/${chat._id}/addFor`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      handleChats([json, ...chats])
      !incoming && handleCurrentChat(json)
      socket.emit('update chat', json)
    }
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

  return (
    screenWidth >= 768 ?
      <>
        <Sidebar
          allMessages={messages}
          openChat={openChat}
        />
        <Chat 
          openChat={openChat}
          addUserBackToChat={addUserBackToChat} 
        />
      </>
      : currentChat !== null ?
        <Chat 
          screenWidth={screenWidth}
          openChat={openChat}
          addUserBackToChat={addUserBackToChat}  
        />
      :
        <Sidebar
          allMessages={messages}
          openChat={openChat} 
        />
  )
}

export default MainWindow
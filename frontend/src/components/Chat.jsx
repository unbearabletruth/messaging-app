import '../assets/styles/Chat.css'
import '../assets/styles/Message.css'
import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../hooks/UseAuthContext';
import { useCurrentChatContext } from "../hooks/UseCurrentChatContext";
import { useOnlineUsersContext } from "../hooks/UseOnlineUsersContext";
import { useThemeContext } from "../hooks/UseThemeContext";
import { useChatsContext } from '../hooks/UseChats';
import { socket } from '../socket';
import closeIcon from '../assets/images/close-icon.svg'
import ChatHeader from './ChatHeader';
import NewMessage from './NewMessage';
import ChatField from './ChatField';

const isImage = ['gif','jpg','jpeg','png'];
const isVideo = ['mp4','mov']

function Chat({screenWidth, openChat}) {
  const { user } = useAuthContext()
  const { currentChat, handleCurrentChat } = useCurrentChatContext()
  const { chats, handleChats } = useChatsContext()
  const { onlineUsers } = useOnlineUsersContext()
  const { isDark } = useThemeContext()
  const [messages, setMessages] = useState([])
  const [mediaPopup, setMediaPopup] = useState(false)
  const [bigImage, setBigImage] = useState(null)
  const messagesToSkip = useRef(0)

  useEffect(() => {
    if (currentChat && !currentChat.privateGroup || currentChat &&
      currentChat.privateGroup && currentChat.users.some(u => u._id === user._id)) {
      setMessages([])
      messagesToSkip.current = 0
      fetchMessages()
    } else {
      setMessages([])
      messagesToSkip.current = 0
    }
  }, [currentChat && currentChat._id])

  const fetchMessages = async () => {
    const loadAmount = 50
    const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/messages?mes=${loadAmount}&skip=${messagesToSkip.current}`)
    const json = await response.json()
    if (response.ok) {
      setMessages(prevState => [...prevState, ...json])
    }
  }

  useEffect(() => {
    socket.on('receive message', (newMessage) => {
      if (currentChat && currentChat._id === newMessage.chat._id) {
        setMessages(prevState => [newMessage, ...prevState])
        if (onlineUsers.includes(user._id)){
          updateUserTimestampInChat()
        }
      } 
    })
    return () => socket.off('receive message')
  }, [currentChat && currentChat._id, onlineUsers])

  useEffect(() => {
    socket.on('receive chat', (updatedChat) => {
      if (currentChat && currentChat._id === updatedChat._id) {
        handleCurrentChat(updatedChat)
        handleChats(chats.map(c => c._id === updatedChat._id ? updatedChat : c))
        if (!chats.some(chat => chat._id === updatedChat._id)) {
          handleChats([updatedChat, ...chats])
        }
      } else {
        handleChats(chats.map(c => c._id === updatedChat._id ? updatedChat : c))
      }
    })
    return () => socket.off('receive chat')
  }, [currentChat && currentChat._id, chats])

  useEffect(() => {
    if (onlineUsers.includes(user._id)) {
      updateUserTimestampInChat()
    }
  }, [onlineUsers, currentChat && currentChat._id])

  const updateUserTimestampInChat = async () => {
    if (currentChat && currentChat.users.some(u => u._id === user._id)) {
      const userId = {user: user._id}
      const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/timestamp`, {
        method: 'PATCH',
        body: JSON.stringify(userId),
        headers: {
          'Content-type': 'application/json'
        }
      })
      const json = await response.json()
      if (response.ok) {
        socket.emit('joined chat', currentChat._id)
        socket.emit('update chat', json)
        const setChats = chats.map(chat => {
          if (chat._id === json._id) {
            return {
              ...chat, 
              lastSeenInChat: json.lastSeenInChat
            };
          }
          return chat;
        })
        handleChats(setChats);
      }
    }
  }

  const joinGroupChat = async () => {
    const userId = {user: user._id}
    const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/add`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      handleChats([json, ...chats])
      handleCurrentChat(json)
      socket.emit('update chat', json)
    }
  }

  const addRequest = async () => {
    const userId = {request: user._id}
    const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/addRequest`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      handleCurrentChat(json)
      socket.emit('update chat', json)
    }
  }
  
  const showBigImage = (media) => {
    setBigImage(media)
    setMediaPopup(true)
  }

  const addMessage = (newMessage) => {
    setMessages(prevState => [newMessage, ...prevState])
  }

  return (
    <div id='content' className={isDark ? 'dark' : ''}>
      {currentChat &&
      <>
        <ChatHeader
          screenWidth={screenWidth}
          openChat={openChat}
        />
        <ChatField
          messages={messages}
          fetchMessages={fetchMessages}
          showBigImage={showBigImage}
          messagesToSkip={messagesToSkip}
        />
        {currentChat && !currentChat.privateGroup && !currentChat.users.some(u => u._id === user._id) &&
          <button className='joinChatButton' onClick={joinGroupChat}>Join group</button>
        }
        {currentChat && currentChat.privateGroup && !currentChat.users.some(u => u._id === user._id) &&
          <div id='joinPrivateWrapper'>
            <img src={currentChat.groupPic} alt='group image' id='joinPrivateImage'></img>
            <p id='joinPrivateName'>{currentChat.name}</p>
            <p id='joinPrivateSubscribers'>{currentChat.users.length} {currentChat.users.length === 1 ? 'subscriber' : 'subscribers'}</p>
            <p id='joinPrivateInfo'>This is a private group</p>
            {!currentChat.requests.some(u => u._id === user._id) ?
              <button className='formButton' id='joinPrivateButton' onClick={addRequest}>Request to join</button>
              :
              <p id='joinPrivateSent'>Request has been sent</p>
            }
          </div>
        }
        <NewMessage addMessage={addMessage}/>
      </>
      }
      {mediaPopup &&
        <div className="popupBackground media">
          <button onClick={() => setMediaPopup(false)} className="mainButton closePopup">
              <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
          </button>
          {isImage.some(type => bigImage.includes(type)) &&
            <img src={bigImage} alt='media big' className='messageMediaBig'></img>
          }
          {isVideo.some(type => bigImage.includes(type)) &&
            <video src={bigImage} className='messageMediaBig' controls></video>
          }
        </div>
      }
    </div>
  )
}

export default Chat
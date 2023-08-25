import '../assets/styles/Chat.css'
import { useState, useEffect, useRef } from 'react';
import { useLocation } from "react-router-dom";
import moment from 'moment';
import { useAuthContext } from '../hooks/UseAuthContext';
import { io } from 'socket.io-client'

let socket = io('http://localhost:3000')

function Chat() {
  const [messages, setMessages] = useState([])
  const {user} = useAuthContext()
  const [chat, setChat] = useState(null)
  const [newMessage, setNewMessage] = useState({
    author: '',
    chat: '',
    text: ''
  })
  const { state } = useLocation()

  useEffect(() => {
    socket.on('receive message', (newMessage) => {
      if (chat && chat._id === newMessage.chat) {
        setMessages(prevState => [...prevState, newMessage])
      }
    })
    return () => socket.off('receive message')
  }, [chat])

  useEffect(() => {
    setChat(state)
    setNewMessage({
      author: user.id,
      chat: state._id,
      text: ''
    })
  }, [state])

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`http://localhost:3000/chats/${chat._id}/messages`)
      const json = await response.json()
      if (response.ok) {
        setMessages(json)
        socket.emit('joined chat', chat._id)
      }
    }
    if (chat) {
      fetchMessages()
    }
  }, [chat])

  const submitMessage = async (e) => {
    e.preventDefault()
    const response = await fetch(`http://localhost:3000/chats/${chat._id}/messages`, {
      method: 'POST',
      body: JSON.stringify(newMessage),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      setNewMessage({
        ...newMessage,
        text: ''
      })
      updateChatLatestMessage(json)
      setMessages(prevState => [...prevState, json])
      socket.emit('new message', json, chat)
    }
  }

  const updateChatLatestMessage = async (message) => {
    const latestMessage = {latestMessage: message._id}
    const response = await fetch(`http://localhost:3000/chats/${chat._id}`, {
      method: 'PATCH',
      body: JSON.stringify(latestMessage),
      headers: {
        'Content-type': 'application/json'
      }
    })
  }
  
  const handleMessage = (e) => {
    setNewMessage({
      ...newMessage,
      text: e.target.value
    })
  }

  return (
    <>
      <div className="chatHeader">
        {chat && 
          !chat.isGroupChat && chat.users.map(u => {
            return (
              u.username !== user.username &&
                <div className='chatHeaderUser' key={u._id}>
                  <img src={u.profilePic} alt="profile picture" className="chatHeaderPic"></img>
                  <div>
                    <p className="sidebarName">{u.username}</p>
                  </div>
                </div>
            )}
          )
        }
      </div>
      <div className="chatField">
        {messages && messages.toReversed().map(message => {
          return (
            <div className={message.author === user.id ? 'myMessage' : 'message'} key={message._id}>
              <span className='messageText'>{message.text}</span>
              <span className='messageTime'>{moment(message.createdAt).format('hh:mm')}</span>
            </div>
          )
        })}
      </div>
      <form onSubmit={submitMessage} id='messageForm'>
        <input type='text' onChange={handleMessage} value={newMessage.text} id='messageInput' placeholder='Message'></input>
      </form>
    </>
  )
}

export default Chat
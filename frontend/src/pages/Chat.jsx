import '../assets/styles/Chat.css'
import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import moment from 'moment';
import { useAuthContext } from '../hooks/UseAuthContext';

function Chat() {
  const {id} = useParams();
  const [messages, setMessages] = useState(null)
  const {user} = useAuthContext()
  const [chat, setChat] = useState(null)
  const [newMessage, setNewMessage] = useState({
    author: '',
    chat: '',
    text: ''
  })

  useEffect(() => {
    const fetchChat = async () => {
      const response = await fetch(`http://localhost:3000/chats/${id}`)
      const json = await response.json()
      if (response.ok) {
        setChat(json)
        setNewMessage({
          author: user.id,
          chat: id,
          text: ''
        })
      }
    }

    fetchChat()
  }, [id])

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`http://localhost:3000/chats/${id}/messages`)
      const json = await response.json()
      if (response.ok) {
        setMessages(json)
      }
    }

    fetchMessages()
  }, [id])

  const submitMessage = async (e) => {
    e.preventDefault()
    const response = await fetch(`http://localhost:3000/chats/${id}/messages`, {
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
    }
  }

  const updateChatLatestMessage = async (message) => {
    const latestMessage = {latestMessage: message._id}
    const response = await fetch(`http://localhost:3000/chats/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(latestMessage),
      headers: {
        'Content-type': 'application/json'
      }
    })
    if (response.ok) {
      setNewMessage({
        ...newMessage,
        text: ''
      })
    }
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
      <div className="background">
        {messages && messages.map(message => {
          return (
            <div className={message.author.username === user.username ? 'myMessage' : 'message'} key={message._id}>
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
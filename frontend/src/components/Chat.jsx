import '../assets/styles/Chat.css'
import { useState, useEffect } from 'react';
import moment from 'moment';
import { useAuthContext } from '../hooks/UseAuthContext';
import { socket } from '../socket';

function Chat({chat, handleChat, chats, updateChats, refetchChats}) {
  const [messages, setMessages] = useState([])
  const {user} = useAuthContext()
  const [newMessage, setNewMessage] = useState({
    author: '',
    chat: '',
    text: ''
  })

  useEffect(() => {
    socket.on('receive message', (newMessage) => {
      if (chat && chat._id === newMessage.chat._id) {
        setMessages(prevState => [...prevState, newMessage])
      } else {
        refetchChats()
      }
    })
    return () => socket.off('receive message')
  }, [chat])

  useEffect(() => {
    if (chat) {
      setNewMessage({
        author: user._id,
        chat: chat._id,
        text: ''
      })
    }
  }, [chat])

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
    const json = await response.json()
    if (response.ok) {
      const setChats = chats.map(chat => {
        if (chat._id === json._id) {
          return {
            ...chat, 
            latestMessage: json.latestMessage
          };
        }
        return chat;
      })
      updateChats(setChats);
    }
  }

  const joinGroupChat = async () => {
    const userId = {user: user._id}
    const response = await fetch(`http://localhost:3000/chats/${chat._id}/add`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      updateChats([json, ...chats])
      handleChat(json)
    }
  }

  const leaveGroupChat = async () => {
    const userId = {user: user._id}
    const response = await fetch(`http://localhost:3000/chats/${chat._id}/remove`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      updateChats(chats.filter(c => c._id !== chat._id))
      handleChat(json)
    }
  }
  
  const handleMessage = (e) => {
    setNewMessage({
      ...newMessage,
      text: e.target.value
    })
  }
  //chat && console.log(chat, chat.users.some(u => u._id === user.id), user.id)
  return (
    <div id='content'>
      {chat ?
      <>
        <div className="chatHeader">
          {chat && !chat.isGroupChat && chat.users.map(u => {
              return (
                u.username !== user.username &&
                  <div className='chatHeaderUser' key={u._id}>
                    <img src={u.profilePic} alt="profile picture" className="chatHeaderPic"></img>
                    <div>
                      <p className="sidebarName">{u.username}</p>
                    </div>
                  </div>
              )}
            )}
          {chat && chat.isGroupChat && 
            <>
              <p> Welcome to {chat.name}!</p>
              {chat.users.some(u => u._id === user._id) &&
                <button id='leaveChat' onClick={leaveGroupChat}>Leave group</button>
              }
            </>
          }
        </div>
        <div className="chatField">
          {chat && messages && messages.toReversed().map(message => {
            return (
              <div className={message.author._id === user._id ? 'myMessage' : 'message'} key={message._id}>
                {chat.isGroupChat && message.author._id !== user._id &&
                  <span className='messageAuthor'>{message.author.username}</span>
                }
                <div className='messageContent'>
                  <span className='messageText'>{message.text}</span>
                  <span className='messageTime'>{moment(message.createdAt).format('hh:mm')}</span>
                </div>
              </div>
            )
          })}
        </div>
        {chat && !chat.users.some(u => u._id === user._id) &&
          <button className='joinChatButton' onClick={joinGroupChat}>Join group</button>
        }
        <form onSubmit={submitMessage} id='messageForm'>
          <input type='text' onChange={handleMessage} value={newMessage.text} id='messageInput' placeholder='Message'></input>
        </form>
      </>
      :
      <div className="homeField"></div>
      }
    </div>
  )
}

export default Chat
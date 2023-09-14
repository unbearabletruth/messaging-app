import '../assets/styles/Chat.css'
import '../assets/styles/Message.css'
import { useState, useEffect } from 'react';
import moment from 'moment';
import { useAuthContext } from '../hooks/UseAuthContext';
import { socket } from '../socket';
import closeIcon from '../assets/images/close-icon.svg'
import readIcon from '../assets/images/read.svg'
import sentIcon from '../assets/images/sent-check.svg'
import ChatHeader from './ChatHeader';
import NewMessage from './NewMessage';

function Chat({chat, handleChat, chats, updateChats, refetchChats, onlineUsers, screenWidth}) {
  const [messages, setMessages] = useState([])
  const [mediaPopup, setMediaPopup] = useState(false)
  const [bigImage, setBigImage] = useState(null)
  const {user} = useAuthContext()

  useEffect(() => {
    socket.on('receive message', (newMessage) => {
      if (chat && chat._id === newMessage.chat._id) {
        setMessages(prevState => [...prevState, newMessage])
        if (onlineUsers.includes(user._id)){
          updateUserTimestampInChat()
        }
      } else {
        refetchChats()
      }
    })
    return () => socket.off('receive message')
  }, [chat && chat._id, onlineUsers])

  useEffect(() => {
    socket.on('receive chat', (updatedChat) => {
      if (chat && chat._id === updatedChat._id) {
        console.log('received chat with new ts')
        handleChat(updatedChat)
        if (!chats.some(chat => chat._id === updatedChat._id)) {
          updateChats([updatedChat, ...chats])
        }
      } else {
        updateChats(chats.map(c => c._id === updatedChat._id ? updatedChat : c))
      }
    })
    return () => socket.off('receive chat')
  }, [chat && chat._id, chats])

  useEffect(() => {
    if (onlineUsers.includes(user._id)) {
      updateUserTimestampInChat()
    }
  }, [onlineUsers, chat && chat._id])

  const updateUserTimestampInChat = async () => {
    if (chat) {
      const lastSeenInChat = {lastSeenInChat: {id: user._id, timestamp: Date.now()}}
      const response = await fetch(`http://localhost:3000/chats/${chat._id}/timestamp`, {
        method: 'PATCH',
        body: JSON.stringify(lastSeenInChat),
        headers: {
          'Content-type': 'application/json'
        }
      })
      const json = await response.json()
      if (response.ok) {
        socket.emit('joined chat', chat._id)
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
        updateChats(setChats);
      }
    }
  }

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`http://localhost:3000/chats/${chat._id}/messages`)
      const json = await response.json()
      if (response.ok) {
        setMessages(json)
      }
    }
    
    if (chat && !chat.privateGroup || chat &&
    chat.privateGroup && chat.users.some(u => u._id === user._id)) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [chat && chat._id])

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

  const addRequest = async () => {
    const userId = {request: user._id}
    const response = await fetch(`http://localhost:3000/chats/${chat._id}/addRequest`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      console.log(json)
      handleChat(json)
      socket.emit('update chat', json)
    }
  }
  
  const showBigImage = (media) => {
    setBigImage(media)
    setMediaPopup(true)
  }

  const addMessage = (newMessage) => {
    setMessages(prevState => [...prevState, newMessage])
  }

  return (
    <div id='content'>
      {chat ?
      <>
        <ChatHeader 
          chat={chat} 
          chats={chats} 
          onlineUsers={onlineUsers} 
          updateChats={updateChats} 
          handleChat={handleChat} 
          screenWidth={screenWidth}
        />
        <div className="chatField">
          {chat && messages && messages.toReversed().map(message => {
            return (
              <div className={message.author._id === user._id ? 'myMessage' : 'message'} key={message._id}>
                {message.media &&
                  <img src={message.media} alt='message media' className='messageMedia' onClick={() => showBigImage(message.media)}></img>
                }
                {chat.isGroupChat && message.author._id !== user._id &&
                  <span className='messageAuthor'>{message.author.username}</span>
                }
                <div className='messageContent'>
                  {message.text}
                  <span className='messageSideInfo'>
                    <span className='messageTime'>{moment(message.createdAt).format('hh:mm')}</span>
                    {!chat.lastSeenInChat.some(lastSeen => lastSeen.id !== user._id &&
                    lastSeen.timestamp < message.createdAt) && 
                    message.author._id === user._id ?
                      <img src={readIcon} alt='read' className='messageRead'></img> 
                      : message.author._id === user._id ?
                      <img src={sentIcon} alt='sent' className='messageSent'></img>
                      :
                      null
                    }
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        {chat && !chat.privateGroup && !chat.users.some(u => u._id === user._id) &&
          <button className='joinChatButton' onClick={joinGroupChat}>Join group</button>
        }
        {chat && chat.privateGroup && !chat.users.some(u => u._id === user._id) &&
          <div id='joinPrivateWrapper'>
            <img src={chat.groupPic} alt='group image' id='joinPrivateImage'></img>
            <p id='joinPrivateName'>{chat.name}</p>
            <p id='joinPrivateSubscribers'>{chat.users.length} {chat.users.length === 1 ? 'subscriber' : 'subscribers'}</p>
            <p id='joinPrivateInfo'>This is a private group</p>
            {!chat.requests.some(u => u._id === user._id) ?
              <button className='formButton' id='joinPrivateButton' onClick={addRequest}>Request to join</button>
              :
              <p id='joinPrivateSent'>Request has been sent</p>
            }
          </div>
        }
        <NewMessage chat={chat} addMessage={addMessage} chats={chats} updateChats={updateChats}/>
      </>
      :
      <div className="homeField"></div>
      }
      {mediaPopup &&
        <div className="popupBackground media">
          <button onClick={() => setMediaPopup(false)} className="mainButton closePopup">
              <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
          </button>
          <img src={bigImage} alt='media big' id='messageMediaBig'></img>
        </div>
      }
    </div>
  )
}

export default Chat
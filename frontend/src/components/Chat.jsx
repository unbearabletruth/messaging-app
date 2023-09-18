import '../assets/styles/Chat.css'
import '../assets/styles/Message.css'
import { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { useAuthContext } from '../hooks/UseAuthContext';
import { useCurrentChatContext } from "../hooks/UseCurrentChatContext";
import { useOnlineUsersContext } from "../hooks/UseOnlineUsersContext";
import { socket } from '../socket';
import closeIcon from '../assets/images/close-icon.svg'
import readIcon from '../assets/images/read.svg'
import sentIcon from '../assets/images/sent-check.svg'
import toBottomIcon from '../assets/images/to-bottom.svg'
import ChatHeader from './ChatHeader';
import NewMessage from './NewMessage';

function Chat({chats, updateChats, refetchChats, screenWidth, openChat}) {
  const { user } = useAuthContext()
  const { currentChat, setCurrentChat } = useCurrentChatContext()
  const { onlineUsers } = useOnlineUsersContext()
  const [messages, setMessages] = useState([])
  const [mediaPopup, setMediaPopup] = useState(false)
  const [bigImage, setBigImage] = useState(null)
  const [scrollButton, setScrollButton] = useState(false)
  const chatWindow = useRef(null);

  useEffect(() => {
    socket.on('receive message', (newMessage) => {
      if (currentChat && currentChat._id === newMessage.chat._id) {
        setMessages(prevState => [...prevState, newMessage])
        if (onlineUsers.includes(user._id)){
          updateUserTimestampInChat()
        }
      } else {
        refetchChats()
      }
    })
    return () => socket.off('receive message')
  }, [currentChat && currentChat._id, onlineUsers])

  useEffect(() => {
    socket.on('receive chat', (updatedChat) => {
      if (currentChat && currentChat._id === updatedChat._id) {
        console.log('received chat with new ts')
        setCurrentChat(updatedChat)
        if (!chats.some(chat => chat._id === updatedChat._id)) {
          updateChats([updatedChat, ...chats])
        }
      } else {
        updateChats(chats.map(c => c._id === updatedChat._id ? updatedChat : c))
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
    if (currentChat) {
      const lastSeenInChat = {lastSeenInChat: {id: user._id, timestamp: Date.now()}}
      const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/timestamp`, {
        method: 'PATCH',
        body: JSON.stringify(lastSeenInChat),
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
        updateChats(setChats);
      }
    }
  }

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/messages`)
      const json = await response.json()
      if (response.ok) {
        setMessages(json)
      }
    }
    
    if (currentChat && !currentChat.privateGroup || currentChat &&
      currentChat.privateGroup && currentChat.users.some(u => u._id === user._id)) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [currentChat && currentChat._id])

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
      setCurrentChat(json)
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
      console.log(json)
      setCurrentChat(json)
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

  const scrollBottom = () => {
    chatWindow.current.scrollTo({ behavior: 'smooth', top: 0 });
  };

  const handleScrollButton = (e) => {
    //chat is reversed, so is scrollTop
    const buttonAppearHeight = e.target.clientHeight / 3
    if (buttonAppearHeight > Math.abs(e.target.scrollTop)) {
      setScrollButton(false)
    } else {
      setScrollButton(true)
    }
  }
  return (
    <div id='content'>
      {currentChat ?
      <>
        <ChatHeader 
          chats={chats} 
          updateChats={updateChats} 
          screenWidth={screenWidth}
          openChat={openChat}
        />
        <div className="chatField" onScroll={handleScrollButton} ref={chatWindow}>
          {currentChat && messages && messages.toReversed().map(message => {
            return (
              <div className={message.author._id === user._id ? 'myMessage' : 'message'} key={message._id}>
                {message.media &&
                  <img src={message.media} alt='message media' className='messageMedia' onClick={() => showBigImage(message.media)}></img>
                }
                {currentChat.isGroupChat && message.author._id !== user._id &&
                  <span className='messageAuthor'>{message.author.username}</span>
                }
                <div className='messageContent'>
                  {message.text}
                  <span className='messageSideInfo'>
                    <span className='messageTime'>{moment(message.createdAt).format('hh:mm')}</span>
                    {!currentChat.lastSeenInChat.some(lastSeen => lastSeen.id !== user._id &&
                    lastSeen.timestamp < message.updatedAt) && 
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
          <button className={`bigButton toBottom ${scrollButton ? 'visible' : ''}`} onClick={scrollBottom}>
            <img src={toBottomIcon} alt="scroll bottom" className="bigButtonImg"></img>
          </button>
        </div>
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
        <NewMessage addMessage={addMessage} chats={chats} updateChats={updateChats}/>
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
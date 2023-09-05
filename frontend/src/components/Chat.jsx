import '../assets/styles/Chat.css'
import { useState, useEffect } from 'react';
import moment from 'moment';
import { useAuthContext } from '../hooks/UseAuthContext';
import { socket } from '../socket';
import closeIcon from '../assets/images/close-icon.svg'
import UploadForm from './NewMessage';

function Chat({chat, handleChat, chats, updateChats, refetchChats, onlineUsers}) {
  const [mediaPopup, setMediaPopup] = useState(false)
  const [bigImage, setBigImage] = useState(null)
  const [messages, setMessages] = useState([])
  const {user} = useAuthContext()

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
  
  const showBigImage = (media) => {
    setBigImage(media)
    setMediaPopup(true)
  }

  const addMessage = (newMessage) => {
    setMessages(prevState => [...prevState, newMessage])
  }
  console.log(chat)
  return (
    <div id='content'>
      {chat ?
      <>
        <div id="chatHeader">
          {chat && !chat.isGroupChat && chat.users.map(u => {
              return (
                u.username !== user.username &&
                  <div id='chatHeaderUser' key={u._id}>
                    <img src={u.profilePic} alt="profile picture" id="chatHeaderPic"></img>
                    <div id='chatUserInfo'>
                      <p id="chatUsername">{u.username}</p>
                      {onlineUsers.includes(u._id) ? 
                        <p id='chatUserStatus'>online</p>
                        : u.lastSeen &&
                        <p id='chatLastSeen'>last seen {moment(u.lastSeen).fromNow()}</p>
                      }
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
                {message.media &&
                  <img src={message.media} alt='message media' className='messageMedia' onClick={() => showBigImage(message.media)}></img>
                }
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
        <UploadForm chat={chat} addMessage={addMessage} chats={chats} updateChats={updateChats}/>
      </>
      :
      <div className="homeField"></div>
      }
      {mediaPopup &&
        <div className="popupBackground media">
          <button onClick={() => setMediaPopup(false)} className="closePopup">
              <img src={closeIcon} alt="x" className="closeIcon"></img>
          </button>
          <img src={bigImage} alt='media big' id='messageMediaBig'></img>
        </div>
      }
    </div>
  )
}

export default Chat
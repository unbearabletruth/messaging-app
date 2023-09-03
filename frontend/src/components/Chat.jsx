import '../assets/styles/Chat.css'
import { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { useAuthContext } from '../hooks/UseAuthContext';
import { socket } from '../socket';
import attachIcon from '../assets/images/attach.svg'
import closeIcon from '../assets/images/close-icon.svg'

function Chat({chat, handleChat, chats, updateChats, refetchChats}) {
  const isImage = ['gif','jpg','jpeg','png'];
  const [wrongFile, setWrongFile] = useState(false)
  const fileInputRef = useRef(null);
  const [uploadPopup, setUploadPopup] = useState(false)
  const [mediaPopup, setMediaPopup] = useState(false)
  const [bigImage, setBigImage] = useState(null)
  const [messages, setMessages] = useState([])
  const {user} = useAuthContext()
  const [newMessage, setNewMessage] = useState({
    author: '',
    chat: '',
    text: '',
    media: null
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
    if (newMessage.text) {
      const formData = new FormData();
      formData.append('media', newMessage.media);
      formData.append('text', newMessage.text);
      formData.append('chat', newMessage.chat);
      formData.append('author', newMessage.author);
  
      const response = await fetch(`http://localhost:3000/chats/${chat._id}/messages`, {
        method: 'POST',
        body: formData
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
        if (uploadPopup) {setUploadPopup(false)}
      }
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

  const onMediaChange = (e) => {
    if (isImage.some(type => e.target.files[0].type.includes(type))) {
        setNewMessage({
          ...newMessage,
          media: e.target.files[0]
        })
        setUploadPopup(true)  
      }
    else {
      fileInputRef.current.value = null
      setWrongFile(true)
    }
  }

  useEffect(() => {
    if (wrongFile === true) {
      const timeId = setTimeout(() => {
          setWrongFile(false)
        }, 7000)
    
      return () => {
        clearTimeout(timeId)
      }
    }
  }, [wrongFile]);

  const showBigImage = (media) => {
    setBigImage(media)
    setMediaPopup(true)
  }

  const onMediaPopupClose = () => {
    setMediaPopup(false)
    setNewMessage({
      ...newMessage,
      text: '',
      media: null
    })
    fileInputRef.current.value = null
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
        <form onSubmit={submitMessage} id='messageForm'>
          <input type='text' onChange={handleMessage} value={newMessage.text} id='messageInput' placeholder='Message'></input>
          <label>
            <div className='mainButton'>
              <input 
                type="file" 
                className='uploadInput' 
                onChange={onMediaChange} 
                accept='.gif,.jpg,.jpeg,.png'
                ref={fileInputRef} 
              >
              </input>
              <img src={attachIcon} alt='attach' className="mainButtonImg"></img>
            </div>
          </label>
        </form>
      </>
      :
      <div className="homeField"></div>
      }
      {wrongFile &&
        <div id="wrongFileMessage">
          <p className="wrongFileLine">Please, check that your file is:</p>
          <p className="wrongFileLine">Image: gif, jpg, jpeg, png</p>
        </div>
      }
      {uploadPopup &&
        <div className="popupBackground">
          <div className="popup" id="uploadMediaPopup">
            <button onClick={() => setUploadPopup(false)} className="closePopup">
              <img src={closeIcon} alt="x" className="closeIcon"></img>
            </button>
            <img 
              src={URL.createObjectURL(newMessage.media)}
              alt="upload preview" 
              id='uploadImagePreview'
            >
            </img>
            <form id="uploadForm" onSubmit={submitMessage} encType="multipart/form-data">
              <input 
                id="uploadCaptionInput" 
                name="text" 
                onChange={handleMessage}
                aria-label="message text"
                placeholder="Text"
              >
              </input>
              {newMessage.text ?
                <button className="formButton">Send</button>
                :
                <button type='button' className="formButtonInactive">Send</button>
              }
            </form>
          </div>
        </div>
      }
      {mediaPopup &&
        <div className="popupBackground media">
          <button onClick={onMediaPopupClose} className="closePopup">
              <img src={closeIcon} alt="x" className="closeIcon"></img>
          </button>
          <img src={bigImage} alt='media big' id='messageMediaBig'></img>
        </div>
      }
    </div>
  )
}

export default Chat
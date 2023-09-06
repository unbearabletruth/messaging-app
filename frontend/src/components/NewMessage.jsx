import attachIcon from '../assets/images/attach.svg'
import closeIcon from '../assets/images/close-icon.svg'
import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../hooks/UseAuthContext';
import { socket } from '../socket';

function NewMessage({chat, addMessage, chats, updateChats}) {
  const {user} = useAuthContext()
  const isImage = ['gif','jpg','jpeg','png'];
  const [wrongFile, setWrongFile] = useState(false)
  const fileInputRef = useRef(null);
  const [uploadPopup, setUploadPopup] = useState(false)
  const [newMessage, setNewMessage] = useState({
    author: '',
    chat: '',
    text: '',
    media: null
  })

  useEffect(() => {
    if (chat) {
      setNewMessage({
        author: user._id,
        chat: chat._id,
        text: ''
      })
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
        addMessage(json)
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

  const onUploadPopupClose = () => {
    setUploadPopup(false)
    setNewMessage({
      ...newMessage,
      text: '',
      media: null
    })
    fileInputRef.current.value = null
  }

  const handleMessage = (e) => {
    setNewMessage({
      ...newMessage,
      text: e.target.value
    })
  }

  return (
    <>
      <form onSubmit={submitMessage} id='messageForm'>
        <input 
          type='text' 
          onChange={handleMessage} 
          value={uploadPopup ? '' : newMessage.text} 
          id='messageInput' 
          placeholder='Message'
          aria-label='new message'
        >
        </input>
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
      {uploadPopup &&
        <div className="popupBackground">
          <div className="popup" id="uploadMediaPopup">
            <button onClick={onUploadPopupClose} className="closePopup">
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
      {wrongFile &&
        <div className="wrongFileMessage">
          <p className="wrongFileLine">Please, check that your file is:</p>
          <p className="wrongFileLine">Image: gif, jpg, jpeg, png</p>
        </div>
      }
    </>
  )
}

export default NewMessage
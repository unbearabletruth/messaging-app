import closeIcon from '../../assets/images/close-icon.svg'
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthContext } from '../../hooks/UseAuthContext';
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";
import { useThemeContext } from "../../hooks/UseThemeContext";
import { useChatsContext } from '../../hooks/UseChats';
import { socket } from '../../socket';
import smileyIcon from '../../assets/images/smiley-face.svg'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import MediaPreview from './MediaPreview';
import useClickOutside from '../../hooks/UseClickOutside';
import UploadMenu from './UploadMenu';
import sendIcon from '../../assets/images/send-icon.svg'

const isImage = ['gif','jpg','jpeg','png'];
const isVideo = ['mp4','mov']
const sizeLimit = 10 * 1024 * 1024 // 10 Mb
const charLimit = 4096

function NewMessage({addMessage}) {
  const { user } = useAuthContext()
  const { currentChat } = useCurrentChatContext()
  const { chats, handleChats } = useChatsContext() 
  const { isDark } = useThemeContext()
  const [wrongFile, setWrongFile] = useState('')
  const fileInputRef = useRef(null)
  const imgVidInputRef = useRef(null)
  const textboxRef = useRef(null)
  const textboxPopupRef = useRef(null)
  const [uploadPopup, setUploadPopup] = useState(false)
  const { triggerRef, nodeRef, showMenu } = useClickOutside(false)
  const [newMessage, setNewMessage] = useState({
    author: '',
    chat: '',
    text: '',
    media: null
  })

  useEffect(() => {
    if (currentChat) {
      setNewMessage({
        author: user._id,
        chat: currentChat._id,
        text: ''
      })
    }
  }, [currentChat])

  const submitMessage = async (e) => {
    e.preventDefault()
    if (newMessage.text) {
      const formData = new FormData();
      formData.append('media', newMessage.media);
      formData.append('text', newMessage.text);
      formData.append('chat', newMessage.chat);
      formData.append('author', newMessage.author);
  
      const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/messages`, {
        method: 'POST',
        body: formData
      })
      const json = await response.json()
      if (response.ok) {
        setNewMessage({
          ...newMessage,
          text: '',
          media: null
        })
        fileInputRef.current.value = null
        imgVidInputRef.current.value = null
        updateChatLatestMessage(json)
        addMessage(json)
        socket.emit('new message', json, currentChat)
        if (uploadPopup) {setUploadPopup(false)}
      }
    }
  }

  const updateChatLatestMessage = async (message) => {
    const latestMessage = {latestMessage: message._id}
    const response = await fetch(`http://localhost:3000/chats/${currentChat._id}`, {
      method: 'PATCH',
      body: JSON.stringify(latestMessage),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      socket.emit('update chat', json)
      const setChats = chats.map(chat => {
        if (chat._id === json._id) {
          return {
            ...chat, 
            latestMessage: json.latestMessage
          };
        }
        return chat;
      })
      handleChats(setChats);
    }
  }

  const onImageOrVideoChange = (e) => {
    if (e.target.files[0].size > sizeLimit) {
      imgVidInputRef.current.value = null
      setWrongFile('tooBig')
      return
    }
    if (isImage.some(type => e.target.files[0].type.includes(type)) ||
    isVideo.some(type => e.target.files[0].type.includes(type))) {
      setNewMessage({
        ...newMessage,
        media: e.target.files[0]
      })
      setUploadPopup(true)  
    }
    else {
      imgVidInputRef.current.value = null
      setWrongFile('wrongType')
    }
  }

  const onFileChange = (e) => {
    if (e.target.files[0].size > sizeLimit) {
      fileInputRef.current.value = null
      setWrongFile('tooBig')
      return
    }
    setNewMessage({
      ...newMessage,
      media: e.target.files[0]
    })
    setUploadPopup(true)  
  }

  useEffect(() => {
    if (uploadPopup && newMessage.text) {
      textboxPopupRef.current.textContent = textboxRef.current.textContent  
      textboxRef.current.textContent = null
    }
  }, [uploadPopup])

  useEffect(() => {
    if (wrongFile) {
      const timeId = setTimeout(() => {
          setWrongFile('')
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
    imgVidInputRef.current.value = null
  }

  const handleMessage = (e) => {
    setNewMessage({
      ...newMessage,
      text: e.target.textContent
    })
  }

  const handleEnter = (e) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault()
      submitMessage(e)
    }
  }

  useEffect(() => {
    if (uploadPopup) {
      textboxPopupRef.current.textContent = newMessage.text
    } else {
      textboxRef.current.textContent = newMessage.text
    }
  }, [newMessage.text])

  const onEmojiSelect = (emoji) => {
    setNewMessage({
      ...newMessage,
      text: newMessage.text.concat(emoji.native)
    })
  }

  const mediaPreview = useMemo(() => (
    newMessage.media &&
      <MediaPreview 
        media={newMessage.media} 
        isImage={isImage} 
        isVideo={isVideo}
      />
  ), [newMessage.media])
  
  const formatTooManySymbols = () => {
    let string = Math.abs(charLimit - newMessage.text.length).toString()
    if (string.length > 3) {
      string = `${string.slice(0, -3)}k`
    }
    return string
  }

  return (
    <>
      <div id='messageFormWrapper'>
        <form onSubmit={submitMessage} id='messageForm'>
          <button type='button' className='mainButton textbox' ref={triggerRef}>
            <img src={smileyIcon} alt='emoji picker' className="mainButtonImg"></img>
          </button>
          <div id='emojiPickerWrapper' className={showMenu ? 'visible' : ''} ref={nodeRef}>
            <Picker
              data={data}
              onEmojiSelect={onEmojiSelect}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>
          <div 
            ref={textboxRef}
            onInput={handleMessage}
            onKeyDown={handleEnter}
            id='messageInput'
            className='scrollable' 
            aria-label='new message'
            role='textbox'
            contentEditable='true'
            tabIndex='0'
            data-placeholder='Message'
          >
          </div>
          <div id='uploadButtonBlock'>
            {newMessage.text.length > 4096 && !uploadPopup &&
              <div className="tooManySymbols">
                {formatTooManySymbols()}
              </div>
            }
            <UploadMenu 
              onImageOrVideoChange={onImageOrVideoChange} 
              onFileChange={onFileChange} 
              imgVidInputRef={imgVidInputRef}
              fileInputRef={fileInputRef}
            />
          </div>
        </form>
        {(!newMessage.text || newMessage.text.length > 4096) || uploadPopup ?
          <button className='bigButtonInactive send' form='messageForm' type='button'>
            <img src={sendIcon} alt='send' className="bigButtonImg"></img>
          </button>
          :
          <button className='bigButton send' form='messageForm'>
            <img src={sendIcon} alt='send' className="bigButtonImg"></img>
          </button>
        }
      </div>
      {uploadPopup &&
        <div className="popupBackground">
          <div className="popup" id="uploadMediaPopup">
            <button onClick={onUploadPopupClose} className="mainButton closePopup">
              <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
            </button>
            {mediaPreview}
            <form id="uploadForm" onSubmit={submitMessage} encType="multipart/form-data">
              <div 
                ref={textboxPopupRef}
                onInput={handleMessage}
                onKeyDown={handleEnter}
                id="uploadInput"
                className='scrollable'
                aria-label='new message'
                role='textbox'
                contentEditable='true'
                tabIndex='0'
                data-placeholder='Text'
              >
              </div>
              <div id='uploadPopupFooter'>
                {!newMessage.text || newMessage.text.length > 4096 ?
                  <button type='button' className="formButtonInactive">Send</button>
                  :
                  <button className="formButton">Send</button>
                }
                {newMessage.text.length > 4096 &&
                  <div className="tooManySymbols">
                    {Math.abs(4096 - newMessage.text.length)}
                  </div>
                }
              </div>
            </form>
          </div>
        </div>
      }
      {wrongFile &&
        <div className="wrongFileMessage">
          {wrongFile === 'wrongType' ?
            <>
              <p className="wrongFileLine">Image: gif, jpg, jpeg, png</p>
              <p className="wrongFileLine">Video: mp4, mov</p>
            </>
          :
            <p className="wrongFileLine">File shouldn't exceed 10 Mb</p>
          }
        </div>
      }
    </>
  )
}

export default NewMessage

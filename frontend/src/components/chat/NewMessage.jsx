import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthContext } from '../../hooks/UseAuthContext';
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";
import { useThemeContext } from "../../hooks/UseThemeContext";
import { socket } from '../../socket';
import smileyIcon from '../../assets/images/smiley-face.svg'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import useClickOutside from '../../hooks/UseClickOutside';
import UploadMenu from './UploadMenu';
import sendIcon from '../../assets/images/send-icon.svg'
import '../../assets/styles/Textbox.css'
import UploadPopup from './UploadPopup';
import formatTooManySymbols from '../../utils/formatTooManySymbols';
import { HOST } from '../../constants';

function NewMessage({addMessage, updateChatLatestMessage}) {
  const { user } = useAuthContext()
  const { currentChat } = useCurrentChatContext()
  const { isDark } = useThemeContext()
  const fileInputRef = useRef(null)
  const imgVidInputRef = useRef(null)
  const textboxRef = useRef(null)
  const textboxPopupRef = useRef(null)
  const [uploadPopup, setUploadPopup] = useState(false)
  const { triggerRef, nodeRef, showMenu } = useClickOutside(false)
  const [loading, setLoading] = useState(false)
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
        text: '',
        media: null
      })
    }
  }, [currentChat])

  const submitMessage = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData();
    formData.append('media', newMessage.media);
    formData.append('text', newMessage.text);
    formData.append('chat', newMessage.chat);
    formData.append('author', newMessage.author);
    const response = await fetch(`${HOST}/chats/${currentChat._id}/messages`, {
      method: 'POST',
      body: formData
    })
    const json = await response.json()
    setLoading(false)
    if (response.ok) {
      setNewMessage({
        ...newMessage,
        text: '',
        media: null
      })
      updateChatLatestMessage(json)
      addMessage(json)
      socket.emit('new message', json, currentChat)
      if (uploadPopup) {
        setUploadPopup(false)
        fileInputRef.current.value = null
        imgVidInputRef.current.value = null
      }
    }
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

  const setMedia = (file) => {
    setNewMessage({
      ...newMessage,
      media: file
    })
  }

  const onEmojiSelect = (emoji) => {
    setNewMessage({
      ...newMessage,
      text: newMessage.text.concat(emoji.native)
    })
  }

  useEffect(() => {
    if (uploadPopup && newMessage.text) {
      textboxPopupRef.current.textContent = textboxRef.current.textContent  
      textboxRef.current.textContent = null
    }
  }, [uploadPopup])

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

  useEffect(() => {
    if (uploadPopup) {
      textboxPopupRef.current.textContent = newMessage.text
    } else {
      textboxRef.current.textContent = newMessage.text
    }
  }, [newMessage.text])

  const handleUploadPopup = (value) => {
    setUploadPopup(value)
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
                {formatTooManySymbols(newMessage.text.length)}
              </div>
            }
            <UploadMenu  
              imgVidInputRef={imgVidInputRef}
              fileInputRef={fileInputRef}
              handleUploadPopup={handleUploadPopup}
              setMedia={setMedia}
            />
          </div>
        </form>
        {(!newMessage.text || newMessage.text.length > 4096) || uploadPopup ?
          <button className='bigButtonInactive send' form='messageForm' type='button'>
            <img src={sendIcon} alt='send' className="bigButtonImg"></img>
          </button>
        : loading ?
          <div className='loader'></div>
        :
          <button className='bigButton send' form='messageForm'>
            <img src={sendIcon} alt='send' className="bigButtonImg"></img>
          </button>
        }
      </div>
      {uploadPopup &&
        <UploadPopup
          onUploadPopupClose={onUploadPopupClose}
          newMessage={newMessage}
          textboxPopupRef={textboxPopupRef}
          submitMessage={submitMessage}
          handleMessage={handleMessage}
          handleEnter={handleEnter}
          loading={loading}
        />
      }
    </>
  )
}

export default NewMessage


import { useState, useRef, Fragment } from 'react'
import readIcon from '../../assets/images/read.svg'
import sentIcon from '../../assets/images/sent-check.svg'
import toBottomIcon from '../../assets/images/to-bottom.svg'
import fileIcon from '../../assets/images/file-icon.svg'
import moment from 'moment';
import formatBytes from '../../utils/formatSize';
import { formatDateChat } from '../../utils/formatDate'
import { useThemeContext } from "../../hooks/UseThemeContext";
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";
import { useAuthContext } from '../../hooks/UseAuthContext';
import closeIcon from '../../assets/images/close-icon.svg'

const isImage = ['gif','jpg','jpeg','png'];
const isVideo = ['mp4','mov']

//chat flow is reversed

function ChatField({messages, fetchMessages, messagesToSkip}) {
  const { user } = useAuthContext()
  const { currentChat } = useCurrentChatContext()
  const { isDark } = useThemeContext()
  const [scrollButton, setScrollButton] = useState(false)
  const chatWindow = useRef(null);
  const [mediaPopup, setMediaPopup] = useState(false)
  const [bigMedia, setBigMedia] = useState(null)

  const scrollBottom = () => {
    chatWindow.current.scrollTo({ behavior: 'smooth', top: 0 });
  };

  const handleScroll = (e) => {
    handleScrollButton(e)
    infiniteScroll(e)
  }

  const handleScrollButton = (e) => {
    //chat is reversed, so is scrollTop
    const buttonAppearHeight = e.target.clientHeight / 3
    if (buttonAppearHeight > Math.abs(e.target.scrollTop)) {
      setScrollButton(false)
    } else {
      setScrollButton(true)
    }
  }

  const infiniteScroll = (e) => {
    //reversing
    const scrollToTop = e.target.scrollHeight - e.target.clientHeight - Math.abs(e.target.scrollTop)

    if (scrollToTop - 1 <= 0) {
      messagesToSkip.current += 50
      fetchMessages()
    }
  }

  const handleVideoClick = (e, message) => {
    e.preventDefault()
    e.target.pause()
    showBigMedia(message.media.url)
  }

  const showBigMedia = (media) => {
    setBigMedia(media)
    setMediaPopup(true)
  }

  return (
    <div className='chatField scrollable' onScroll={handleScroll} ref={chatWindow}>
      {currentChat && messages && messages.map((message, i) => {
        const prevMessage = messages[i + 1] //chat reversed
        return (
          <Fragment key={message._id}>
            <div className={`${message.author._id === user._id ? 'myMessage' : 'message'} ${isDark ? 'dark' : ''}`}>
              {message.media && isImage.some(type => message.media.url.includes(type)) ?
                <img src={message.media.url} alt='message media' className='messageMedia' onClick={() => showBigMedia(message.media.url)}></img>
              : message.media && isVideo.some(type => message.media.url.includes(type)) ?
                <video src={message.media.url} className='messageMedia' onClick={(e) => handleVideoClick(e, message)} controls></video>
              : message.media ?
                <a href={message.media.url} className='fileBlock'>
                  <div className='fileImageWrapper'>
                    <img 
                      src={fileIcon} 
                      alt='file icon' 
                      className={`fileImage ${isDark ? 'dark' : ''}`}
                    >
                    </img>
                    <span className='fileExtension'>{message.media.name.split('.').pop()}</span>
                  </div>
                  <div className='fileText'>
                    <p className='fileName'>{message.media.name}</p>
                    <p className='fileSize'>{formatBytes(message.media.size)}</p>
                  </div>
                </a>
              :
                null
              }
              {currentChat.isGroupChat && message.author._id !== user._id &&
                <span className='messageAuthor'>{message.author.username}</span>
              }
              <div className='messageContent'>
                {message.text}
                <span className='messageSideInfo'>
                  <span className='messageTime'>{moment(message.createdAt).format('HH:mm')}</span>
                  {!currentChat.lastSeenInChat.some(lastSeen => lastSeen.userId !== user._id &&
                  lastSeen.timestamp < message.updatedAt) && 
                  message.author._id === user._id ?
                    <img src={readIcon} alt='read' className={`messageRead ${isDark ? 'dark' : ''}`}></img> 
                    : message.author._id === user._id ?
                    <img src={sentIcon} alt='sent' className={`messageSent ${isDark ? 'dark' : ''}`}></img>
                    :
                    null
                  }
                </span>
              </div>
            </div>
            {prevMessage && !moment(prevMessage.createdAt).isSame(moment(message.createdAt), "day") &&
              <div className='chatFieldDay'>{formatDateChat(message.createdAt)}</div>
            }
          </Fragment>
        )
      })}
      <button className={`bigButton toBottom ${scrollButton ? 'visible' : ''}`} onClick={scrollBottom}>
        <img src={toBottomIcon} alt="scroll bottom" className="bigButtonImg toBottom"></img>
      </button>
      {mediaPopup &&
        <div className="popupBackground media">
          <button onClick={() => setMediaPopup(false)} className="mainButton closePopup">
            <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
          </button>
          {isImage.some(type => bigMedia.includes(type)) &&
            <img src={bigMedia} alt='media big' className='messageMediaBig'></img>
          }
          {isVideo.some(type => bigMedia.includes(type)) &&
            <video src={bigMedia} className='messageMediaBig' controls></video>
          }
        </div>
      }
    </div>
  )
}

export default ChatField
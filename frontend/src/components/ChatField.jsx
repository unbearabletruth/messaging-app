import { useState, useRef } from 'react'
import readIcon from '../assets/images/read.svg'
import sentIcon from '../assets/images/sent-check.svg'
import toBottomIcon from '../assets/images/to-bottom.svg'
import fileIcon from '../assets/images/file-icon.svg'
import moment from 'moment';
import formatBytes from '../utils/formatSize';
import { useThemeContext } from "../hooks/UseThemeContext";
import { useCurrentChatContext } from "../hooks/UseCurrentChatContext";
import { useAuthContext } from '../hooks/UseAuthContext';

const isImage = ['gif','jpg','jpeg','png'];
const isVideo = ['mp4','mov']

//chat flow is reversed

function ChatField({messages, showBigImage, fetchMessages, messagesToSkip}) {
  const { user } = useAuthContext()
  const { currentChat } = useCurrentChatContext()
  const { isDark } = useThemeContext()
  const [scrollButton, setScrollButton] = useState(false)
  const chatWindow = useRef(null);

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
    showBigImage(message.media.url)
  }

  return (
    <div className='chatField scrollable' onScroll={handleScroll} ref={chatWindow}>
      {currentChat && messages && messages.map(message => {
        return (
          <div className={`${message.author._id === user._id ? 'myMessage' : 'message'} ${isDark ? 'dark' : ''}`} key={message._id}>
            {message.media && isImage.some(type => message.media.url.includes(type)) ?
              <img src={message.media.url} alt='message media' className='messageMedia' onClick={() => showBigImage(message.media.url)}></img>
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
        )
      })}
      <button className={`bigButton toBottom ${scrollButton ? 'visible' : ''}`} onClick={scrollBottom}>
        <img src={toBottomIcon} alt="scroll bottom" className="bigButtonImg toBottom"></img>
      </button>
    </div>
  )
}

export default ChatField
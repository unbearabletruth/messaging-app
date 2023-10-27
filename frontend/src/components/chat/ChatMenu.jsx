import { useState, useEffect } from 'react';
import useClickOutside from '../../hooks/UseClickOutside';
import { useAuthContext } from '../../hooks/UseAuthContext';
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";
import { useChatsContext } from '../../hooks/UseChats';
import { socket } from '../../socket';
import RequestsPopup from '../RequestsPopup';
import dotsMenuIcon from '../../assets/images/dots-menu.svg'
import profileIcon from '../../assets/images/profile.svg'
import infoIcon from '../../assets/images/info.svg'
import leaveIcon from '../../assets/images/logout-icon.svg'
import requestIcon from '../../assets/images/request.svg'
import deleteIcon from '../../assets/images/delete-icon.svg'
import closeIcon from '../../assets/images/close-icon.svg'
import useAlert from '../../hooks/UseAlert';
import { HOST } from '../../constants';

function ChatMenu({isGroupChat, handleDrawer}) {
  const { user } = useAuthContext()
  const { currentChat, handleCurrentChat } = useCurrentChatContext()
  const { chats, handleChats } = useChatsContext()
  const { triggerRef, showMenu } = useClickOutside(false)
  const [deletePopup, setDeletePopup] = useState(false)
  const [requestsPopup, setRequestsPopup] = useState(false)
  const [requestsAlert, setRequestsAlert] = useAlert()

  const deleteChat = async () => {
    const response = await fetch(`${HOST}/chats/${currentChat._id}`, {
      method: 'DELETE'
    })
    const json = await response.json()
    if (response.ok) {
      handleChats(chats.filter(c => c._id !== json._id))
      handleCurrentChat(null)
      const sessionCurrentChat = JSON.parse(sessionStorage.getItem('currentChat'))
      if (sessionCurrentChat._id === json._id) {
        sessionStorage.removeItem('currentChat')
      }
    }
  }

  const deleteChatForYourself = async () => {
    const userId = {user: user._id}
    const response = await fetch(`${HOST}/chats/${currentChat._id}/deleteFor`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      handleChats(chats.filter(c => c._id !== json._id))
      socket.emit('update chat', json)
      setDeletePopup(false)
      handleCurrentChat(null)
    }
  }

  const leaveGroupChat = async () => {
    const userId = {user: user._id}
    const response = await fetch(`${HOST}/chats/${currentChat._id}/remove`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      handleChats(chats.filter(c => c._id !== currentChat._id))
      handleCurrentChat(json)
      socket.emit('update chat', json)
    }
  }

  const handleRequestsPopup = (value) => {
    setRequestsPopup(value)
  }

  const handleRequestsClick = () => {
    if (currentChat.requests.length > 0) {
      setRequestsPopup(true)
    } else {
      setRequestsAlert(true)
    }
  }

  return (
    <>
      <button className="mainButton" ref={triggerRef}>
        <img src={dotsMenuIcon} alt="menu" className="mainButtonImg dotsMenu"></img>
      </button>
      {!isGroupChat ?
        <div className={`menu ${showMenu ? 'visible' : ''}`} id="chatMenu">
          <div className="menuOption" onClick={() => {handleDrawer(true)}}>
            <img src={profileIcon} alt="profile" className="menuOptionIcon"></img>
            <p className='menuText'>Profile</p>
          </div>
          <div className="menuOption" onClick={() => {setDeletePopup(true)}}>
            <img src={deleteIcon} alt="delete chat" className="menuOptionIcon redIcon"></img>
            <p className='menuRedText'>Delete chat</p>
          </div>
        </div>
        :
        <div id="chatMenu" className={`menu ${showMenu ? 'visible' : ''}`}>
          <div className="menuOption" onClick={() => {handleDrawer(true)}}>
            <img src={infoIcon} alt="group" className="menuOptionIcon"></img>
            <p className='menuText'>Group info</p>
          </div>
          {currentChat.admins.includes(user._id) && currentChat.privateGroup &&
            <>
              <div className="menuOption" onClick={handleRequestsClick}>
                <img src={requestIcon} alt="profile" className="menuOptionIcon"></img>
                <p className='menuText'>Requests</p>
              </div>
              <div className="menuOption" onClick={() => {setDeletePopup(true)}}>
                <img src={deleteIcon} alt="delete chat" className="menuOptionIcon redIcon"></img>
                <p className='menuRedText'>Delete chat</p>
              </div>
            </>
          }
          {currentChat.users.some(u => u._id === user._id) && !currentChat.admins.includes(user._id) &&
            <div className="menuOption" onClick={leaveGroupChat}>
              <img src={leaveIcon} alt="profile" className="menuOptionIcon redIcon"></img>
              <p className='menuRedText'>Leave group</p>
            </div>
          }
        </div>
      }
      {deletePopup &&
        <div className="popupBackground">
          <div className='popup' id='deletePopup'>
            <button onClick={() => setDeletePopup(false)} className="mainButton closePopup">
              <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
            </button>
            <p id='deleteMessage'>Are you sure you want to delete this chat?</p>
              {currentChat.isGroupChat ?
                <button className='formButton delete' onClick={deleteChat}>Delete</button>
                :
                <div id='deletePopupButtons'>
                  <button className='formButton delete hollow' onClick={deleteChatForYourself}>Delete for yourself</button>
                  <button className='formButton delete' onClick={deleteChat}>Delete for both</button>
                </div>
              }
          </div>
        </div>
      }
      {requestsPopup &&
        <RequestsPopup handleRequestsPopup={handleRequestsPopup}/>
      }
      {requestsAlert &&
        <div className="alert centered">
          <p className="alertLine">There are no requests</p>
        </div>
      }
    </>
  )
}

export default ChatMenu
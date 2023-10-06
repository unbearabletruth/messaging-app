import dotsMenuIcon from '../../assets/images/dots-menu.svg'
import { useAuthContext } from '../../hooks/UseAuthContext';
import moment from 'moment';
import { useState, Fragment } from 'react';
import profileIcon from '../../assets/images/profile.svg'
import groupIcon from '../../assets/images/group.svg'
import leaveIcon from '../../assets/images/logout-icon.svg'
import closeIcon from '../../assets/images/close-icon.svg'
import backIcon from '../../assets/images/back-icon.svg'
import requestIcon from '../../assets/images/request.svg'
import deleteIcon from '../../assets/images/delete-icon.svg'
import { socket } from '../../socket';
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";
import { useOnlineUsersContext } from "../../hooks/UseOnlineUsersContext";
import { useChatsContext } from '../../hooks/UseChats';
import ChatDrawer from './ChatDrawer';
import useClickOutside from '../../hooks/UseClickOutside';
import RequestsPopup from '../RequestsPopup';

function ChatHeader({screenWidth, openChat}) {
  const { user } = useAuthContext()
  const { onlineUsers } = useOnlineUsersContext()
  const { currentChat, handleCurrentChat } = useCurrentChatContext()
  const { chats, handleChats } = useChatsContext()
  const [drawer, setDrawer] = useState(false)
  const [requestsPopup, setRequestsPopup] = useState(false)
  const [subsPopup, setSubsPopup] = useState(false)
  const { triggerRef, showMenu } = useClickOutside(false)
  const [deletePopup, setDeletePopup] = useState(false)

  const deleteChatForYourself = async () => {
    const userId = {user: user._id}
    const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/deleteFor`, {
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
      setDeletePopup(false)
      handleCurrentChat(null)
    }
  }

  const leaveGroupChat = async () => {
    const userId = {user: user._id}
    const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/remove`, {
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

  const handleDrawer = (value) => {
    setDrawer(value)
  }

  const handleSubsPopup = (value) => {
    setSubsPopup(value)
  }

  const handleRequestsPopup = (value) => {
    setRequestsPopup(value)
  }

  return(
    <div id="chatHeader">
      <ChatDrawer drawer={drawer} handleDrawer={handleDrawer} handleSubsPopup={handleSubsPopup}/>
      {currentChat && !currentChat.isGroupChat && currentChat.users.map(u => {
          return (
            u._id !== user._id &&
              <Fragment key={u._id}>
                <div className='chatHeaderInfo' onClick={() => {setDrawer(!drawer)}}>
                  {screenWidth < 768 &&
                    <button onClick={() => handleCurrentChat(null)} className="mainButton">
                      <img src={backIcon} alt="back" className="mainButtonImg"></img>
                    </button>
                  }
                  <img src={u.profilePic} alt="profile picture" id="chatHeaderPic"></img>
                  <div className='chatInfoText'>
                    <p className="chatName">{u.username}</p>
                    {onlineUsers.includes(u._id) ? 
                      <p id='chatUserStatus'>online</p>
                      : u.lastSeen &&
                      <p id='chatLastSeen'>last seen {moment(u.lastSeen).fromNow()}</p>
                    }
                  </div>
                </div>
                <button className="mainButton" ref={triggerRef}>
                  <img src={dotsMenuIcon} alt="menu" className="mainButtonImg dotsMenu"></img>
                </button>
                <div className={`menu ${showMenu ? 'visible' : ''}`} id="chatMenu">
                  <div className="menuOption" onClick={() => {setDrawer(true)}}>
                    <img src={profileIcon} alt="profile" className="menuOptionIcon"></img>
                    <p className='menuText'>Profile</p>
                  </div>
                  <div className="menuOption" onClick={() => {setDeletePopup(true)}}>
                    <img src={deleteIcon} alt="delete chat" className="menuOptionIcon redIcon"></img>
                    <p className='menuRedText'>Delete chat</p>
                  </div>
                </div>
              </Fragment>
          )}
        )
      }
      {currentChat && currentChat.isGroupChat && 
        <>
          <div className='chatHeaderInfo' key={currentChat._id} onClick={() => {setDrawer(!drawer)}}>
            {screenWidth < 768 &&
              <button onClick={() => handleCurrentChat(null)} className="mainButton">
                <img src={backIcon} alt="back" className="mainButtonImg"></img>
              </button>
            }
            <img src={currentChat.groupPic} alt="group picture" id="chatHeaderPic"></img>
            <div className='chatInfoText'>
              <p className='chatName'>{currentChat.name}</p>
              <p id='chatSubscribers'>{currentChat.users.length} {currentChat.users.length === 1 ? 'subscriber' : 'subscribers'}</p>
            </div>
          </div>
          <button className="mainButton" ref={triggerRef}>
            <img src={dotsMenuIcon} alt="menu" className="mainButtonImg dotsMenu"></img>
          </button>
          <div id="chatMenu" className={`menu ${showMenu ? 'visible' : ''}`}>
            <div className="menuOption" onClick={() => {setDrawer(true)}}>
              <img src={groupIcon} alt="group" className="menuOptionIcon"></img>
              <p className='menuText'>Group info</p>
            </div>
            {currentChat.admins.includes(user._id) &&
              <>
                <div className="menuOption" onClick={() => setRequestsPopup(true)}>
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
          {requestsPopup &&
            <RequestsPopup handleRequestsPopup={handleRequestsPopup} />
          }
          {subsPopup &&
            <div className="popupBackground">
              <div className='popup' id="requestsPopup">
                <button onClick={() => setSubsPopup(false)} className="mainButton closePopup">
                  <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
                </button>
                {currentChat.users.length > 0 ?
                  <>
                    {currentChat.users && currentChat.users.map(u => {
                      return (
                        <div className="userCard" key={u._id} onClick={(e) => openChat(e, u._id)}>
                          <div className='userCardPicWrapper'>
                            <img src={u.profilePic} alt="profile picture" className="userCardPic"></img>
                            {onlineUsers.includes(u._id) && 
                              <div className='userCardStatus'></div>
                            }
                          </div>
                          <div className="userCardInfo">
                            <p className="userCardName">{u.username}</p>
                            {onlineUsers.includes(u._id) ? 
                              <p className='userCardStatusText'>online</p>
                              : u.lastSeen &&
                              <p className='userCardLastSeen'>last seen {moment(u.lastSeen).fromNow()}</p>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </>
                  :
                  <h1 className='requestsTitle'>Group is empty!</h1>
                }
              </div>
            </div>
          }
        </>
      }
      {deletePopup &&
        <div className="popupBackground">
          <div className='popup' id='deletePopup'>
            <button onClick={() => setDeletePopup(false)} className="mainButton closePopup">
              <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
            </button>
            <p id='deleteMessage'>Are you sure you want to delete this chat?</p>
              {currentChat.isGroupChat ?
                <button className='formButton delete'>Delete</button>
                :
                <div id='deletePopupButtons'>
                  <button className='formButton delete hollow' onClick={deleteChatForYourself}>Delete for yourself</button>
                  <button className='formButton delete'>Delete for both</button>
                </div>
              }
          </div>
        </div>
      }
    </div>
  )
}

export default ChatHeader
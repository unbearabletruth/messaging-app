import dotsMenuIcon from '../assets/images/dots-menu.svg'
import { useAuthContext } from '../hooks/UseAuthContext';
import moment from 'moment';
import { useState, useEffect, useRef, Fragment } from 'react';
import profileIcon from '../assets/images/profile.png'
import groupIcon from '../assets/images/group.svg'
import leaveIcon from '../assets/images/logout-icon.svg'
import closeIcon from '../assets/images/close-icon.svg'
import backIcon from '../assets/images/back-icon.svg'
import requestIcon from '../assets/images/request.svg'
import { socket } from '../socket';
import acceptIcon from '../assets/images/submit.svg'
import { useCurrentChatContext } from "../hooks/UseCurrentChatContext";
import { useOnlineUsersContext } from "../hooks/UseOnlineUsersContext";
import ChatDrawer from './ChatDrawer';
import useClickOutside from '../hooks/UseClickOutside';

function ChatHeader({chats, updateChats, screenWidth, openChat}) {
  const { user } = useAuthContext()
  const { onlineUsers } = useOnlineUsersContext()
  const { currentChat, handleCurrentChat } = useCurrentChatContext()
  const [menu, setMenu] = useState(false)
  const menuPopupRef = useRef(null);
  const [drawer, setDrawer] = useState(false)
  const [requestsPopup, setRequestsPopup] = useState(false)
  const [subsPopup, setSubsPopup] = useState(false)

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
      updateChats(chats.filter(c => c._id !== currentChat._id))
      handleCurrentChat(json)
    }
  }

  const admitRequest = async (req) => {
    const userId = {user: req._id}
    await fetch(`http://localhost:3000/chats/${currentChat._id}/add`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })

    removeRequest(req)
  }

  const removeRequest = async (req) => {
    const reqId = {request: req._id}
    const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/removeRequest`, {
      method: 'PATCH',
      body: JSON.stringify(reqId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
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

  const closeMenu = () => {
    setMenu(false)
  }

  useClickOutside(menuPopupRef, closeMenu)

  return(
    <div id="chatHeader">
      <ChatDrawer drawer={drawer} handleDrawer={handleDrawer} handleSubsPopup={handleSubsPopup}/>
      {currentChat && !currentChat.isGroupChat && currentChat.users.map(u => {
          return (
            u.username !== user.username &&
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
                <button className="mainButton" onClick={() => setMenu(!menu)} ref={menuPopupRef}>
                  <img src={dotsMenuIcon} alt="menu" className="mainButtonImg dotsMenu"></img>
                </button>
                {menu &&
                  <div id="chatMenu" className='menu'>
                    <div className="menuOption" onClick={() => {setDrawer(true)}}>
                      <img src={profileIcon} alt="profile" className="menuOptionIcon"></img>
                      <p className='menuText'>Profile</p>
                    </div>
                  </div>
                }
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
          <button className="mainButton" onClick={() => setMenu(!menu)} ref={menuPopupRef}>
            <img src={dotsMenuIcon} alt="menu" className="mainButtonImg dotsMenu"></img>
          </button>
          {menu &&
            <div id="chatMenu" className='menu'>
              <div className="menuOption" onClick={() => {setDrawer(true)}}>
                <img src={groupIcon} alt="group" className="menuOptionIcon"></img>
                <p className='menuText'>Group info</p>
              </div>
              {currentChat.admins.includes(user._id) &&
                <div className="menuOption" onClick={() => setRequestsPopup(true)}>
                  <img src={requestIcon} alt="profile" className="menuOptionIcon"></img>
                  <p className='menuText'>Requests</p>
                </div>
              }
              {currentChat.users.some(u => u._id === user._id) &&
                <div className="menuOption" onClick={leaveGroupChat}>
                  <img src={leaveIcon} alt="profile" className="menuOptionIcon leaveIcon"></img>
                  <p className='menuLeaveText'>Leave group</p>
                </div>
              }
            </div>
          }
          {requestsPopup &&
            <div className="popupBackground">
              <div className='popup' id="requestsPopup">
                <button onClick={() => setRequestsPopup(false)} className="mainButton closePopup">
                  <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
                </button>
                {currentChat.requests.length > 0 ?
                  <>
                    {currentChat.requests && currentChat.requests.map(req => {
                      return (
                        <div className="userCard" key={req._id}>
                          <div className='userCardPicWrapper'>
                            <img src={req.profilePic} alt="profile picture" className="userCardPic"></img>
                            {onlineUsers.includes(req._id) && 
                              <div className='userCardStatus'></div>
                            }
                          </div>
                          <div className="userCardInfo">
                            <p className="userCardName">{req.username}</p>
                            {onlineUsers.includes(req._id) ? 
                              <p className='userCardStatusText'>online</p>
                              : req.lastSeen &&
                              <p className='userCardLastSeen'>last seen {moment(req.lastSeen).fromNow()}</p>
                            }
                          </div>
                          <div className='requestButtons'>
                            <button className="acceptButton" onClick={() => admitRequest(req)}>
                              <img src={acceptIcon} alt="accept" className="acceptButtonImg"></img>
                            </button>
                            <button className="declineButton" onClick={() => removeRequest(req)}>
                              <img src={closeIcon} alt="x" className="declineButtonImg"></img>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </>
                  :
                  <h1 className='requestsTitle'>No requests</h1>
                }
              </div>
            </div>
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
                  <h1 className='requestsTitle'>No requests</h1>
                }
              </div>
            </div>
          }
        </>
      }
    </div>
  )
}

export default ChatHeader
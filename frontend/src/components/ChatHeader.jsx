import dotsMenuIcon from '../assets/images/dots-menu.svg'
import { useAuthContext } from '../hooks/UseAuthContext';
import moment from 'moment';
import { useState, useEffect, useRef, Fragment } from 'react';
import profileIcon from '../assets/images/profile.png'
import leaveIcon from '../assets/images/logout-icon.svg'
import closeIcon from '../assets/images/close-icon.svg'
import backIcon from '../assets/images/back-icon.svg'
import requestIcon from '../assets/images/request.svg'
import { socket } from '../socket';
import acceptIcon from '../assets/images/submit.svg'

function ChatHeader({chat, chats, onlineUsers, updateChats, handleChat, screenWidth}) {
  const {user} = useAuthContext()
  const [menu, setMenu] = useState(false)
  const menuPopupRef = useRef(null);
  const [drawer, setDrawer] = useState(false)
  const [requestsPopup, setRequestsPopup] = useState(false)

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

  const admitRequest = async (req) => {
    const userId = {user: req._id}
    await fetch(`http://localhost:3000/chats/${chat._id}/add`, {
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
    const response = await fetch(`http://localhost:3000/chats/${chat._id}/removeRequest`, {
      method: 'PATCH',
      body: JSON.stringify(reqId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      handleChat(json)
      socket.emit('update chat', json)
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuPopupRef.current && !menuPopupRef.current.contains(e.target)){
        setMenu(false)
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuPopupRef]);

  return(
    <div id="chatHeader">
      {chat && !chat.isGroupChat && chat.users.map(u => {
          return (
            u.username !== user.username &&
              <Fragment key={u._id}>
                <div className='chatHeaderInfo'>
                  {screenWidth < 768 &&
                    <button onClick={() => handleChat(null)} className="mainButton">
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
      {chat && chat.isGroupChat && 
        <>
          <div className='chatHeaderInfo' key={chat._id}>
            {screenWidth < 768 &&
              <button onClick={() => handleChat(null)} className="mainButton">
                <img src={backIcon} alt="back" className="mainButtonImg"></img>
              </button>
            }
            <img src={chat.groupPic} alt="group picture" id="chatHeaderPic"></img>
            <div className='chatInfoText'>
              <p className='chatName'>{chat.name}</p>
              <p id='chatSubscribers'>{chat.users.length} {chat.users.length === 1 ? 'subscriber' : 'subscribers'}</p>
            </div>
          </div>
          <button className="mainButton" onClick={() => setMenu(!menu)} ref={menuPopupRef}>
            <img src={dotsMenuIcon} alt="menu" className="mainButtonImg dotsMenu"></img>
          </button>
          {menu &&
            <div id="chatMenu" className='menu'>
              {chat.users.some(u => u._id === user._id) &&
                <div className="menuOption" onClick={leaveGroupChat}>
                  <img src={leaveIcon} alt="profile" className="menuOptionIcon leaveIcon"></img>
                  <p className='menuLeaveText'>Leave group</p>
                </div>
              }
              {chat.admins.includes(user._id) &&
                <div className="menuOption" onClick={() => setRequestsPopup(true)}>
                  <img src={requestIcon} alt="profile" className="menuOptionIcon"></img>
                  <p className='menuText'>Requests</p>
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
                {chat.requests.length > 0 ?
                  <>
                    {chat.requests && chat.requests.map(req => {
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
        </>
      }
      {chat &&
        <div id='drawerWrapper'>
          <div id='drawer' className={drawer ? 'active' : ''}>
            <div className='profileHeader'>
              <button onClick={() => setDrawer(false)} className="mainButton">
                <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
              </button>
              <h1 className='sidebarTitle'>Profile</h1>
            </div>
            <div id='profilePictureWrapper'>
              {chat.isGroupChat ?
                <>
                  <img src={chat.groupPic} alt='group picture' className='profilePicture'></img>
                  <div className='profilePicCaption'>{chat.users.length} {chat.users.length === 1 ? 'subscriber' : 'subscribers'}</div>
                </>
                :
                <>
                  <img src={chat.users.find(u => u._id !== user._id).profilePic} alt='profile picture' className='profilePicture'></img>
                  <div className='profilePicCaption'>last seen {moment(chat.users.find(u => u._id !== user._id).lastSeen).fromNow()}</div>
                </>
              }
            </div>
            {!chat.isGroupChat &&
              <div className='profileInfoBlock'>
                <p className='profileInfoTitle'>Username</p>
                <p className='profileInfo'>{chat.users.find(u => u._id !== user._id).username}</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  )
}

export default ChatHeader
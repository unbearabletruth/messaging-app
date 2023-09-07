import dotsMenuIcon from '../assets/images/dots-menu.svg'
import { useAuthContext } from '../hooks/UseAuthContext';
import moment from 'moment';
import { useState, useEffect, useRef } from 'react';
import profileIcon from '../assets/images/profile.png'
import leaveIcon from '../assets/images/logout-icon.svg'
import closeIcon from '../assets/images/close-icon.svg'

function ChatHeader({chat, chats, onlineUsers, updateChats, handleChat}) {
  const {user} = useAuthContext()
  const [menu, setMenu] = useState(false)
  const menuPopupRef = useRef(null);
  const [drawer, setDrawer] = useState(false)

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
  console.log(chat.users)
  return(
    <div id="chatHeader">
      {chat && !chat.isGroupChat && chat.users.map(u => {
          return (
            u.username !== user.username &&
              <>
                <div className='chatHeaderInfo' key={u._id}>
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
              </>
          )}
        )
      }
      {chat && chat.isGroupChat && 
        <>
          <div className='chatHeaderInfo' key={chat._id}>
            <img src={chat.groupPic} alt="group picture" id="chatHeaderPic"></img>
            <div className='chatInfoText'>
              <p className='chatName'>{chat.name}</p>
              <p id='chatSubscribers'>{chat.users.length} {chat.users.length === 1 ? 'subscriber' : 'subscribers'} </p>
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
            </div>
          }
        </>
      }
      <div id='drawerWrapper'>
        <div id='drawer' className={drawer ? 'active' : ''}>
          <div className='profileHeader'>
            <button onClick={() => setDrawer(false)} className="mainButton">
              <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
            </button>
            <h1 className='sidebarTitle'>Profile</h1>
          </div>
          <img src={user.profilePic} alt='profile picture' className='profilePicture'></img>
          <div className='profileInfoBlock'>
            <p className='profileInfoTitle'>Username</p>
            <p className='profileInfo'>{user.username}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
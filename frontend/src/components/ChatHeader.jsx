import dotsMenuIcon from '../assets/images/dots-menu.svg'
import { useAuthContext } from '../hooks/UseAuthContext';
import moment from 'moment';
import { useState, useEffect, useRef } from 'react';
import profileIcon from '../assets/images/profile.png'

function ChatHeader({chat, chats, onlineUsers, updateChats, handleChat}) {
  const {user} = useAuthContext()
  const [menu, setMenu] = useState(false)
  const menuPopupRef = useRef(null);

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
                <div id='chatHeaderUser' key={u._id}>
                  <img src={u.profilePic} alt="profile picture" id="chatHeaderPic"></img>
                  <div id='chatUserInfo'>
                    <p id="chatUsername">{u.username}</p>
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
                    <div className="menuOption">
                      <img src={profileIcon} alt="profile" className="menuOptionIcon"></img>
                      <p>Profile</p>
                    </div>
                  </div>
                }
              </>
          )}
        )
      }
      {chat && chat.isGroupChat && 
        <>
          <p> Welcome to {chat.name}!</p>
          <button className="mainButton" onClick={() => setMenu(!menu)} ref={menuPopupRef}>
            <img src={dotsMenuIcon} alt="menu" className="mainButtonImg dotsMenu"></img>
          </button>
          {menu &&
            <div id="chatMenu" className='menu'>
              {chat.users.some(u => u._id === user._id) &&
                <div className="menuOption" onClick={leaveGroupChat}>
                  <img src={profileIcon} alt="profile" className="menuOptionIcon"></img>
                  <p>Leave group</p>
                </div>
              }
            </div>
          }
        </>
      }
    </div>
  )
}

export default ChatHeader
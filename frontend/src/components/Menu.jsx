import { useState, useRef, useEffect } from "react"
import { useAuthContext } from '../hooks/UseAuthContext';
import { useCurrentChatContext } from "../hooks/UseCurrentChatContext";
import menuIcon from '../assets/images/menu-icon.svg'
import groupIcon from '../assets/images/group.svg'
import profileIcon from '../assets/images/profile.png'
import logoutIcon from '../assets/images/logout-icon.svg'
import closeIcon from '../assets/images/close-icon.svg'
import '../assets/styles/Menu.css'

function Menu({chats, updateChats, handleSidebarContent, handleDrawer}) {
  const { user, dispatch } = useAuthContext()
  const { handleCurrentChat } = useCurrentChatContext()
  const [menu, setMenu] = useState(false)
  const menuPopupRef = useRef(null);
  const [newGroupPopup, setNewGroupPopup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

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

  const newGroupChat = async (e) => {
    e.preventDefault()
    const newGroup = {
      name: groupName,
      isGroupChat: true,
      users: [user._id],
      privateGroup: isPrivate
    }
    const response = await fetch(`http://localhost:3000/chats`, {
      method: 'POST',
      body: JSON.stringify(newGroup),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      setNewGroupPopup(false)
      updateChats([json, ...chats])
      handleCurrentChat(json)
    }
  }

  const handleProfile = () => {
    handleSidebarContent('')
    handleDrawer(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    dispatch({type: 'logout'})
  }

  return (
    <div id="menuWrapper">
      <button className="mainButton" onClick={() => setMenu(!menu)} ref={menuPopupRef}>
        <img src={menuIcon} alt="menu" className="mainButtonImg"></img>
      </button>
      {menu &&
        <div className="menu">
          <p id="menuTitle">Logged in as {user.username}</p>
          <div className="menuOption" onClick={() => setNewGroupPopup(true)}>
            <img src={groupIcon} alt="new group" className="menuOptionIcon"></img>
            <p className="menuText">New group chat</p>
          </div>
          <div className="menuOption" onClick={handleProfile}>
            <img src={profileIcon} alt="profile" className="menuOptionIcon"></img>
            <p className="menuText">Profile</p>
          </div>
          <div className="menuOption" onClick={handleLogout}>
            <img src={logoutIcon} alt="log out" className="menuOptionIcon leaveIcon"></img>
            <p className="menuLeaveText">Log out</p>
          </div>
        </div>
      }
      {newGroupPopup &&
        <div className="popupBackground">
          <div className='popup' id="newGroupPopup">
            <button onClick={() => setNewGroupPopup(false)} className="mainButton closePopup">
              <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
            </button>
            <form id="newGroupForm" onSubmit={newGroupChat}>
              <input 
                id="newGroupName" 
                name="name" 
                onChange={(e) => setGroupName(e.target.value)}
                aria-label="group name"
                placeholder="Name"
              >
              </input>
              <div id="newGroupCheckboxWrapper">
                <input 
                  type="checkbox" 
                  id="newGroupIsPrivate" 
                  name="isPrivate" 
                  checked={isPrivate}
                  onChange={() => setIsPrivate(!isPrivate)}
                >
                </input>
                <label htmlFor="newGroupIsPrivate" id="newGroupCheckboxLabel">Private</label>
              </div>
              <button className="formButton">Create</button>
            </form>
          </div>
        </div>
      }
    </div>
  )
}

export default Menu
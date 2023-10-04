import { useState, useEffect } from "react"
import { useAuthContext } from '../hooks/UseAuthContext';
import { useCurrentChatContext } from "../hooks/UseCurrentChatContext";
import { useThemeContext } from "../hooks/UseThemeContext";
import { useChatsContext } from "../hooks/UseChats";
import menuIcon from '../assets/images/menu-icon.svg'
import groupIcon from '../assets/images/group.svg'
import profileIcon from '../assets/images/profile.svg'
import logoutIcon from '../assets/images/logout-icon.svg'
import closeIcon from '../assets/images/close-icon.svg'
import darkIcon from '../assets/images/dark-mode.svg'
import '../assets/styles/Menu.css'
import useClickOutside from "../hooks/UseClickOutside";

function Menu({handleSidebarContent, handleDrawer}) {
  const { user, dispatch } = useAuthContext()
  const { handleCurrentChat } = useCurrentChatContext()
  const { isDark, toggleTheme } = useThemeContext()
  const { chats, handleChats } = useChatsContext()
  const [newGroupPopup, setNewGroupPopup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const { triggerRef, nodeRef, showMenu } = useClickOutside(false)
  const [error, setError] = useState(false)

  const newGroupChat = async (e) => {
    e.preventDefault()
    if (groupName.length < 3 || groupName.length > 25) {
      setError(true)
      return
    }
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
    if (!response.ok) {
      setError(true)
    }
    if (response.ok) {
      setNewGroupPopup(false)
      handleChats([json, ...chats])
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

  useEffect(() => {
    if (error) {
      const timeId = setTimeout(() => {
          setError(null)
        }, 7000)
    
      return () => {
        clearTimeout(timeId)
      }
    }
  }, [error]);

  return (
    <div id="menuWrapper">
      <button className="mainButton" ref={triggerRef}>
        <img src={menuIcon} alt="menu" className="mainButtonImg"></img>
      </button>
      <div className={`menu ${showMenu ? 'visible' : ''}`} id="mainMenu">
        <p id="menuTitle">Logged in as {user.username}</p>
        <div className="menuOption" onClick={() => setNewGroupPopup(true)}>
          <img src={groupIcon} alt="new group" className="menuOptionIcon"></img>
          <p className="menuText">New group chat</p>
        </div>
        <div className="menuOption" onClick={handleProfile}>
          <img src={profileIcon} alt="profile" className="menuOptionIcon"></img>
          <p className="menuText">Profile</p>
        </div>
        <div className="menuOption" ref={nodeRef} onClick={toggleTheme}>
          <img src={darkIcon} alt="dark mode" className="menuOptionIcon"></img>
          <div className="menuTextWithToggle">
            <p className="menuText">Dark mode</p>
            <label className="toggle" onClick={(e) => e.preventDefault()}>
              <input className="toggleInput" type="checkbox" checked={isDark} readOnly></input>
              <span className="slider"></span>
            </label>
          </div>
        </div>
        <div className="menuOption" onClick={handleLogout}>
          <img src={logoutIcon} alt="log out" className="menuOptionIcon leaveIcon"></img>
          <p className="menuLeaveText">Log out</p>
        </div>
      </div>
      {newGroupPopup &&
        <div className="popupBackground">
          <div className='popup' id="newGroupPopup">
            <button onClick={() => setNewGroupPopup(false)} className="mainButton closePopup">
              <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
            </button>
            <form id="newGroupForm" onSubmit={newGroupChat}>
              <input 
                type="text"
                id="newGroupName" 
                name="name" 
                onChange={(e) => setGroupName(e.target.value)}
                aria-label="group name"
                placeholder="Name"
                autoComplete="off"
              >
              </input>
              <div id="newGroupCheckboxWrapper">
                <label htmlFor="privateGroupCheckbox" id="newGroupCheckboxLabel">Private</label>
                <label className="toggle" >
                  <input 
                    className="toggleInput" 
                    id='privateGroupCheckbox' 
                    type="checkbox" 
                    onChange={() => setIsPrivate(!isPrivate)} 
                    checked={isPrivate}>
                  </input>
                  <span className="slider"></span>
                </label>
              </div>
              <button className="formButton">Create</button>
            </form>
          </div>
          {error &&
            <div className="wrongFileMessage">
              <p className="wrongFileLine">Groupname should be 3-25 characters</p>
            </div>
          }
        </div>
      }
      
    </div>
  )
}

export default Menu
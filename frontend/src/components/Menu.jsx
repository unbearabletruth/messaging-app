import { useState, useRef, useEffect } from "react"
import { useAuthContext } from '../hooks/UseAuthContext';
import { useNavigate } from "react-router-dom";
import menuIcon from '../assets/images/menu-icon.svg'
import logoutIcon from '../assets/images/logout-icon.svg'
import closeIcon from '../assets/images/close-icon.svg'
import '../assets/styles/Menu.css'

function Menu() {
  const {user, dispatch} = useAuthContext()
  const [menu, setMenu] = useState(false)
  const menuPopupRef = useRef(null);
  const [newGroupPopup, setNewGroupPopup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const navigate = useNavigate()

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
      users: [user.id]
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
      navigate(`/${json._id}`, {state: {json}})
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    dispatch({type: 'logout'})
  }

  return (
    <div id="menuWrapper">
      <button id="menuButton" onClick={() => setMenu(!menu)} ref={menuPopupRef}>
        <img src={menuIcon} alt="menu" id="menuImg"></img>
      </button>
      {menu &&
        <div id="menu">
          <p className="menuOption">Logged in as {user.username}</p>
          <p className="menuOption" onClick={() => setNewGroupPopup(true)}>New group chat</p>
          <p className="menuOption">Profile</p>
          <div className="menuOption" onClick={handleLogout}>
            <img src={logoutIcon} alt="log out" className="menuOptionIcon"></img>
            <p className="menuOptionText">Log out</p>
          </div>
        </div>
      }
      {newGroupPopup &&
        <div id="popupBackground">
          <div id="newGroupPopup">
            <button onClick={() => setNewGroupPopup(false)} className="closePopup">
              <img src={closeIcon} alt="x" className="closeIcon"></img>
            </button>
            <form id="newGroupForm" onSubmit={newGroupChat}>
              <input 
                id="newGroupInput" 
                name="name" 
                onChange={(e) => setGroupName(e.target.value)}
                aria-label="group name"
                placeholder="Name"
              >
              </input>
              <button className="formButton">Create</button>
            </form>
          </div>
        </div>
      }
    </div>
  )
}

export default Menu
import { useState, useEffect, useRef } from "react"
import { useAuthContext } from '../hooks/UseAuthContext';
import '../assets/styles/Sidebar.css'
import moment from 'moment';
import pencilIcon from '../assets/images/pencil-icon.svg'
import backIcon from '../assets/images/back-icon.svg'
import menuIcon from '../assets/images/menu-icon.svg'
import logoutIcon from '../assets/images/logout-icon.svg'
import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const {user, dispatch} = useAuthContext()
  const [chats, setChats] = useState(null)
  const [users, setUsers] = useState(null)
  const [write, setWrite] = useState(false)
  const [menu, setMenu] = useState(false)
  const menuPopupRef = useRef(null);
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('user')
    dispatch({type: 'logout'})
  }

  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch(`http://localhost:3000/chats/users/${user.id}`)
      const json = await response.json()
      if (response.ok) {
        setChats(json)
      }
    }

    fetchChats()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch(`http://localhost:3000/users`)
      const json = await response.json()
      if (response.ok) {
        setUsers(json)
      }
    }

    fetchUsers()
  }, [])

  const newChat = async (e, partnerId) => {
    e.preventDefault()
    const users = {users: [user.id, partnerId]}
    const response = await fetch(`http://localhost:3000/chats`, {
      method: 'POST',
      body: JSON.stringify(users),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      navigate(`/${json._id}`, {state: {json}})
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

  return (
    <div id="sidebar">
      {write ? 
        <>
          <button onClick={() => setWrite(false)} className="backButton">
            <img src={backIcon} alt="back" className="backImg"></img>
          </button>
          {users && users.map(user => {
            return (
              <div className="sidebarUser" key={user._id} onClick={(e) => newChat(e, user._id)}>
                <img src={user.profilePic} alt="profile picture" className="sidebarPic"></img>
                <div>
                  <p className="sidebarName">{user.username}</p>
                </div>
              </div>
            )
          })}
        </>
      :
        <>
          <div id="sidebarHeader">
            <div id="menuWrapper">
              <button id="menuButton" onClick={() => setMenu(!menu)} ref={menuPopupRef}>
                <img src={menuIcon} alt="menu" id="menuImg"></img>
              </button>
              {menu &&
                <div id="menu">
                  <div className="menuOption">
                    <img src={logoutIcon} alt="log out" className="menuOptionIcon"></img>
                    <p className="menuOptionText" onClick={handleLogout}>Log out</p>
                  </div>
                  <p className="menuOption">Logged in as {user.username}</p>
                  <p className="menuOption">Profile</p>
                </div>
              }
            </div>
            <input type="search"></input>
          </div>
          {chats && chats.map(chat => {
            return (
              !chat.isGroupChat && chat.users.map(u => {
                return (
                  u.username !== user.username ?
                    <Link to={`/${u.username.replace(/\s+/g,'')}`} state={chat} key={chat._id} className="sidebarChat">
                      <div className="sidebarChatContent">
                        <img src={u.profilePic} alt="profile picture" className="sidebarPic"></img>
                        <div className="sidebarChatMain">
                          <p className="sidebarChatUser">{u.username}</p>
                          {chat.latestMessage ?
                            <p className="sidebarChatLatest">{chat.latestMessage.text}</p>
                            :
                            <p className="sidebarChatLatest">Click to start a conversation!</p>
                          }
                        </div>
                      </div>
                      <p className="sidebarChatUpdatedAt">{moment(chat.updatedAt).format('DD.MM.YYYY')}</p>
                    </Link>
                    :
                    null
                  )
                })
              )
            })
          }
          <button id="writeButton" onClick={() => setWrite(true)}>
            <img src={pencilIcon} alt="write someone" id="writeButtonImg"></img>
          </button>
        </>
      }
    </div>
  )
}

export default Sidebar
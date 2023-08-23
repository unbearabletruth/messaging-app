import { useState, useEffect } from "react"
import { useAuthContext } from '../hooks/UseAuthContext';
import '../assets/styles/Sidebar.css'
import moment from 'moment';
import pencilIcon from '../assets/images/pencil-icon.svg'
import backIcon from '../assets/images/back-icon.svg'
import { Link } from "react-router-dom";

function Sidebar() {
  const {user, dispatch} = useAuthContext()
  const [chats, setChats] = useState(null)
  const [users, setUsers] = useState(null)
  const [write, setWrite] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('user')
    dispatch({type: 'logout'})
  }

  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch(`http://localhost:3000/chats`)
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
  
  return (
    <div id="sidebar">
      {write ? 
        <>
          <button onClick={() => setWrite(false)} className="backButton">
            <img src={backIcon} alt="back" className="backImg"></img>
          </button>
          {users && users.map(user => {
            return (
              <div className="sidebarUser">
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
          <button onClick={handleLogout}>Log out</button>
          {chats && chats.map(chat => {
            return (
              !chat.isGroupChat && chat.users.map(u => {
                return (
                  u.username !== user.username ?
                    <Link to={`/${chat._id}`} key={chat._id} className="sidebarChat">
                      <div className="sidebarChatContent">
                        <img src={u.profilePic} alt="profile picture" className="sidebarPic"></img>
                        <div className="sidebarChatMain">
                          <p className="sidebarChatUser">{u.username}</p>
                          {chat.latestMessage ?
                            <p className="sidebarChatLatest">{chat.latestMessage}</p>
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
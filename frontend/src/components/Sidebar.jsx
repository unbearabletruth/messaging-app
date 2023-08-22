import { useState, useEffect } from "react"
import { useAuthContext } from '../hooks/UseAuthContext';
import '../assets/styles/Sidebar.css'
import moment from 'moment';

function Sidebar() {
  const [chats, setChats] = useState(null)
  const {user} = useAuthContext()

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

  return (
    <div id="sidebar">
      {chats && chats.map(chat => {
        return (
          !chat.isGroupChat && chat.users.map(u => {
            return (
              u.username !== user.username ?
                <div className="sidebarChat">
                  <div className="sidebarChatContent">
                    <img src={u.profilePic} alt="profile picture" className="sidebarChatPic"></img>
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
                </div>
                :
                null
            )
          })
        )
      })}
    </div>
  )
}

export default Sidebar
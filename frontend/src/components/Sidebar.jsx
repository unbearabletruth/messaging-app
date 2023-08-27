import { useState, useEffect } from "react"
import { useAuthContext } from '../hooks/UseAuthContext';
import '../assets/styles/Sidebar.css'
import moment from 'moment';
import pencilIcon from '../assets/images/pencil-icon.svg'
import backIcon from '../assets/images/back-icon.svg'
import { Link, useNavigate } from "react-router-dom";
import Search from "./Search";
import Menu from "./Menu";

function Sidebar() {
  const { user } = useAuthContext()
  const [chats, setChats] = useState(null)
  const [users, setUsers] = useState(null)
  const [write, setWrite] = useState(false)
  const [searchPage, setSearchPage] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const navigate = useNavigate()

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
    const newChat = {
      isGroupChat: false,
      users: [user.id, partnerId]
    }
    const response = await fetch(`http://localhost:3000/chats`, {
      method: 'POST',
      body: JSON.stringify(newChat),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      navigate(`/${json.username.replace(/\s+/g,'')}`, {state: json})
    }
  }

  const toggleSearch = (value) => {
    setSearchPage(value)
  }
  
  const handleSearchResults = (results) => {
    setSearchResults(results)
  }

  return (
    <div id="sidebar">
      <div id="sidebarHeader">
        {write ?
          <button onClick={() => setWrite(false)} className="backButton">
            <img src={backIcon} alt="back" className="backImg"></img>
          </button>
        : searchPage ?
          <button onClick={() => setSearchPage(false)} className="backButton">
            <img src={backIcon} alt="back" className="backImg"></img>
          </button>
        :
          <Menu />
        }
        <Search toggleSearch={toggleSearch} handleSearchResults={handleSearchResults}/>
      </div>
      {write ? 
        <>
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
      : searchPage ?
        <>
          {searchResults && searchResults.map(result => {
            return (
              <div className="sidebarUser" key={result._id} onClick={(e) => newChat(e, result._id)}>
                <img src={result.profilePic} alt="profile picture" className="sidebarPic"></img>
                <div>
                  <p className="sidebarName">{result.username}</p>
                </div>
              </div>
            )
          })}
        </>
      :
        <>
          {chats && chats.map(chat => {
            return (
              chat.isGroupChat ?
                <Link to={`/${chat.name.replace(/\s+/g,'')}`} state={chat} key={chat._id} className="sidebarChat">
                  <div className="sidebarChatContent">
                    <div className="sidebarChatMain">
                      <p className="sidebarChatUser">{chat.name}</p>
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
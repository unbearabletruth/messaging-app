import { useState, useEffect } from "react"
import { useAuthContext } from '../hooks/UseAuthContext';
import '../assets/styles/Sidebar.css'
import '../assets/styles/Content.css'
import moment from 'moment';
import pencilIcon from '../assets/images/pencil-icon.svg'
import backIcon from '../assets/images/back-icon.svg'
import { Link, useNavigate } from "react-router-dom";
import Chat from '../pages/Chat';
import Home from '../pages/Home';
import Search from "./Search";
import Menu from "./Menu";

function Sidebar({chats, handleChats, refetchChats}) {
  const { user } = useAuthContext()
  const [users, setUsers] = useState(null)
  const [write, setWrite] = useState(false)
  const [searchPage, setSearchPage] = useState(false)
  const [searchUserResults, setSearchUserResults] = useState([])
  const [searchChatResults, setSearchChatResults] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const navigate = useNavigate()

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
      setCurrentChat(json)
    }
  }

  const toggleSearch = (value) => {
    setSearchPage(value)
  }
  
  const handleUserResults = (results) => {
    setSearchUserResults(results)
  }

  const handleChatResults = (results) => {
    setSearchChatResults(results)
  }

  const handleChat = (chat) => {
    setCurrentChat(chat)
  }

  return (
    <>
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
        <Search 
          toggleSearch={toggleSearch} 
          handleUserResults={handleUserResults}
          handleChatResults={handleChatResults}
        />
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
          {searchUserResults.length > 0 && 
            <>
              <h1>users</h1> 
              {searchUserResults.map(chat => {
                return (
                  <div className="sidebarUser" key={chat._id} onClick={(e) => newChat(e, chat._id)}>
                    <img src={chat.profilePic} alt="profile picture" className="sidebarPic"></img>
                    <div>
                      <p className="sidebarName">{chat.username}</p>
                    </div>
                  </div>
                )
              })}
            </>
          }
          {searchChatResults.length > 0 && 
            <>
              <h1>chats</h1> 
              {searchChatResults.map(chat => {
                return (
                  <div onClick={() => setCurrentChat(chat)} key={chat._id} className="sidebarChat">
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
                  </div>
                )
              })}
            </>
          }
        </>
      :
        <>
          {chats && chats.map(chat => {
            return (
              chat.isGroupChat ?
                <div onClick={() => setCurrentChat(chat)} key={chat._id} className="sidebarChat">
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
                </div>
              :
                !chat.isGroupChat && chat.users.map(u => {
                  return (
                    u.username !== user.username ?
                      <div onClick={() => setCurrentChat(chat)} key={chat._id} className="sidebarChat">
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
                      </div>
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
    <div id='content'>
      {currentChat ?
        <Chat 
          chat={currentChat}
          handleChat={handleChat}
          chats={chats} 
          handleChats={handleChats} 
          refetchChats={refetchChats}
        />
      :
        <Home />
      }
    </div>
    </>
  )
}

export default Sidebar
import { useState, useEffect } from "react"
import backIcon from '../assets/images/back-icon.svg'
import Search from "./Search";
import Menu from "./Menu";
import AllChats from "./sidebarPages/AllChats";
import SearchResults from "./sidebarPages/SearchResults";
import Profile from "./sidebarPages/Profile";
import { useAuthContext } from '../hooks/UseAuthContext';
import moment from 'moment';

function Sidebar({chats, allMessages, handleChat, updateChats, onlineUsers})  {
  const { user } = useAuthContext()
  const [users, setUsers] = useState(null)
  const [sidebarContent, setSidebarContent] = useState('')
  const [searchUserResults, setSearchUserResults] = useState([])
  const [searchChatResults, setSearchChatResults] = useState([])

  const newChat = async (e, partnerId) => {
    e.preventDefault()
    const newChat = {
      isGroupChat: false,
      users: [user._id, partnerId]
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
      updateChats([json, ...chats])
      handleChat(json)
    }
  }

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

  const handleSidebarContent = (content) => {
    setSidebarContent(content)
  }

  const handleUserResults = (results) => {
    setSearchUserResults(results)
  }

  const handleChatResults = (results) => {
    setSearchChatResults(results)
  }

  const openChat = (e, userId) => {
    for (let chat of chats) {
      const chatExists = chat.users.find(u => u._id === userId)
      if (chatExists && !chat.isGroupChat) {
        handleChat(chat)
        return
      }
    };
    newChat(e, userId)
  }

  return (
    <div id="sidebar">
        {sidebarContent === 'write' || sidebarContent === 'search' ?
          <div id="sidebarHeader">
            <button onClick={() => handleSidebarContent('')} className="mainButton">
              <img src={backIcon} alt="back" className="mainButtonImg"></img>
            </button>
            <Search 
              handleSidebarContent={handleSidebarContent} 
              handleUserResults={handleUserResults}
              handleChatResults={handleChatResults}
            />
          </div>
        : !sidebarContent ?
          <div id="sidebarHeader">
            <Menu 
              handleChat={handleChat} 
              chats={chats} 
              updateChats={updateChats}
              handleSidebarContent={handleSidebarContent}
            />
            <Search 
              handleSidebarContent={handleSidebarContent} 
              handleUserResults={handleUserResults}
              handleChatResults={handleChatResults}
            />
          </div>
        :
          null
        }
      {!sidebarContent &&
        <AllChats 
          chats={chats} 
          handleChat={handleChat} 
          handleSidebarContent={handleSidebarContent}
          onlineUsers={onlineUsers}
          allMessages={allMessages}
        />
      }
      {sidebarContent === 'write' &&
        <>
          {users && users.map(u => {
            return (
              u._id !== user._id &&
              <div className="sidebarUser" key={u._id} onClick={(e) => openChat(e, u._id)}>
                <div className='sidebarPicWrapper'>
                  <img src={u.profilePic} alt="profile picture" className="sidebarPic"></img>
                  {onlineUsers.includes(u._id) && 
                    <div className='sidebarUserStatus'></div>
                  }
                </div>
                <div className="writeUserInfo">
                  <p className="writeName">{u.username}</p>
                  {onlineUsers.includes(u._id) ? 
                    <p className='writeUserStatus'>online</p>
                    : u.lastSeen &&
                    <p className='writeLastSeen'>last seen {moment(u.lastSeen).fromNow()}</p>
                  }
                </div>
              </div>
            )
          })}
        </>
      }
      {sidebarContent === 'search' &&
        <SearchResults 
          handleSidebarContent={handleSidebarContent}
          searchUserResults={searchUserResults}
          searchChatResults={searchChatResults}
          onlineUsers={onlineUsers}
          openChat={openChat}
          handleChat={handleChat}
        />
      }
      {sidebarContent === 'profile' &&
        <Profile handleSidebarContent={handleSidebarContent}/>
      }
    </div>
  )
}

export default Sidebar
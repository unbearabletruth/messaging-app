import { useState, useEffect } from "react"
import backIcon from '../assets/images/back-icon.svg'
import Search from "./Search";
import Menu from "./Menu";
import AllChats from "./sidebarPages/AllChats";
import SearchResults from "./sidebarPages/SearchResults";
import Profile from "./sidebarPages/Profile";
import { useAuthContext } from '../hooks/UseAuthContext';

function Sidebar({chats, handleChat, updateChats})  {
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
        />
      }
      {sidebarContent === 'write' &&
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
      }
      {sidebarContent === 'search' &&
        <SearchResults 
          handleSidebarContent={handleSidebarContent}
          searchUserResults={searchUserResults}
          searchChatResults={searchChatResults}
        />
      }
      {sidebarContent === 'profile' &&
        <Profile handleSidebarContent={handleSidebarContent}/>
      }
    </div>
  )
}

export default Sidebar
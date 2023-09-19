import { useState, useEffect } from "react"
import backIcon from '../assets/images/back-icon.svg'
import Search from "./Search";
import Menu from "./Menu";
import AllChats from "./sidebarPages/AllChats";
import SearchResults from "./sidebarPages/SearchResults";
import Profile from "./sidebarPages/Profile";
import { useAuthContext } from '../hooks/UseAuthContext';
import { useOnlineUsersContext } from "../hooks/UseOnlineUsersContext";
import { useThemeContext } from "../hooks/UseThemeContext";
import moment from 'moment';

function Sidebar({chats, allMessages, updateChats, openChat})  {
  const { user } = useAuthContext()
  const { onlineUsers } = useOnlineUsersContext()
  const { isDark } = useThemeContext()
  const [users, setUsers] = useState(null)
  const [sidebarContent, setSidebarContent] = useState('main')
  const [searchInput, setSearchInput] = useState('')
  const [searchUserResults, setSearchUserResults] = useState([])
  const [searchChatResults, setSearchChatResults] = useState([])
  const [drawer, setDrawer] = useState(false)

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

  const handleSearchInput = (value) => {
    setSearchInput(value)
  }

  const handleSidebarContent = (content) => {
    setSidebarContent(content)
  }

  const handleUserResults = (results) => {
    setSearchUserResults(results)
  }

  const handleChatResults = (results) => {
    setSearchChatResults(results)
  }

  const backToMain = () => {
    handleSidebarContent('main')
    setSearchInput('')
  }

  const handleDrawer = (value) => {
    setDrawer(value)
  }

  return (
    <div id="sidebar">
        {sidebarContent === 'write' || sidebarContent === 'search' ?
          <div id="sidebarHeader">
            <button onClick={backToMain} className="mainButton">
              <img src={backIcon} alt="back" className="mainButtonImg"></img>
            </button>
            <Search 
              handleSidebarContent={handleSidebarContent} 
              handleUserResults={handleUserResults}
              handleChatResults={handleChatResults}
              searchInput={searchInput}
              handleSearchInput={handleSearchInput}
            />
          </div>
        : !sidebarContent || sidebarContent === 'main' ?
          <div id="sidebarHeader">
            <Menu 
              chats={chats} 
              updateChats={updateChats}
              handleSidebarContent={handleSidebarContent}
              handleDrawer={handleDrawer}
            />
            <Search 
              handleSidebarContent={handleSidebarContent} 
              handleUserResults={handleUserResults}
              handleChatResults={handleChatResults}
              searchInput={searchInput}
              handleSearchInput={handleSearchInput}
            />
          </div>
        :
          null
        }
        {!sidebarContent && null}
        {sidebarContent === 'main' &&
          <AllChats 
            chats={chats} 
            handleSidebarContent={handleSidebarContent}
            allMessages={allMessages}
          />
        }
        {sidebarContent === 'write' &&
          <div id="sidebarWrite">
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
          </div>
        }
        {sidebarContent === 'search' &&
          <SearchResults 
            handleSidebarContent={handleSidebarContent}
            searchUserResults={searchUserResults}
            searchChatResults={searchChatResults}
            openChat={openChat}
          />
        }
        <Profile 
          handleSidebarContent={handleSidebarContent} 
          drawer={drawer}
          handleDrawer={handleDrawer}
        />
    </div>
  )
}

export default Sidebar
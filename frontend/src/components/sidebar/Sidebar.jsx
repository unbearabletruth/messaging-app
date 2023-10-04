import { useState, useEffect } from "react"
import backIcon from '../../assets/images/back-icon.svg'
import Search from "./Search";
import Menu from "./Menu";
import AllChats from "./AllChats";
import SearchResults from "./SearchResults";
import Profile from "./Profile";
import { useAuthContext } from '../../hooks/UseAuthContext';
import { useOnlineUsersContext } from "../../hooks/UseOnlineUsersContext";
import moment from 'moment';

function Sidebar({allMessages, openChat})  {
  const { user } = useAuthContext()
  const { onlineUsers } = useOnlineUsersContext()
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
    <div id="sidebar" className="scrollable">
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
            handleSidebarContent={handleSidebarContent}
            allMessages={allMessages}
          />
        }
        {sidebarContent === 'write' &&
          <div id="sidebarWrite">
            {users && users.map(u => {
              return (
                u._id !== user._id &&
                <div className="userCard" key={u._id} onClick={(e) => openChat(e, u._id)}>
                  <div className='userCardPicWrapper'>
                    <img src={u.profilePic} alt="profile picture" className="userCardPic"></img>
                    {onlineUsers.includes(u._id) && 
                      <div className='userCardStatus'></div>
                    }
                  </div>
                  <div className="userCardInfo">
                    <p className="userCardName">{u.username}</p>
                    {onlineUsers.includes(u._id) ? 
                      <p className='userCardStatusText'>online</p>
                      : u.lastSeen &&
                      <p className='userCardLastSeen'>last seen {moment(u.lastSeen).fromNow()}</p>
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
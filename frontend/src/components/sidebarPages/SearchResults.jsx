import moment from 'moment';
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";
import { useOnlineUsersContext } from "../../hooks/UseOnlineUsersContext";

function SearchResults({searchUserResults, searchChatResults, openChat}) {
  const { setCurrentChat } = useCurrentChatContext()
  const { onlineUsers } = useOnlineUsersContext()

  return (
    <>
    {searchUserResults.length > 0 && 
      <div className='sidebarSearchContent'>
        <h1 className='searchTitle'>Users</h1> 
        {searchUserResults.map(user => {
          return (
            <div className="userCard" key={user._id} onClick={(e) => openChat(e, user._id)}>
              <div className='userCardPicWrapper'>
                <img src={user.profilePic} alt="profile picture" className="userCardPic"></img>
                {onlineUsers.includes(user._id) && 
                  <div className='userCardStatus'></div>
                }
              </div>
              <div className="userCardInfo">
                <p className="userCardName">{user.username}</p>
                {onlineUsers.includes(user._id) ? 
                  <p className='userCardStatusText'>online</p>
                  : user.lastSeen &&
                  <p className='userCardLastSeen'>last seen {moment(user.lastSeen).fromNow()}</p>
                }
              </div>
            </div>
          )
        })}
      </div>
    }
    {searchChatResults.length > 0 && 
      <div className='sidebarSearchContent'>
        <h1 className='searchTitle'>Groups</h1> 
        {searchChatResults.map(chat => {
          return (
            <div onClick={() => setCurrentChat(chat)} key={chat._id} className="sidebarChat">
              <div className="sidebarChatContent">
                <div className='userCardPicWrapper'>
                  <img src={chat.groupPic} alt="group picture" className="userCardPic"></img>
                </div>
                <div className="sidebarChatMain">
                  <p className="sidebarChatName">{chat.name}</p>
                  {chat.latestMessage ?
                    <p className="sidebarChatLatest">{chat.latestMessage.text}</p>
                    :
                    <p className="sidebarChatLatest">Click to start a conversation!</p>
                  }
                </div>
              </div>
            </div>
          )
        })}
      </div>
    }
  </>
  )
}

export default SearchResults
import moment from 'moment';
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";

function SearchResults({searchUserResults, searchChatResults, onlineUsers, openChat}) {
  const { handleCurrentChat } = useCurrentChatContext()

  return (
    <>
    {searchUserResults.length > 0 && 
      <div className='sidebarSearchContent'>
        <h1 className='searchTitle'>Users</h1> 
        {searchUserResults.map(user => {
          return (
            <div className="sidebarUser" key={user._id} onClick={(e) => openChat(e, user._id)}>
              <div className='sidebarPicWrapper'>
                <img src={user.profilePic} alt="profile picture" className="sidebarPic"></img>
                {onlineUsers.includes(user._id) && 
                  <div className='sidebarUserStatus'></div>
                }
              </div>
              <div>
                <p className="sidebarName">{user.username}</p>
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
            <div onClick={() => handleCurrentChat(chat)} key={chat._id} className="sidebarChat">
              <div className="sidebarChatContent">
                <div className='sidebarPicWrapper'>
                  <img src={chat.groupPic} alt="group picture" className="sidebarPic"></img>
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
              <p className="sidebarChatUpdatedAt">{moment(chat.updatedAt).format('DD.MM.YYYY')}</p>
            </div>
          )
        })}
      </div>
    }
  </>
  )
}

export default SearchResults
import moment from 'moment';

function SearchResults({searchUserResults, searchChatResults}) {

  return (
    <>
    {searchUserResults.length > 0 && 
      <>
        <h1>users</h1> 
        {searchUserResults.map(user => {
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
    {searchChatResults.length > 0 && 
      <>
        <h1>chats</h1> 
        {searchChatResults.map(chat => {
          return (
            <div onClick={() => handleChat(chat)} key={chat._id} className="sidebarChat">
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
  )
}

export default SearchResults
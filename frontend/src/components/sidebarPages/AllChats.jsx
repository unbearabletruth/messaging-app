import pencilIcon from '../../assets/images/pencil-icon.svg'
import { useAuthContext } from '../../hooks/UseAuthContext';
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";
import { useOnlineUsersContext } from "../../hooks/UseOnlineUsersContext";
import formatDate from '../../formatDate';

function AllChats({chats, handleSidebarContent, allMessages}) {
  const { user } = useAuthContext()
  const { currentChat, handleCurrentChat } = useCurrentChatContext()
  const { onlineUsers } = useOnlineUsersContext()
  
  const calculateUnread = (chat) => {
    const chatMes = allMessages.find(mess => mess.id === chat._id).messages
    const yourTimestamp = chat.lastSeenInChat.find(ls => ls.id === user._id).timestamp
    const unread = chatMes.filter(mes => mes.author._id !== user._id && mes.updatedAt > yourTimestamp)
    return unread.length
  }

  return (
    <>
      <div id='sidebarMain'>
        {chats && chats.map(chat => {
          return (
            chat.isGroupChat ?
              <div 
                onClick={() => handleCurrentChat(chat)} 
                key={chat._id} 
                className={`sidebarChat ${currentChat?._id === chat._id ? 'selected' : ''}`}
              >
                <div className="sidebarChatContent">
                  <div className='userCardPicWrapper'>
                    <img src={chat.groupPic} alt="group picture" className="userCardPic"></img>
                  </div>
                  <div className="sidebarChatMain">
                    <div className='sidebarChatNameAndDate'>
                      <p className={`sidebarChatName ${currentChat?._id === chat._id ? 'selected' : ''}`}>{chat.name}</p>
                      {chat.latestMessage &&
                        <p className={`sidebarChatUpdatedAt ${currentChat?._id === chat._id ? 'selected' : ''}`}>{formatDate(chat.latestMessage.updatedAt)}</p>
                      }
                    </div>
                    <div className='sidebarChatMessageAndUnread'>
                      <p className={`sidebarChatLatest ${currentChat?._id === chat._id ? 'selected' : ''}`}>
                        {chat.latestMessage ? chat.latestMessage.text : 'Click to start a conversation!'}
                      </p>
                      {allMessages.find(mes => mes.id === chat._id) && calculateUnread(chat) > 0 &&
                        <div className={`sidebarUnread ${currentChat?._id === chat._id ? 'selected' : ''}`}>
                          {calculateUnread(chat)}
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            :
              !chat.isGroupChat && chat.users.map(u => {
                return (
                  u.username !== user.username ?
                    <div 
                      onClick={() => handleCurrentChat(chat)} 
                      key={chat._id} 
                      className={`sidebarChat ${currentChat?._id === chat._id ? 'selected' : ''}`}
                    >
                      <div className="sidebarChatContent">
                        <div className='userCardPicWrapper'>
                          <img src={u.profilePic} alt="profile picture" className="userCardPic"></img>
                          {onlineUsers.includes(u._id) && 
                            <div className='userCardStatus'></div>
                          }
                        </div>
                        <div className="sidebarChatMain">
                          <div className='sidebarChatNameAndDate'>
                            <p className={`sidebarChatName ${currentChat?._id === chat._id ? 'selected' : ''}`}>{u.username}</p>
                            {chat.latestMessage &&
                              <p className={`sidebarChatUpdatedAt ${currentChat?._id === chat._id ? 'selected' : ''}`}>{formatDate(chat.latestMessage.updatedAt)}</p>
                            }
                          </div>
                          <div className='sidebarChatMessageAndUnread'>
                            <p className={`sidebarChatLatest ${currentChat?._id === chat._id ? 'selected' : ''}`}>
                              {chat.latestMessage ? chat.latestMessage.text : 'Click to start a conversation!'}
                            </p>
                            {allMessages.find(mes => mes.id === chat._id) && calculateUnread(chat) > 0 &&
                              <div className={`sidebarUnread ${currentChat?._id === chat._id ? 'selected' : ''}`}>
                                {calculateUnread(chat)}
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    :
                    null
                  )
                })
              )
          })
        }
      </div>
      <button className="bigButton write" onClick={() => handleSidebarContent('write')}>
        <img src={pencilIcon} alt="write someone" className="bigButtonImg"></img>
      </button>
    </>
  )
}

export default AllChats
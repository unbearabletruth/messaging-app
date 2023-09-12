import pencilIcon from '../../assets/images/pencil-icon.svg'
import { useAuthContext } from '../../hooks/UseAuthContext';
import { useState } from 'react';
import moment from 'moment';

function AllChats({chats, handleChat, handleSidebarContent, onlineUsers, allMessages}) {
  const { user } = useAuthContext()
  const [selected, setSelected] = useState(null)

  const setChat = (chat) => {
    setSelected(chat._id)
    handleChat(chat)
  }
  
  const calculateUnread = (chat) => {
    const chatMes = allMessages.find(mess => mess.id === chat._id).messages
    const yourTimestamp = chat.lastSeenInChat.find(ls => ls.id === user._id).timestamp
    const unread = chatMes.filter(mes => mes.author._id !== user._id && mes.updatedAt > yourTimestamp)
    return unread.length
  }

  return (
    <>
    {chats && chats.map(chat => {
      return (
        chat.isGroupChat ?
          <div 
            onClick={() => setChat(chat)} 
            key={chat._id} 
            className={`sidebarChat ${selected === chat._id ? 'selected' : ''}`}
          >
            <div className="sidebarChatContent">
              <div className='sidebarPicWrapper'>
                <img src={chat.groupPic} alt="group picture" className="sidebarPic"></img>
              </div>
              <div className="sidebarChatMain">
                <div className='sidebarChatNameAndDate'>
                  <p className={`sidebarChatName ${selected === chat._id ? 'selected' : ''}`}>{chat.name}</p>
                  <p className={`sidebarChatUpdatedAt ${selected === chat._id ? 'selected' : ''}`}>{moment(chat.updatedAt).format('DD.MM.YYYY')}</p>
                </div>
                <div className='sidebarChatMessageAndUnread'>
                  <p className={`sidebarChatLatest ${selected === chat._id ? 'selected' : ''}`}>
                    {chat.latestMessage ? chat.latestMessage.text : 'Click to start a conversation!'}
                  </p>
                  {allMessages.find(mes => mes.id === chat._id) && calculateUnread(chat) > 0 &&
                    <div className={`sidebarUnread ${selected === chat._id ? 'selected' : ''}`}>
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
                  onClick={() => setChat(chat)} 
                  key={chat._id} 
                  className={`sidebarChat ${selected === chat._id ? 'selected' : ''}`}
                >
                  <div className="sidebarChatContent">
                    <div className='sidebarPicWrapper'>
                      <img src={u.profilePic} alt="profile picture" className="sidebarPic"></img>
                      {onlineUsers.includes(u._id) && 
                        <div className='sidebarUserStatus'></div>
                      }
                    </div>
                    <div className="sidebarChatMain">
                      <div className='sidebarChatNameAndDate'>
                        <p className={`sidebarChatName ${selected === chat._id ? 'selected' : ''}`}>{u.username}</p>
                        <p className={`sidebarChatUpdatedAt ${selected === chat._id ? 'selected' : ''}`}>{moment(chat.updatedAt).format('DD.MM.YYYY')}</p>
                      </div>
                      <div className='sidebarChatMessageAndUnread'>
                        <p className={`sidebarChatLatest ${selected === chat._id ? 'selected' : ''}`}>
                          {chat.latestMessage ? chat.latestMessage.text : 'Click to start a conversation!'}
                        </p>
                        {allMessages.find(mes => mes.id === chat._id) && calculateUnread(chat) > 0 &&
                          <div className={`sidebarUnread ${selected === chat._id ? 'selected' : ''}`}>
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
    <button className="bigButton write" onClick={() => handleSidebarContent('write')}>
      <img src={pencilIcon} alt="write someone" className="bigButtonImg"></img>
    </button>
    </>
  )
}

export default AllChats

//messages.messages.filter(mes => mes.updatedAt > chat.lastSeenInChat.find(ls => ls.id === user._id).timestamp).length}
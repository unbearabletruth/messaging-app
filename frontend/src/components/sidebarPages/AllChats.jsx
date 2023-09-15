import pencilIcon from '../../assets/images/pencil-icon.svg'
import { useAuthContext } from '../../hooks/UseAuthContext';
import { useState } from 'react';
import formatDate from '../../formatDate';

function AllChats({chats, handleChat, handleSidebarContent, onlineUsers, allMessages, selected, handleSelected}) {
  const { user } = useAuthContext()

  const setChat = (chat) => {
    handleSelected(chat._id)
    handleChat(chat)
  }
  
  const calculateUnread = (chat) => {
    const chatMes = allMessages.find(mess => mess.id === chat._id).messages
    const yourTimestamp = chat.lastSeenInChat.find(ls => ls.id === user._id).timestamp
    const unread = chatMes.filter(mes => mes.author._id !== user._id && mes.updatedAt > yourTimestamp)
    return unread.length
  }
  console.log(selected)
  return (
    <>
      <div id='sidebarMain'>
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
                      <p className={`sidebarChatUpdatedAt ${selected === chat._id ? 'selected' : ''}`}>{formatDate(chat.latestMessage.updatedAt)}</p>
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
                            <p className={`sidebarChatUpdatedAt ${selected === chat._id ? 'selected' : ''}`}>{formatDate(chat.latestMessage.updatedAt)}</p>
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
      </div>
      <button className="bigButton write" onClick={() => handleSidebarContent('write')}>
        <img src={pencilIcon} alt="write someone" className="bigButtonImg"></img>
      </button>
    </>
  )
}

export default AllChats
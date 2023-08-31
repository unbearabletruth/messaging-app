import pencilIcon from '../../assets/images/pencil-icon.svg'
import { useAuthContext } from '../../hooks/UseAuthContext';
import { useState } from 'react';
import moment from 'moment';

function AllChats({chats, handleChat, handleSidebarContent}) {
  const { user } = useAuthContext()
  const [selected, setSelected] = useState(null)

  const setChat = (chat) => {
    setSelected(chat._id)
    handleChat(chat)
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
                    <img src={u.profilePic} alt="profile picture" className="sidebarPic"></img>
                    <div className="sidebarChatMain">
                      <p className={`sidebarChatUser ${selected === chat._id ? 'selected' : ''}`}>{u.username}</p>
                      {chat.latestMessage ?
                        <p className={`sidebarChatLatest ${selected === chat._id ? 'selected' : ''}`}>{chat.latestMessage.text}</p>
                        :
                        <p className={`sidebarChatLatest ${selected === chat._id ? 'selected' : ''}`}>Click to start a conversation!</p>
                      }
                    </div>
                  </div>
                  <p className={`sidebarChatUpdatedAt ${selected === chat._id ? 'selected' : ''}`}>{moment(chat.updatedAt).format('DD.MM.YYYY')}</p>
                </div>
                :
                null
              )
            })
          )
      })
    }
    <button id="writeButton" onClick={() => handleSidebarContent('write')}>
      <img src={pencilIcon} alt="write someone" id="writeButtonImg"></img>
    </button>
    </>
  )
}

export default AllChats
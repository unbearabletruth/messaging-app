
import { useAuthContext } from '../../hooks/UseAuthContext';
import moment from 'moment';
import { useState, Fragment } from 'react';
import closeIcon from '../../assets/images/close-icon.svg'
import backIcon from '../../assets/images/back-icon.svg'
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";
import { useOnlineUsersContext } from "../../hooks/UseOnlineUsersContext";
import ChatDrawer from './ChatDrawer';
import ChatMenu from './ChatMenu';

function ChatHeader({screenWidth, openChat}) {
  const { user } = useAuthContext()
  const { onlineUsers } = useOnlineUsersContext()
  const { currentChat, handleCurrentChat } = useCurrentChatContext()
  const [drawer, setDrawer] = useState(false)
  const [subsPopup, setSubsPopup] = useState(false)

  const handleDrawer = (value) => {
    setDrawer(value)
  }

  const handleSubsPopup = (value) => {
    setSubsPopup(value)
  }

  return(
    <div id="chatHeader">
      <ChatDrawer drawer={drawer} handleDrawer={handleDrawer} handleSubsPopup={handleSubsPopup}/>
      {currentChat && !currentChat.isGroupChat && currentChat.users.map(u => {
          return (
            u._id !== user._id &&
              <Fragment key={u._id}>
                <div className='chatHeaderInfo' onClick={() => {setDrawer(!drawer)}}>
                  {screenWidth < 768 &&
                    <button onClick={() => handleCurrentChat(null)} className="mainButton">
                      <img src={backIcon} alt="back" className="mainButtonImg"></img>
                    </button>
                  }
                  <img src={u.profilePic} alt="profile picture" id="chatHeaderPic"></img>
                  <div className='chatInfoText'>
                    <p className="chatName">{u.username}</p>
                    {onlineUsers.includes(u._id) ? 
                      <p id='chatUserStatus'>online</p>
                      : u.lastSeen &&
                      <p id='chatLastSeen'>last seen {moment(u.lastSeen).fromNow()}</p>
                    }
                  </div>
                </div>
                <ChatMenu isGroupChat={currentChat.isGroupChat} handleDrawer={handleDrawer}/>
              </Fragment>
          )}
        )
      }
      {currentChat && currentChat.isGroupChat && 
        <>
          <div className='chatHeaderInfo' key={currentChat._id} onClick={() => {setDrawer(!drawer)}}>
            {screenWidth < 768 &&
              <button onClick={() => handleCurrentChat(null)} className="mainButton">
                <img src={backIcon} alt="back" className="mainButtonImg"></img>
              </button>
            }
            <img src={currentChat.groupPic} alt="group picture" id="chatHeaderPic"></img>
            <div className='chatInfoText'>
              <p className='chatName'>{currentChat.name}</p>
              <p id='chatSubscribers'>{currentChat.users.length} {currentChat.users.length === 1 ? 'subscriber' : 'subscribers'}</p>
            </div>
          </div>
          <ChatMenu isGroupChat={currentChat.isGroupChat} handleDrawer={handleDrawer}/>
          {subsPopup &&
            <div className="popupBackground">
              <div className='popup userListPopup'>
                <button onClick={() => setSubsPopup(false)} className="mainButton closePopup">
                  <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
                </button>
                {currentChat.users.length > 0 ?
                  <>
                    {currentChat.users && currentChat.users.map(u => {
                      return (
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
                  </>
                  :
                  <h1 className='requestsTitle'>Group is empty!</h1>
                }
              </div>
            </div>
          }
        </>
      }
    </div>
  )
}

export default ChatHeader
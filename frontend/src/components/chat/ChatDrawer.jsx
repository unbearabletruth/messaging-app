import usernameIcon from '../../assets/images/at.svg'
import bioIcon from '../../assets/images/info.svg'
import closeIcon from '../../assets/images/close-icon.svg'
import groupIcon from '../../assets/images/group.svg'
import { useCurrentChatContext } from "../../hooks/UseCurrentChatContext";
import { useAuthContext } from '../../hooks/UseAuthContext';
import moment from 'moment';

function ChatDrawer({drawer, handleDrawer, handleSubsPopup}) {
  const { currentChat } = useCurrentChatContext()
  const { user } = useAuthContext()

  return (
    currentChat &&
      <div id='drawerWrapper'>
        <div id='drawer' className={drawer ? 'active' : ''}>
          <div className='profileHeader'>
            <button onClick={() => handleDrawer(false)} className="mainButton">
              <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
            </button>
            <h1 className='sidebarTitle'>Profile</h1>
          </div>
          <div id='profilePictureWrapper'>
            {currentChat.isGroupChat ?
              <>
                <img src={currentChat.groupPic} alt='group picture' className='profilePicture'></img>
                <div className='profilePicCaption'>{currentChat.name}</div>
              </>
              :
              <>
                <img src={currentChat.users.find(u => u._id !== user._id).profilePic} alt='profile picture' className='profilePicture'></img>
                <div className='profilePicCaption'>last seen {moment(currentChat.users.find(u => u._id !== user._id).lastSeen).fromNow()}</div>
              </>
            }
          </div>
          {!currentChat.isGroupChat &&
            <div className='profileInfoBlock'>
              <div className='profileInfoSection'>
                <img src={usernameIcon} alt='username icon' className='profileInfoIcon'></img>
                <div className='profileInfoMain'>
                  <p className='profileInfo'>{currentChat.users.find(u => u._id !== user._id).username}</p>
                  <p className='profileInfoTitle'>Username</p>
                </div>
              </div>
              {currentChat.users.find(u => u._id !== user._id).bio &&
                <div className='profileInfoSection'>
                  <img src={bioIcon} alt='bio icon' className='profileInfoIcon'></img>
                  <div className='profileInfoMain'>
                    <p className='profileInfo'>{currentChat.users.find(u => u._id !== user._id).bio}</p>
                    <p className='profileInfoTitle'>Bio</p>
                  </div>
                </div>
              }
            </div>
          }
          {currentChat.isGroupChat &&
            <div className='profileInfoBlock'>
              <div className='profileInfoSection  clickable' onClick={() => handleSubsPopup(true)}>
                <img src={groupIcon} alt='subs icon' className='profileInfoIcon'></img>
                <div className='profileInfoMain'>
                  <p className='profileInfo'>{currentChat.users.length} {currentChat.users.length === 1 ? 'subscriber' : 'subscribers'}</p>
                  <p className='profileInfoTitle'>Click to see details</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
  )
}

export default ChatDrawer
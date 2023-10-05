import { useAuthContext } from '../../hooks/UseAuthContext';
import '../../assets/styles/Profile.css'
import { useState } from 'react';
import editIcon from '../../assets/images/edit.svg'
import backIcon from '../../assets/images/back-icon.svg'
import usernameIcon from '../../assets/images/at.svg'
import bioIcon from '../../assets/images/info.svg'
import ProfileEditor from './ProfileEditor';

function Profile({handleSidebarContent, drawer, handleDrawer}) {
  const { user } = useAuthContext()
  const [form, setForm] = useState(false)

  const backToMain = () => {
    handleSidebarContent('main')
    handleDrawer(false)
  }

  const closeForm = () => {
    setForm(false)
  }

  return (
    <div id='sidebarDrawerWrapper'>
      <div id='sidebarDrawer' className={drawer ? 'active' : ''}>
        {!form ?
          <>
            <div className='profileHeader'>
              <button onClick={backToMain} className="mainButton">
                <img src={backIcon} alt="back" className="mainButtonImg"></img>
              </button>
              <h1 className='sidebarTitle'>Profile</h1>
              <button onClick={() => setForm(true)} className='mainButton'>
                <img src={editIcon} alt='edit' className='mainButtonImg'></img>
              </button>
            </div>
            <div id='profileContent'>
              <img src={user.profilePic} alt='profile picture' className='profilePicture'></img>
              <div className='profileInfoBlock'>
                <div className='profileInfoSection'>
                  <img src={usernameIcon} alt='username icon' className='profileInfoIcon'></img>
                  <div className='profileInfoMain'>
                    <p className='profileInfo'>{user.username}</p>
                    <p className='profileInfoTitle'>Username</p>
                  </div>
                </div>
                {user.bio &&
                  <div className='profileInfoSection'>
                    <img src={bioIcon} alt='bio icon' className='profileInfoIcon'></img>
                    <div className='profileInfoMain'>
                      <p className='profileInfo'>{user.bio}</p>
                      <p className='profileInfoTitle'>Bio</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </>
        :
          <ProfileEditor closeForm={closeForm}/>
        }
      </div>
    </div>
  )
}

export default Profile
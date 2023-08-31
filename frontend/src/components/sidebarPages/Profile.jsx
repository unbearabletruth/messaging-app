import { useAuthContext } from '../../hooks/UseAuthContext';
import '../../assets/styles/Profile.css'
import { useState } from 'react';
import addPhoto from '../../assets/images/add-photo.png'
import editIcon from '../../assets/images/edit.svg'
import backIcon from '../../assets/images/back-icon.svg'
import submitIcon from '../../assets/images/submit.svg'


function Profile({handleSidebarContent}) {
  const { user } = useAuthContext()
  const [form, setForm] = useState(false)
  const [profileInfo, setProfileInfo] = useState({
    username: '',
    profilePic: null
  })

  const onProfileImageChange = (e) => {
    setProfileInfo({
      ...profileInfo,
      image: e.target.files[0]
    })  
  }

  const handleEditChange = (e) => {
    setProfileInfo({
      ...profileInfo,
      [e.target.name] : e.target.value
    })
  }

  const onEditSubmit = (e) => {
    e.preventDefault()

  }

  return (
    !form ?
      <div id='profileInfo'>
        <div id='profileHeader'>
          <button onClick={() => handleSidebarContent('')} className="mainButton">
            <img src={backIcon} alt="back" className="mainButtonImg"></img>
          </button>
          <p>Profile</p>
          <button onClick={() => setForm(true)} className='mainButton'>
            <img src={editIcon} alt='edit' className='mainButtonImg'></img>
          </button>
        </div>
        <img src={user.profilePic} alt='profile picture' id='profilePicture'></img>
        <div id='profileUsernameBlock'>
          <div id='profileUsernameMain'>
            <p id='profileUsernameTitle'>Username</p>
            <p id='profileUsername'>{user.username}</p>
          </div>
        </div>
      </div>
    :
      <>
        <button onClick={() => setForm(false)} className="mainButton">
          <img src={backIcon} alt="back" className="mainButtonImg"></img>
        </button>
        <form onSubmit={onEditSubmit} id='profileEditForm'>
          <button className='bigButton submit'>
            <img src={submitIcon} alt='submit' className='bigButtonImg'></img>
          </button>
          <div className='changeProfilePicture'>
            <img 
              src={profileInfo.image ? URL.createObjectURL(profileInfo.image) : user.profilePic}
              alt="profile picture" 
              className='uploadProfileImage'
            >
            </img>
            <label>
              <div className='addImageWrapper'>
                <input type="file" id='uploadInput' onChange={onProfileImageChange}></input>
                <img src={addPhoto} alt='add photo' className='uploadImageAdd'></img>
              </div>
            </label>
          </div>
          <input
            className='profileInput' 
            onChange={handleEditChange} 
            placeholder='Username'
            name='username'
            value={profileInfo.username}
          >
          </input>
        </form>
      </>
  )
}

export default Profile
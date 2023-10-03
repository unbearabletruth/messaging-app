import { useAuthContext } from '../../hooks/UseAuthContext';
import '../../assets/styles/Profile.css'
import { useState, useEffect, useRef } from 'react';
import addPhoto from '../../assets/images/add-photo.png'
import editIcon from '../../assets/images/edit.svg'
import backIcon from '../../assets/images/back-icon.svg'
import submitIcon from '../../assets/images/submit.svg'
import usernameIcon from '../../assets/images/at.svg'
import bioIcon from '../../assets/images/info.svg'
import uniqid from 'uniqid';

const isImage = ['gif','jpg','jpeg','png'];
const sizeLimit = 1024 * 1024 // 1 Mb

function Profile({handleSidebarContent, drawer, handleDrawer}) {
  const [wrongFile, setWrongFile] = useState(null)
  const fileInputRef = useRef(null);
  const { user, dispatch } = useAuthContext()
  const [form, setForm] = useState(false)
  const [errors, setErrors] = useState(null)
  const [profileInfo, setProfileInfo] = useState({
    username: '',
    bio: '',
    profilePic: null
  })

  useEffect(() => {
    setProfileInfo({
      ...profileInfo,
      username: user.username,
      bio: user.bio
    })
  }, [])

  const onMediaChange = (e) => {
    if (e.target.files[0].size > sizeLimit) {
      fileInputRef.current.value = null
      setWrongFile('tooBig')
      return
    }
    if(isImage.some(type => e.target.files[0].type.includes(type))) {
        setProfileInfo({
          ...profileInfo,
          profilePic: e.target.files[0]
        })  
      }
    else{
      fileInputRef.current.value = null
      setWrongFile('wrongType')
    }
  }

  const handleEditChange = (e) => {
    setProfileInfo({
      ...profileInfo,
      [e.target.name] : e.target.value
    })
  }

  const onEditSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData();
    formData.append('profilePic', profileInfo.profilePic);
    if (profileInfo.username !== user.username) {
      formData.append('username', profileInfo.username);
    }
    formData.append('bio', profileInfo.bio);
    
    const response = await fetch(`http://localhost:3000/users/${user._id}`, {
      method: 'PATCH',
      body: formData,
    })
    const json = await response.json()
    if (!response.ok) {
      setErrors(json.errors)
    }
    if (response.ok) {
      setForm(false)
      dispatch({type: 'set', payload: json})
      const localStateUser = JSON.parse(localStorage.getItem('user'))
      localStateUser.username = json.username
      localStorage.setItem('user', JSON.stringify(localStateUser))
    } 
  }

  useEffect(() => {
    if (wrongFile || errors) {
      const timeId = setTimeout(() => {
          setWrongFile(null)
          setErrors(null)
        }, 7000)
    
      return () => {
        clearTimeout(timeId)
      }
    }
  }, [wrongFile, errors]);

  const backToMain = () => {
    handleSidebarContent('main')
    handleDrawer(false)
  }

  const reverseChanges = () => {
    fileInputRef.current.value = null
    setProfileInfo({
      username: user.username,
      bio: user.bio,
      profilePic: null
    })
  }

  const onFormClose = () => {
    setForm(false)
    reverseChanges()
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
          <>
            <div className='profileHeader'>
              <button onClick={onFormClose} className="mainButton">
                <img src={backIcon} alt="back" className="mainButtonImg"></img>
              </button>
              <h1 className='sidebarTitle'>Edit profile</h1>
            </div>
            <form onSubmit={onEditSubmit} id='profileEditForm' encType="multipart/form-data">
              {profileInfo.profilePic !== null || !['', user.username].includes(profileInfo.username) ||
              !['', user.bio].includes(profileInfo.bio) ?
                <button className='profileSubmit' onSubmit={onEditSubmit}>
                  <img src={submitIcon} alt='submit' className='bigButtonImg'></img>
                </button>
                :
                <button className='profileSubmitInactive' type='button'>
                  <img src={submitIcon} alt='submit' className='bigButtonImg'></img>
                </button>
              }
              <div className='changeProfilePicture'>
                <img 
                  src={profileInfo.profilePic ? URL.createObjectURL(profileInfo.profilePic) : user.profilePic}
                  alt="profile picture" 
                  className='uploadProfileImage'
                >
                </img>
                <label>
                  <div className='addImageWrapper'>
                    <input 
                      type="file" 
                      className='uploadInput' 
                      onChange={onMediaChange} 
                      accept='.gif,.jpg,.jpeg,.png'
                      ref={fileInputRef} 
                    >
                    </input>
                    <img src={addPhoto} alt='add photo' className='uploadImageAdd' name='profilePic'></img>
                  </div>
                </label>
              </div>
              <input
                type="text"
                className='profileInput' 
                onChange={handleEditChange} 
                placeholder='Username'
                name='username'
                value={profileInfo.username}
              >
              </input>
              <input
                type="text"
                className='profileInput' 
                onChange={handleEditChange} 
                placeholder='Bio'
                name='bio'
                value={profileInfo.bio}
              >
              </input>
            </form>
          </>
        }
        {(wrongFile || errors) &&
          <div className="wrongFileMessage" id='wfmProfile'>
            {wrongFile === 'wrongType' &&
              <p className="wrongFileLine">Image: gif, jpg, jpeg, png</p>
            }
            {wrongFile === 'tooBig' &&
              <p className="wrongFileLine">Image shouldn't exceed 1 Mb</p>
            }
            {errors && errors.map(err => {
            return (
              <p key={uniqid()} className="wrongFileLine">{err.msg}</p>
              )
            })}
          </div>
        }
      </div>
    </div>
  )
}

export default Profile
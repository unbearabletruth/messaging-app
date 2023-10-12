import addPhoto from '../../assets/images/add-photo.png'
import submitIcon from '../../assets/images/submit.svg'
import backIcon from '../../assets/images/back-icon.svg'
import { useState, useEffect, useRef } from 'react';
import uniqid from 'uniqid';
import { useAuthContext } from '../../hooks/UseAuthContext';
import useAlert from '../../hooks/UseAlert';
import { URL } from '../../constants';

const isImage = ['gif','jpg','jpeg','png'];
const sizeLimit = 1024 * 1024 // 1 Mb

function ProfileEditor({closeForm}) {
  const { user, dispatch } = useAuthContext()
  const [profileInfo, setProfileInfo] = useState({
    username: '',
    bio: '',
    profilePic: null
  })
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState([])
  const [errorAlert, setErrorAlert] = useAlert()

  useEffect(() => {
    setProfileInfo({
      ...profileInfo,
      username: user.username,
      bio: user.bio ? user.bio : ''
    })
  }, [])

  const onMediaChange = (e) => {
    if (e.target.files[0].size > sizeLimit) {
      fileInputRef.current.value = null
      setErrorAlert('fileTooBig')
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
      setErrorAlert('wrongFileType')
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
    
    const response = await fetch(`${URL}/users/${user._id}`, {
      method: 'PATCH',
      body: formData,
    })
    const json = await response.json()
    if (!response.ok) {
      setErrors(json.errors)
      setErrorAlert('wrongTextInput')
    }
    if (response.ok) {
      closeForm()
      dispatch({type: 'set', payload: json})
      const localStateUser = JSON.parse(localStorage.getItem('user'))
      localStateUser.username = json.username
      localStorage.setItem('user', JSON.stringify(localStateUser))
    } 
  }

  const reverseChanges = () => {
    fileInputRef.current.value = null
    setProfileInfo({
      username: user.username,
      bio: user.bio ? user.bio : '',
      profilePic: null
    })
  }

  const onFormClose = () => {
    closeForm()
    reverseChanges()
  }

  return (
    <>
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
      {errorAlert &&
        <div className="alert">
          {errorAlert === 'wrongFileType' &&
            <p className="alertLine">Image: gif, jpg, jpeg, png</p>
          }
          {errorAlert === 'fileTooBig' &&
            <p className="alertLine">Image shouldn't exceed 1 Mb</p>
          }
          {errorAlert === 'wrongTextInput' && errors.map(err => {
          return (
            <p key={uniqid()} className="alertLine">{err.msg}</p>
            )
          })}
        </div>
      }
    </>
  )
}

export default ProfileEditor
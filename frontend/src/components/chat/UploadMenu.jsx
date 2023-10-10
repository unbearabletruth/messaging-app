import documentIcon from '../../assets/images/document-upload.svg'
import imageIcon from '../../assets/images/image-icon.svg'
import attachIcon from '../../assets/images/attach.svg'
import useClickOutside from '../../hooks/UseClickOutside';
import useAlert from '../../hooks/UseAlert';

const isImage = ['gif','jpg','jpeg','png'];
const isVideo = ['mp4','mov']
const sizeLimit = 10 * 1024 * 1024 // 10 Mb

function UploadMenu({imgVidInputRef, fileInputRef, handleUploadPopup, setMedia}) {
  const { triggerRef, showMenu } = useClickOutside(false)
  const [errorAlert, setErrorAlert] = useAlert()

  const onImageOrVideoChange = (e) => {
    if (e.target.files[0].size > sizeLimit) {
      imgVidInputRef.current.value = null
      setErrorAlert('fileTooBig')
      return
    }
    if (isImage.some(type => e.target.files[0].type.includes(type)) ||
    isVideo.some(type => e.target.files[0].type.includes(type))) {
      setMedia(e.target.files[0])
      handleUploadPopup(true)  
    }
    else {
      imgVidInputRef.current.value = null
      setErrorAlert('wrongFileType')
    }
  }

  const onFileChange = (e) => {
    if (e.target.files[0].size > sizeLimit) {
      fileInputRef.current.value = null
      setErrorAlert('fileTooBig')
      return
    }
    setMedia(e.target.files[0])
    handleUploadPopup(true)  
  }

  return (
    <>
      <button type='button' className='mainButton textbox' ref={triggerRef}>
        <img src={attachIcon} alt='attach' className="mainButtonImg"></img>
      </button>
      <div className={`menu ${showMenu ? 'visible' : ''}`} id='uploadMenu'>
        <label>
          <div className='menuOption'>
            <input 
              type="file" 
              className='uploadInput' 
              onChange={onImageOrVideoChange} 
              accept='.gif,.jpg,.jpeg,.png,.mp4,.mov'
              ref={imgVidInputRef} 
            >
            </input>
            <img src={imageIcon} alt='attach' className="menuOptionIcon"></img>
            <p>Image or Video</p>
          </div>
        </label>
        <label>
          <div className='menuOption'>
            <input 
              type="file" 
              className='uploadInput' 
              onChange={onFileChange} 
              ref={fileInputRef}
            >
            </input>
            <img src={documentIcon} alt='attach' className="menuOptionIcon"></img>
            <p>File</p>
          </div>
        </label>
      </div>
      {errorAlert &&
        <div className="alert chat">
          {errorAlert === 'wrongFileType' ?
            <>
              <p className="alertLine">Image: gif, jpg, jpeg, png</p>
              <p className="alertLine">Video: mp4, mov</p>
            </>
          :
            <p className="alertLine">File shouldn't exceed 10 Mb</p>
          }
        </div>
      }
    </>
  )
}

export default UploadMenu
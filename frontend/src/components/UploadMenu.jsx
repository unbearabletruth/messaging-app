import documentIcon from '../assets/images/document-upload.svg'
import imageIcon from '../assets/images/image-icon.svg'
import attachIcon from '../assets/images/attach.svg'
import useClickOutside from '../hooks/UseClickOutside';

function UploadMenu({onImageOrVideoChange, onFileChange, imgVidInputRef, fileInputRef}) {
  const { triggerRef, showMenu } = useClickOutside(false)

  return (
    <>
      <button className='mainButton' ref={triggerRef}>
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
    </>
  )
}

export default UploadMenu
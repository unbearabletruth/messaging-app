import fileIcon from '../../assets/images/file-icon.svg'
import { useThemeContext } from "../../hooks/UseThemeContext";
import formatBytes from '../../utils/formatSize';

function MediaPreview({media, isImage, isVideo}) {
  const { isDark } = useThemeContext()

  return (
    isImage.some(type => media.type.includes(type)) ?
      <img 
        src={URL.createObjectURL(media)}
        alt="upload preview" 
        className='uploadMediaPreview'
      >
      </img>
    : isVideo.some(type => media.type.includes(type)) ?
      <video
        src={URL.createObjectURL(media)}
        className='uploadMediaPreview'
        controls
      >
      </video>
    :
      <div className='fileBlock'>
        <div className='fileImageWrapper'>
          <img 
            src={fileIcon} 
            alt='file icon' 
            className={`fileImage ${isDark ? 'dark' : ''}`}
          >
          </img>
          <span className='fileExtension'>{media.name.split('.').pop()}</span>
        </div>
        <div className='fileText'>
          <p className='fileName'>{media.name}</p>
          <p className='fileSize'>{formatBytes(media.size)}</p>
        </div>
      </div>
  )
}

export default MediaPreview
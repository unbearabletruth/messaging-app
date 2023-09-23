import fileIcon from '../assets/images/file-icon.svg'
import { useThemeContext } from "../hooks/UseThemeContext";
import formatBytes from '../utils/formatSize';

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
      <div id='uploadFilePreview'>
        <img 
          src={fileIcon} 
          alt='file icon' 
          id='uploadFileImage' 
          className={isDark ? 'dark' : ''}
        >
        </img>
        <div id='uploadFileText'>
          <p className='uploadFileInfo'>{media.name}</p>
          <p className='uploadFileInfo'>{formatBytes(media.size)}</p>
        </div>
      </div>
  )
}

export default MediaPreview
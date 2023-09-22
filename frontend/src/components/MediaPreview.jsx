function MediaPreview({media, isImage}) {
  return (
    isImage.some(type => media.type.includes(type)) ?
      <img 
        src={URL.createObjectURL(media)}
        alt="upload preview" 
        className='uploadMediaPreview'
      >
      </img>
      :
      <video
        src={URL.createObjectURL(media)}
        className='uploadMediaPreview'
        controls
      >
      </video>
  )
}

export default MediaPreview
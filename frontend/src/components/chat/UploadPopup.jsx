import closeIcon from '../../assets/images/close-icon.svg'
import MediaPreview from './MediaPreview';
import { useMemo } from 'react';
import formatTooManySymbols from '../../utils/formatTooManySymbols';

function UploadPopup({onUploadPopupClose, newMessage, textboxPopupRef, submitMessage, handleMessage, handleEnter, loading}) {

  const mediaPreview = useMemo(() => (
    newMessage.media &&
      <MediaPreview media={newMessage.media} />
  ), [newMessage.media])

  return (
    <div className="popupBackground">
      <div className="popup" id="uploadMediaPopup">
        <button onClick={onUploadPopupClose} className="mainButton closePopup">
          <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
        </button>
        {mediaPreview}
        <form id="uploadForm" onSubmit={submitMessage} encType="multipart/form-data">
          <div 
            ref={textboxPopupRef}
            onInput={handleMessage}
            onKeyDown={handleEnter}
            id="uploadInput"
            className='scrollable'
            aria-label='new message'
            role='textbox'
            contentEditable='true'
            tabIndex='0'
            data-placeholder='Text'
          >
          </div>
          <div id='uploadPopupFooter'>
            {!newMessage.text || newMessage.text.length > 4096 || loading ?
              <button type='button' className="formButtonInactive">Send</button>
              :
              <button className="formButton">Send</button>
            }
            {loading && <div className='loader smaller'></div>}
            {newMessage.text.length > 4096 &&
              <div className="tooManySymbols">
                {formatTooManySymbols(newMessage.text.length)}
              </div>
            }
          </div>
        </form>
      </div>
    </div>
  )
}

export default UploadPopup
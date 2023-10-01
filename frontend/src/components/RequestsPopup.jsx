import acceptIcon from '../assets/images/submit.svg'
import closeIcon from '../assets/images/close-icon.svg'
import { useCurrentChatContext } from "../hooks/UseCurrentChatContext";
import { socket } from '../socket';
import moment from 'moment';
import { useOnlineUsersContext } from "../hooks/UseOnlineUsersContext";

function RequestsPopup({handleRequestsPopup}) {
  const { currentChat, handleCurrentChat } = useCurrentChatContext()
  const { onlineUsers } = useOnlineUsersContext()

  const admitRequest = async (req) => {
    const userId = {user: req._id}
    await fetch(`http://localhost:3000/chats/${currentChat._id}/add`, {
      method: 'PATCH',
      body: JSON.stringify(userId),
      headers: {
        'Content-type': 'application/json'
      }
    })

    removeRequest(req)
  }

  const removeRequest = async (req) => {
    const reqId = {request: req._id}
    const response = await fetch(`http://localhost:3000/chats/${currentChat._id}/removeRequest`, {
      method: 'PATCH',
      body: JSON.stringify(reqId),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      handleCurrentChat(json)
      socket.emit('update chat', json)
    }
  }

  return (
    <div className="popupBackground">
      <div className='popup' id="requestsPopup">
        <button onClick={() => handleRequestsPopup(false)} className="mainButton closePopup">
          <img src={closeIcon} alt="x" className="mainButtonImg closeIcon"></img>
        </button>
        {currentChat.requests.length > 0 ?
          <>
            {currentChat.requests && currentChat.requests.map(req => {
              return (
                <div className="userCard" key={req._id}>
                  <div className='userCardPicWrapper'>
                    <img src={req.profilePic} alt="profile picture" className="userCardPic"></img>
                    {onlineUsers.includes(req._id) && 
                      <div className='userCardStatus'></div>
                    }
                  </div>
                  <div className="userCardInfo">
                    <p className="userCardName">{req.username}</p>
                    {onlineUsers.includes(req._id) ? 
                      <p className='userCardStatusText'>online</p>
                      : req.lastSeen &&
                      <p className='userCardLastSeen'>last seen {moment(req.lastSeen).fromNow()}</p>
                    }
                  </div>
                  <div className='requestButtons'>
                    <button className="acceptButton" onClick={() => admitRequest(req)}>
                      <img src={acceptIcon} alt="accept" className="acceptButtonImg"></img>
                    </button>
                    <button className="declineButton" onClick={() => removeRequest(req)}>
                      <img src={closeIcon} alt="x" className="declineButtonImg"></img>
                    </button>
                  </div>
                </div>
              )
            })}
          </>
          :
          <h1 className='requestsTitle'>No requests</h1>
        }
      </div>
    </div>
  )
}

export default RequestsPopup
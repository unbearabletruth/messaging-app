import '../assets/styles/Chat.css'
import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import moment from 'moment';
import { useAuthContext } from '../hooks/UseAuthContext';

function Chat() {
  const {id} = useParams();
  const [messages, setMessages] = useState(null)
  const {user} = useAuthContext()

  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(`http://localhost:3000/chats/${id}/messages`)
      const json = await response.json()
      if (response.ok) {
        setMessages(json)
      }
    }

    fetchMessages()
  }, [])

  return (
    <div className="background">
      {messages && messages.map(message => {
        return (
          <div className={message.author.username === user.username ? 'myMessage' : 'message'} key={message._id}>
            <span className='messageText'>{message.text}</span>
            <span className='messageTime'>{moment(message.createdAt).format('hh:mm')}</span>
          </div>
        )
      })}
    </div>
  )
}

export default Chat
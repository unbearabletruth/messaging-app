import { useCurrentChatContext } from "./UseCurrentChatContext";
import { useChatsContext } from './UseChats';
import { HOST } from "../constants";

const botName = 'Welcome Bot'

export function useWelcomeChat() {
  const { handleCurrentChat } = useCurrentChatContext()
  const { chats, handleChats } = useChatsContext()

  const initBot = async (userId) => {
    const response = await fetch(`${HOST}/users/bot/${botName}`)
    const json = await response.json()
    if (!response.ok) {
      createBot(userId)
    }
    if (response.ok) {
      newWelcomeChat(userId, json._id)
    }
  }

  const createBot = async (userId) => {
    const welcomeBot = {
      username: 'Welcome Bot',
      password: 'whatever'
    }
    const response = await fetch(`${HOST}/users/signup`, {
      method: 'POST',
      body: JSON.stringify(welcomeBot),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      newWelcomeChat(userId, json._id)
    }
  }
  
  const newWelcomeChat = async (userId, botId) => {
    const newChat = {
      isGroupChat: false,
      users: [userId, botId]
    }
    console.log(newChat)
    const response = await fetch(`${HOST}/chats`, {
      method: 'POST',
      body: JSON.stringify(newChat),
      headers: {
        'Content-type': 'application/json'
      }
    })
    const json = await response.json()
    if (response.ok) {
      handleChats([json, ...chats])
      handleCurrentChat(json)
      welcomeMessage(json._id, botId)
    }
  }

  const welcomeMessage = async (chatId, botId) => {
    const message = {
      text: 'Welcome to the Messaging App! Start a conversation by clicking "write" button or by using search instead.',
      chat: chatId,
      author: botId
    }
    await fetch(`${HOST}/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: {
        'Content-type': 'application/json'
      }
    })
  }
  

  return { initBot }
}

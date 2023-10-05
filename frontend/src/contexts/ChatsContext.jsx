import { useState, createContext } from "react";

export const ChatsContext = createContext()

const sortByLatestMessage = (chats) => {
  //if latestMessage falsy, then compare with updatedAt
  const sortedChats = [...chats].sort((a, b) => {
    if (!a.latestMessage && !b.latestMessage) {
      return a.updatedAt < b.updatedAt ? 1 : -1
    }
    else if (!a.latestMessage) {
      return a.updatedAt < b.latestMessage.updatedAt ? 1 : -1
    }
    else if (!b.latestMessage) {
      return a.latestMessage.updatedAt < b.updatedAt ? 1 : -1
    }
    return a.latestMessage.updatedAt < b.latestMessage.updatedAt ? 1 : -1
  })

  return sortedChats
}

export const ChatsContextProvider = ({children}) => {
  const [chats, setChats] = useState([])

  const handleChats = (chats) => {
    const sortedChats = sortByLatestMessage(chats)
    setChats(sortedChats)
  }

  return (
    <ChatsContext.Provider value={{ chats, handleChats }}>
      {children}
    </ChatsContext.Provider>
  )
}
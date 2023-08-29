import { useState, useEffect, useRef } from "react";
import '../assets/styles/Search.css'
import searchIcon from '../assets/images/search-icon.svg'
import { useNavigate } from "react-router-dom";

function Search({toggleSearch, handleUserResults, handleChatResults}){
  const [input, setInput] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearch = async () => {
      const [resUsers, resChats] = await Promise.all([
        fetch(`http://localhost:3000/users/search?search=${input}`),
        fetch(`http://localhost:3000/chats/search?search=${input}`)
      ])
      const jsonUsers = await resUsers.json()
      const jsonChats = await resChats.json()
      if (resUsers.ok) {
        handleUserResults(jsonUsers)
      }
      if (resChats.ok) {
        handleChatResults(jsonChats)
      }
    }

    if (input.length > 0) {
      fetchSearch()
    } else {
      handleUserResults([])
      handleChatResults([])
    }
  }, [input])

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)){
        setSearchActive(false)
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [searchRef]);

  const handleInput = (e) => {
    setInput(e.target.value)
  }

  const handleClick = () => {
    setSearchActive(true)
    toggleSearch(true)
  }

  return(
    <div id="searchBar" onClick={handleClick} ref={searchRef}>
      <div id="searchIconWrapper" className={searchActive ? 'active' : ''}>
        <img src={searchIcon} alt="search" id="searchIcon"></img>
      </div>
      <input 
        type='search' 
        id='search' 
        placeholder='Search'
        onChange={handleInput}
        autoComplete="off"
        className={searchActive ? 'active' : ''}
        value={input}
      >
      </input>
    </div>
  )
}

export default Search;
import { useState, useEffect, useRef } from "react";
import '../assets/styles/Search.css'
import searchIcon from '../assets/images/search-icon.svg'
import { useThemeContext } from "../hooks/UseThemeContext";

function Search({handleSidebarContent, handleUserResults, handleChatResults, searchInput, handleSearchInput}){
  const [searchActive, setSearchActive] = useState(false)
  const searchRef = useRef(null)
  const { isDark } = useThemeContext()

  useEffect(() => {
    const fetchSearch = async () => {
      const [resUsers, resChats] = await Promise.all([
        fetch(`http://localhost:3000/users/search?search=${searchInput}`),
        fetch(`http://localhost:3000/chats/search?search=${searchInput}`)
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

    if (searchInput.length > 0) {
      fetchSearch()
    } else {
      handleUserResults([])
      handleChatResults([])
    }
  }, [searchInput])

  const handleClick = () => {
    setSearchActive(true)
    handleSidebarContent('search')
  }

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
  }, []);

  return(
    <div id="searchBar" onClick={handleClick} ref={searchRef}>
      <div id="searchIconWrapper" className={searchActive ? 'active' : ''}>
        <img src={searchIcon} alt="search" id="searchIcon" className={isDark ? 'dark' : ''}></img>
      </div>
      <input 
        type='search' 
        id='search' 
        placeholder='Search'
        onChange={(e) => handleSearchInput(e.target.value)}
        autoComplete="off"
        className={searchActive ? 'active' : ''}
        value={searchInput}
      >
      </input>
    </div>
  )
}

export default Search;
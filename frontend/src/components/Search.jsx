import { useState, useEffect, useRef } from "react";
import '../assets/styles/Search.css'
import searchIcon from '../assets/images/search-icon.svg'
import { useNavigate } from "react-router-dom";

function Search({toggleSearch}){
  const [input, setInput] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate();

  useEffect(() => {

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
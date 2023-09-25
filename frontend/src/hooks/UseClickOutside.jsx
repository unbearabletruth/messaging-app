import { useState, useEffect, useRef } from "react"

function useClickOutside(initState) {
  const [showMenu, setShowMenu] = useState(initState)
  const triggerRef = useRef(null)
  const nodeRef = useRef(null)
  
  const handleClickOutside = (e) => {
    if (triggerRef.current && triggerRef.current.contains(e.target)) {
      return setShowMenu(!showMenu)
    } else if (!nodeRef.current && triggerRef.current && 
      !triggerRef.current.contains(e.target)) {
      return setShowMenu(false)
    }
   
    if (nodeRef.current && !nodeRef.current.contains(e.target)) {
      return setShowMenu(false)
    }
  }
  
  useEffect(() => {
    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [showMenu])

  return { triggerRef, nodeRef, showMenu }
}

export default useClickOutside
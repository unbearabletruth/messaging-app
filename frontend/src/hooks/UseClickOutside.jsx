import { useEffect } from "react"

function useClickOutside(ref, handleState, ref2 = null) {
  
  const handleClickOutside = (e) => {
    if (ref.current && !ref.current.contains(e.target)) {
      handleState()
    }
  }

  const handleClickOutsideTwo = (e) => {
    if (ref.current && !ref.current.contains(e.target) &&
    ref2.current && !ref2.current.contains(e.target)){
      handleState()
    }
  }
  
  useEffect(() => {
    if (ref2) {
      document.addEventListener("click", handleClickOutsideTwo);
      return () => {
        document.removeEventListener("click", handleClickOutsideTwo);
      };
    } else {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, []);
}

export default useClickOutside
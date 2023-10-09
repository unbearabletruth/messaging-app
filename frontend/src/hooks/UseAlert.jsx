import { useState, useEffect } from "react";

function useAlert() {
  const [alert, setAlert] = useState('')

  useEffect(() => {
    if (alert) {
      const timeId = setTimeout(() => {
          setAlert('')
        }, 5000)
    
      return () => {
        clearTimeout(timeId)
      }
    }
  }, [alert]);

  const handleAlert = (value) => {
    setAlert(value)
  }

  return [alert, handleAlert]
}

export default useAlert
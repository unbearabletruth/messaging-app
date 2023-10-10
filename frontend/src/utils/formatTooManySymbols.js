const charLimit = 4096

const formatTooManySymbols = (messageLength) => {
  let string = Math.abs(charLimit - messageLength).toString()
  if (string.length > 3) {
    string = `${string.slice(0, -3)}k`
  }
  return string
}

export default formatTooManySymbols
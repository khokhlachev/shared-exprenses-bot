const formatNumber = (
  n: number | string,
  fraction = 3,
  chars = " "
): string => {
  let s = typeof n === "number" ? `${n}` : n

  if (s.length < fraction) {
    return s
  }

  const len = s.length

  for (let i = len - fraction; i > 0; i -= fraction) {
    s = `${s.slice(0, i)}${chars}${s.slice(i)}`
  }

  return s
}

export default formatNumber

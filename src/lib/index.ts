export const formatNumber = (
  n: number | string,
  fraction = 3,
  chars = " "
): string => {
  let s = typeof n === "number" ? `${n}` : n
  const sign = s.charAt(0) === "-" ? 1 : 0

  if (s.length < fraction) {
    return s
  }

  const len = s.length

  for (let i = len - fraction; i > sign; i -= fraction) {
    s = `${s.slice(0, i)}${chars}${s.slice(i)}`
  }

  return s
}

export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

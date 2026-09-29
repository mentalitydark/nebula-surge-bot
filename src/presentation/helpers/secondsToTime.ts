export function secondsToTime(seconds: number): string {
  let remainingSeconds = seconds

  const day = Math.floor(remainingSeconds / 86400)
  remainingSeconds %= 86400

  if (remainingSeconds === 0) return `${day}d 0h 0m 0s`

  const hours = Math.floor(remainingSeconds / 3600)
  remainingSeconds %= 3600

  if (remainingSeconds === 0) return `${day}d ${hours}h 0m 0s`

  const minutes = Math.floor(remainingSeconds / 60)
  remainingSeconds %= 60

  if (remainingSeconds === 0) return `${day}d ${hours}h ${minutes}m 0s`

  return `${day}d ${hours}h ${minutes}m ${remainingSeconds}s`
}

export const isValidUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://')

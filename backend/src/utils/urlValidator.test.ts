import { isValidUrl } from './urlValidator'

describe('isValidUrl', () => {
  it('accepts http:// URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true)
  })

  it('accepts https:// URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
  })

  it('rejects a URL without protocol', () => {
    expect(isValidUrl('example.com')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isValidUrl('')).toBe(false)
  })

  it('rejects ftp:// URLs', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false)
  })
})

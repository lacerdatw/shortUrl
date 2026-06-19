import { generateCode } from './codeGenerator'

describe('generateCode', () => {
  it('generates a 6-character code', () => {
    expect(generateCode()).toHaveLength(6)
  })

  it('only contains alphanumeric characters', () => {
    expect(generateCode()).toMatch(/^[A-Za-z0-9]{6}$/)
  })

  it('produces unique values across many calls', () => {
    const codes = new Set(Array.from({ length: 200 }, generateCode))
    expect(codes.size).toBeGreaterThan(190)
  })
})

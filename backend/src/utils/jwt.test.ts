import { signToken, verifyToken } from './jwt'

beforeEach(() => {
  process.env.JWT_SECRET = 'test-secret-for-unit-tests'
  process.env.JWT_EXPIRES_IN = '24h'
})

describe('signToken', () => {
  it('returns a three-part JWT string', () => {
    const token = signToken('user@example.com')
    expect(token.split('.')).toHaveLength(3)
  })
})

describe('verifyToken', () => {
  it('returns the userId embedded in a valid token', () => {
    const token = signToken('user@example.com')
    expect(verifyToken(`Bearer ${token}`)).toBe('user@example.com')
  })

  it('throws when the Authorization header is missing', () => {
    expect(() => verifyToken(undefined)).toThrow('Unauthorized')
  })

  it('throws when the scheme is not Bearer', () => {
    expect(() => verifyToken('Basic sometoken')).toThrow('Unauthorized')
  })

  it('throws when the token is tampered with', () => {
    expect(() => verifyToken('Bearer invalid.token.here')).toThrow('Unauthorized')
  })

  it('throws when signed with a different secret', () => {
    process.env.JWT_SECRET = 'different-secret'
    const token = signToken('user@example.com')
    process.env.JWT_SECRET = 'original-secret'
    expect(() => verifyToken(`Bearer ${token}`)).toThrow('Unauthorized')
  })
})

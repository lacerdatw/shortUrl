import jwt from 'jsonwebtoken'

const secret = (): string => {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not set')
  return s
}

export const signToken = (userId: string): string =>
  jwt.sign({ userId }, secret(), { expiresIn: process.env.JWT_EXPIRES_IN ?? '24h' })

export const verifyToken = (authHeader: string | undefined): string => {
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
  try {
    const token = authHeader.slice(7)
    const payload = jwt.verify(token, secret()) as { userId: string }
    return payload.userId
  } catch {
    throw new Error('Unauthorized')
  }
}

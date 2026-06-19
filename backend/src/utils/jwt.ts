import jwt from 'jsonwebtoken'

export const signToken = (userId: string): string =>
  jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '24h' })

export const verifyToken = (authHeader: string | undefined): string => {
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
  try {
    const token = authHeader.slice(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    return payload.userId
  } catch {
    throw new Error('Unauthorized')
  }
}

jest.mock('../config/dynamodb', () => ({ db: { send: jest.fn() } }))
jest.mock('bcryptjs')

import { db } from '../config/dynamodb'
import bcrypt from 'bcryptjs'
import { createUser, verifyUser } from './userService'

const mockSend = db.send as jest.Mock
const mockHash = bcrypt.hash as jest.Mock
const mockCompare = bcrypt.compare as jest.Mock

describe('createUser', () => {
  it('hashes the password and stores the user', async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined }) // email not taken
    mockHash.mockResolvedValueOnce('hashed_password')
    mockSend.mockResolvedValueOnce({})                  // PutItem

    await createUser('new@example.com', 'password123')

    expect(mockHash).toHaveBeenCalledWith('password123', 10)
    expect(mockSend).toHaveBeenCalledTimes(2)
  })

  it('throws EMAIL_TAKEN when the email already exists', async () => {
    mockSend.mockResolvedValueOnce({ Item: { email: 'taken@example.com' } })

    await expect(createUser('taken@example.com', 'password123')).rejects.toThrow('EMAIL_TAKEN')
    expect(mockHash).not.toHaveBeenCalled()
  })
})

describe('verifyUser', () => {
  it('returns the userId when credentials are correct', async () => {
    mockSend.mockResolvedValueOnce({ Item: { email: 'user@example.com', passwordHash: 'hash' } })
    mockCompare.mockResolvedValueOnce(true)

    const userId = await verifyUser('user@example.com', 'password123')

    expect(userId).toBe('user@example.com')
  })

  it('throws INVALID_CREDENTIALS when user does not exist', async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined })

    await expect(verifyUser('ghost@example.com', 'password123')).rejects.toThrow('INVALID_CREDENTIALS')
  })

  it('throws INVALID_CREDENTIALS when password does not match', async () => {
    mockSend.mockResolvedValueOnce({ Item: { email: 'user@example.com', passwordHash: 'hash' } })
    mockCompare.mockResolvedValueOnce(false)

    await expect(verifyUser('user@example.com', 'wrong')).rejects.toThrow('INVALID_CREDENTIALS')
  })
})

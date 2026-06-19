jest.mock('../config/dynamodb', () => ({ db: { send: jest.fn() } }))
jest.mock('../utils/codeGenerator', () => ({ generateCode: jest.fn() }))

import { db } from '../config/dynamodb'
import { generateCode } from '../utils/codeGenerator'
import { createUrl, getUrl, incrementClicks, listUrlsByUser } from './urlService'

const mockSend = db.send as jest.Mock
const mockGenerateCode = generateCode as jest.Mock

const FIXED_DATE = '2024-01-01T00:00:00.000Z'
beforeAll(() => jest.useFakeTimers().setSystemTime(new Date(FIXED_DATE)))
afterAll(() => jest.useRealTimers())

describe('createUrl', () => {
  it('saves a new URL and returns the record', async () => {
    mockGenerateCode.mockReturnValue('abc123')
    mockSend
      .mockResolvedValueOnce({ Item: undefined }) // uniqueness check: code is free
      .mockResolvedValueOnce({})                  // PutItem

    const result = await createUrl('https://example.com', 'user@test.com')

    expect(result).toEqual({
      code: 'abc123',
      originalUrl: 'https://example.com',
      userId: 'user@test.com',
      createdAt: FIXED_DATE,
      clicks: 0
    })
  })

  it('retries code generation when the code is already taken', async () => {
    mockGenerateCode
      .mockReturnValueOnce('taken1')
      .mockReturnValueOnce('free22')
    mockSend
      .mockResolvedValueOnce({ Item: { code: 'taken1' } }) // first code exists
      .mockResolvedValueOnce({ Item: undefined })           // second code is free
      .mockResolvedValueOnce({})                            // PutItem

    const result = await createUrl('https://example.com', 'user@test.com')

    expect(result.code).toBe('free22')
    expect(mockSend).toHaveBeenCalledTimes(3)
  })
})

describe('getUrl', () => {
  it('returns the URL record when found', async () => {
    const record = { code: 'abc123', originalUrl: 'https://example.com', userId: 'u', createdAt: FIXED_DATE, clicks: 5 }
    mockSend.mockResolvedValueOnce({ Item: record })

    expect(await getUrl('abc123')).toEqual(record)
  })

  it('returns null when not found', async () => {
    mockSend.mockResolvedValueOnce({ Item: undefined })
    expect(await getUrl('nope00')).toBeNull()
  })
})

describe('incrementClicks', () => {
  it('sends an UpdateCommand for the given code', async () => {
    mockSend.mockResolvedValueOnce({})
    await incrementClicks('abc123')
    expect(mockSend).toHaveBeenCalledTimes(1)
  })
})

describe('listUrlsByUser', () => {
  it('returns the items from the GSI query', async () => {
    const items = [{ code: 'a1b2c3', originalUrl: 'https://x.com', userId: 'user@test.com', createdAt: FIXED_DATE, clicks: 2 }]
    mockSend.mockResolvedValueOnce({ Items: items })

    expect(await listUrlsByUser('user@test.com')).toEqual(items)
  })

  it('returns an empty array when the user has no URLs', async () => {
    mockSend.mockResolvedValueOnce({ Items: undefined })
    expect(await listUrlsByUser('user@test.com')).toEqual([])
  })
})

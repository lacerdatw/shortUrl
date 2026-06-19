jest.mock('../../services/urlService')
jest.mock('../../utils/jwt')

import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { handler } from './list'
import { listUrlsByUser } from '../../services/urlService'
import { verifyToken } from '../../utils/jwt'

const mockListUrls = listUrlsByUser as jest.Mock
const mockVerifyToken = verifyToken as jest.Mock

const event = (auth?: string): APIGatewayProxyEventV2 =>
  ({ headers: { authorization: auth } } as unknown as APIGatewayProxyEventV2)

beforeEach(() => {
  process.env.BASE_URL = 'http://localhost:3000'
})

describe('GET /urls', () => {
  it('returns 200 with the user URLs enriched with shortUrl', async () => {
    mockVerifyToken.mockReturnValueOnce('user@example.com')
    mockListUrls.mockResolvedValueOnce([
      { code: 'abc123', originalUrl: 'https://github.com', userId: 'user@example.com', createdAt: '2024-01-01', clicks: 3 }
    ])

    const res = await handler(event('Bearer token'), {} as never, {} as never)

    expect(res).toMatchObject({ statusCode: 200 })
    const body = JSON.parse((res as { body: string }).body)
    expect(body[0].shortUrl).toBe('http://localhost:3000/abc123')
  })

  it('returns 401 when the token is invalid', async () => {
    mockVerifyToken.mockImplementationOnce(() => { throw new Error('Unauthorized') })
    const res = await handler(event('Bearer bad'), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 401 })
  })
})

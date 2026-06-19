jest.mock('../../services/urlService')
jest.mock('../../utils/jwt')

import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { handler } from './create'
import { createUrl } from '../../services/urlService'
import { verifyToken } from '../../utils/jwt'

const mockCreateUrl = createUrl as jest.Mock
const mockVerifyToken = verifyToken as jest.Mock

const event = (body: unknown, auth?: string): APIGatewayProxyEventV2 =>
  ({ body: JSON.stringify(body), headers: { authorization: auth } } as unknown as APIGatewayProxyEventV2)

beforeEach(() => {
  process.env.BASE_URL = 'http://localhost:3000'
})

describe('POST /urls', () => {
  it('returns 201 with the short URL on success', async () => {
    mockVerifyToken.mockReturnValueOnce('user@example.com')
    mockCreateUrl.mockResolvedValueOnce({ code: 'abc123', originalUrl: 'https://github.com', userId: 'user@example.com', createdAt: '2024-01-01T00:00:00.000Z', clicks: 0 })

    const res = await handler(event({ originalUrl: 'https://github.com' }, 'Bearer token'), {} as never, {} as never)

    expect(res).toMatchObject({
      statusCode: 201,
      body: JSON.stringify({ code: 'abc123', shortUrl: 'http://localhost:3000/abc123', originalUrl: 'https://github.com' })
    })
  })

  it('returns 401 when the token is invalid', async () => {
    mockVerifyToken.mockImplementationOnce(() => { throw new Error('Unauthorized') })
    const res = await handler(event({ originalUrl: 'https://github.com' }, 'Bearer bad'), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 401 })
  })

  it('returns 400 when originalUrl is missing', async () => {
    mockVerifyToken.mockReturnValueOnce('user@example.com')
    const res = await handler(event({}), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 400 })
  })

  it('returns 400 when originalUrl has no protocol', async () => {
    mockVerifyToken.mockReturnValueOnce('user@example.com')
    const res = await handler(event({ originalUrl: 'github.com' }), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 400 })
  })
})

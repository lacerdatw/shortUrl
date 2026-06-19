jest.mock('../../services/userService')
jest.mock('../../utils/jwt')

import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { handler } from './login'
import { verifyUser } from '../../services/userService'
import { signToken } from '../../utils/jwt'

const mockVerifyUser = verifyUser as jest.Mock
const mockSignToken = signToken as jest.Mock

const event = (body: unknown): APIGatewayProxyEventV2 =>
  ({ body: JSON.stringify(body), headers: {} } as unknown as APIGatewayProxyEventV2)

describe('POST /auth/login', () => {
  it('returns 200 with a token on valid credentials', async () => {
    mockVerifyUser.mockResolvedValueOnce('user@example.com')
    mockSignToken.mockReturnValueOnce('signed-token')

    const res = await handler(event({ email: 'user@example.com', password: 'password123' }), {} as never, {} as never)

    expect(res).toMatchObject({ statusCode: 200, body: JSON.stringify({ token: 'signed-token' }) })
  })

  it('returns 400 when fields are missing', async () => {
    const res = await handler(event({ email: 'user@example.com' }), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 400 })
  })

  it('returns 401 on invalid credentials', async () => {
    mockVerifyUser.mockRejectedValueOnce(new Error('INVALID_CREDENTIALS'))
    const res = await handler(event({ email: 'user@example.com', password: 'wrong' }), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 401 })
  })

  it('returns 500 on unexpected errors', async () => {
    mockVerifyUser.mockRejectedValueOnce(new Error('DB_DOWN'))
    const res = await handler(event({ email: 'user@example.com', password: 'password123' }), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 500 })
  })
})

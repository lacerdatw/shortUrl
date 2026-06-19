jest.mock('../../services/userService')
jest.mock('../../utils/jwt')

import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { handler } from './register'
import { createUser } from '../../services/userService'
import { signToken } from '../../utils/jwt'

const mockCreateUser = createUser as jest.Mock
const mockSignToken = signToken as jest.Mock

const event = (body: unknown): APIGatewayProxyEventV2 =>
  ({ body: JSON.stringify(body), headers: {} } as unknown as APIGatewayProxyEventV2)

describe('POST /auth/register', () => {
  it('returns 201 with a token on success', async () => {
    mockCreateUser.mockResolvedValueOnce(undefined)
    mockSignToken.mockReturnValueOnce('signed-token')

    const res = await handler(event({ email: 'a@b.com', password: 'password123' }), {} as never, {} as never)

    expect(res).toMatchObject({ statusCode: 201, body: JSON.stringify({ token: 'signed-token' }) })
  })

  it('returns 400 when email is missing', async () => {
    const res = await handler(event({ password: 'password123' }), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 400 })
  })

  it('returns 400 when password is too short', async () => {
    const res = await handler(event({ email: 'a@b.com', password: 'short' }), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 400 })
  })

  it('returns 409 when email is already taken', async () => {
    mockCreateUser.mockRejectedValueOnce(new Error('EMAIL_TAKEN'))
    const res = await handler(event({ email: 'a@b.com', password: 'password123' }), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 409 })
  })

  it('returns 500 on unexpected errors', async () => {
    mockCreateUser.mockRejectedValueOnce(new Error('DB_DOWN'))
    const res = await handler(event({ email: 'a@b.com', password: 'password123' }), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 500 })
  })
})

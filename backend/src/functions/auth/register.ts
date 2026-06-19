import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { createUser } from '../../services/userService'
import { signToken } from '../../utils/jwt'
import { badRequest, conflict, created, serverError } from '../../utils/response'

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body ?? '{}') as Record<string, unknown>
  const { email, password } = body

  if (!email || !password) return badRequest('email and password are required')
  if (typeof password === 'string' && password.length < 8) return badRequest('password must be at least 8 characters')

  try {
    await createUser(email as string, password as string)
    return created({ token: signToken(email as string) })
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_TAKEN') return conflict('Email already in use')
    return serverError()
  }
}

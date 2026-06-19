import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { verifyUser } from '../../services/userService'
import { signToken } from '../../utils/jwt'
import { badRequest, ok, serverError, unauthorized } from '../../utils/response'

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body ?? '{}') as Record<string, unknown>
  const { email, password } = body

  if (!email || !password) return badRequest('email and password are required')

  try {
    const userId = await verifyUser(email as string, password as string)
    return ok({ token: signToken(userId) })
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') return unauthorized()
    return serverError()
  }
}

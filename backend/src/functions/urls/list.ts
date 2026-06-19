import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { listUrlsByUser } from '../../services/urlService'
import { verifyToken } from '../../utils/jwt'
import { ok, serverError, unauthorized } from '../../utils/response'

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  let userId: string
  try {
    userId = verifyToken(event.headers?.authorization)
  } catch {
    return unauthorized()
  }

  try {
    const urls = await listUrlsByUser(userId)
    const base = process.env.BASE_URL
    return ok(urls.map(u => ({ ...u, shortUrl: `${base}/${u.code}` })))
  } catch {
    return serverError()
  }
}

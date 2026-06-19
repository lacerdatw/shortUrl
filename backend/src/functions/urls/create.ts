import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { createUrl } from '../../services/urlService'
import { isValidUrl } from '../../utils/urlValidator'
import { verifyToken } from '../../utils/jwt'
import { badRequest, created, serverError, unauthorized } from '../../utils/response'

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  let userId: string
  try {
    userId = verifyToken(event.headers?.authorization)
  } catch {
    return unauthorized()
  }

  const body = JSON.parse(event.body ?? '{}') as Record<string, unknown>
  const { originalUrl } = body

  if (!originalUrl) return badRequest('originalUrl is required')
  if (!isValidUrl(originalUrl as string)) return badRequest('originalUrl must start with http:// or https://')

  try {
    const record = await createUrl(originalUrl as string, userId)
    const shortUrl = `${process.env.BASE_URL}/${record.code}`
    return created({ code: record.code, shortUrl, originalUrl: record.originalUrl })
  } catch {
    return serverError()
  }
}

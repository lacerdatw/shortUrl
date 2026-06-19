import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { getUrl, incrementClicks } from '../../services/urlService'
import { notFound, redirect, serverError } from '../../utils/response'

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const code = event.pathParameters?.code
  if (!code) return notFound('URL not found')

  try {
    const record = await getUrl(code)
    if (!record) return notFound('URL not found')

    await incrementClicks(code)
    return redirect(record.originalUrl)
  } catch {
    return serverError()
  }
}

type Body = Record<string, unknown> | unknown[]

const json = (statusCode: number, body: Body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})

export const ok = (body: Body) => json(200, body)
export const created = (body: Body) => json(201, body)
export const badRequest = (message: string) => json(400, { error: message })
export const unauthorized = () => json(401, { error: 'Unauthorized' })
export const notFound = (message: string) => json(404, { error: message })
export const conflict = (message: string) => json(409, { error: message })
export const serverError = () => json(500, { error: 'Internal server error' })

export const redirect = (location: string) => ({
  statusCode: 302,
  headers: { Location: location, 'Cache-Control': 'no-store' },
  body: ''
})

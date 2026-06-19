jest.mock('../../services/urlService')

import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { handler } from './redirect'
import { getUrl, incrementClicks } from '../../services/urlService'

const mockGetUrl = getUrl as jest.Mock
const mockIncrementClicks = incrementClicks as jest.Mock

const event = (code?: string): APIGatewayProxyEventV2 =>
  ({ pathParameters: code ? { code } : undefined } as unknown as APIGatewayProxyEventV2)

describe('GET /:code', () => {
  it('returns 301 with Location header and increments clicks', async () => {
    mockGetUrl.mockResolvedValueOnce({ code: 'abc123', originalUrl: 'https://github.com', clicks: 0 })
    mockIncrementClicks.mockResolvedValueOnce(undefined)

    const res = await handler(event('abc123'), {} as never, {} as never)

    expect(res).toMatchObject({ statusCode: 302, headers: { Location: 'https://github.com' } })
    expect(mockIncrementClicks).toHaveBeenCalledWith('abc123')
  })

  it('returns 404 when the code does not exist', async () => {
    mockGetUrl.mockResolvedValueOnce(null)
    const res = await handler(event('nope00'), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 404 })
  })

  it('returns 404 when no code is in the path', async () => {
    const res = await handler(event(), {} as never, {} as never)
    expect(res).toMatchObject({ statusCode: 404 })
  })
})

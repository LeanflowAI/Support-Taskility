import { RequestError } from './request-error'

describe('Request error', () => {
  test('error name property set correctly', async () => {
    const error = new RequestError(400, 'my request error')
    expect(error.name).toBe('RequestError')
  })
  test('error message property set correctly', async () => {
    const error = new RequestError(400, 'my request error')
    expect(error.message).toBe('my request error')
  })
  test('error statusCode property set correctly', async () => {
    const error = new RequestError(400, 'my request error')
    expect(error.statusCode).toBe(400)
  })
})

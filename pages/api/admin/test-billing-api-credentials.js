import { composeRoute } from 'services/api/helpers'
import { methodFilter, errorHandler } from 'services/api/helpers/middlewares'
import { facturamaApi } from 'services/api/billing/facturamaApi'

// export const config = { api: { bodyParser: { bodyParser: true, sizeLimit: '100b' } } }

// TODO: Complete tests for this route
export async function routeHandler(req, res, next) {
  const result = await facturamaApi.apiCredentialsTest()
  res.status(200).json(JSON.stringify(result))
  return next()
}

export default composeRoute([methodFilter('get'), routeHandler], errorHandler, [])

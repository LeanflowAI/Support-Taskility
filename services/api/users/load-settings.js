import { RequestError, composeRoute } from '../helpers'
import { checkUserToken, dbConnection, dbConnectionClose, errorHandler } from '../helpers/middlewares'

// TODO: Add config for all routes
export const config = { api: { bodyParser: { bodyParser: false, sizeLimit: '100b' } } }

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'loadUserSettings.errors.invalidUser' })

// TODO: Test this route
export const routeHandler = async (req, res, next) => {
  const { dbService, decodedToken } = req
  const { id: userId } = decodedToken
  const user = await dbService.getUserById(userId)

  if (!user) return next(new RequestError(400, 'loadUserSettings.errors.invalidUser'))

  res.json({ settings: user.profile.settings })
  return next()
}

export const route = composeRoute([checkUserTokenMiddleware, dbConnection, routeHandler], errorHandler, dbConnectionClose)

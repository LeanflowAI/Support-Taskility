import { RequestError, composeRoute } from '../helpers'
import { checkUserToken, dbConnection, dbConnectionClose, methodFilter, errorHandler } from '../helpers/middlewares'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'saveUserSettings.errors.invalidUser' })

// TODO: Test route
export const routeHandler = async (req, res, next) => {
  const { settings } = req.body
  if (!settings) return next(new RequestError(400, 'saveUsersSettings.errors.missingData'))

  const { decodedToken, dbService } = req
  const { id: userId } = decodedToken

  await dbService.saveUserSettings({ userId, settings })
  res.json({ ok: true })
  return next()
}

export const route = composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, routeHandler],
  errorHandler,
  dbConnectionClose
)

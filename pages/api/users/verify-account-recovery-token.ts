import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'
import { DbService } from 'services/model'

export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { token } = req.body
  if (!token) return next(new RequestError(400, 'passwordChange.errors.invalidToken'))

  const { dbService } = req
  const user = await dbService.getUserByRecoveryToken(token)

  if (!user) return next(new RequestError(404, 'passwordChange.errors.invalidUserToken'))

  res.json({})
  // TODO: return {message: 'verifyAccountRecoveryToken.success'}
  //   (definir estructura estandar para los valores de retorno correcto de las rutas)
  return next()
}

export default composeRoute([methodFilter('post'), dbConnection, routeHandler], errorHandler, dbConnectionClose)

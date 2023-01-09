import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'
import { DbService } from 'services/model'

export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { dbService, body } = req
  const user = await dbService.getUserByActivationToken(body.token)
  if (!user) return next(new RequestError(404, 'verifyEmail.errors.invalidToken'))

  await dbService.activateUser(body.token)

  res.json({ message: 'verifyEmail.messages.success' })
  return next()
}

export default composeRoute([methodFilter('post'), dbConnection, routeHandler], errorHandler, dbConnectionClose)

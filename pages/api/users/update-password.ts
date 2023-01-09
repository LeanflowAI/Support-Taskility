import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { NextApiRequest, NextApiResponse } from 'next'
import { DbService } from 'services/model'

export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { token, newPassword, repeatedPassword } = req.body
  if (!token || !newPassword || !repeatedPassword) return next(new RequestError(400, 'passwordChange.errors.missingData'))

  if (newPassword !== repeatedPassword) return next(new RequestError(404, 'passwordChange.errors.notMatch'))

  const { dbService } = req
  const user = await dbService.getUserByRecoveryToken(token)
  if (!user) return next(new RequestError(404, 'passwordChange.errors.invalidUserToken'))

  await dbService.updateUserPassword(token, newPassword)

  res.json({ message: 'passwordChange.messages.success' })
  return next()
}

export default composeRoute([methodFilter('post'), dbConnection, routeHandler], errorHandler, dbConnectionClose)

import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { createToken } from 'services/crypto'
import { NextApiRequest, NextApiResponse } from 'next'
import { DbService } from 'services/model'

export const config = { api: { bodyParser: { bodyParser: true, sizeLimit: '100b' } } }

// TODO: Complete tests for this route
export async function routeHandler(req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) {
  console.log('Logi API reached')
  const { body, dbService } = req
  const { email, password } = body
  
  if (!email || !password) return next(new RequestError(400, 'login.errors.missingData'))

  const user = await dbService.getUserByEmail(email)
  if (!user) return next(new RequestError(401, 'login.errors.userNotFound'))

  const validCredentials = await dbService.validateCredentials(user, password)
  if (validCredentials === false) return next(new RequestError(401, 'login.errors.invalidCredentials'))

  const { verified } = user.emails.find(({ address }) => address === email) || { verified: false }
  if (!verified) return next(new RequestError(401, 'login.errors.accountNotVerified'))

  const token = createToken({ id: user._id, email })
  await dbService.saveLoginToken({ userId: user._id, token })

  // TODO: Check for additional data required by the UI to be returned
  // TODO: Delete expired login tokens

  const userDetails = { username: user.username, savedUserSettings: user.profile.settings }
  res.status(200).json({ token, userDetails, route: 'login' })

  return next()
}

export default composeRoute([methodFilter('post'), dbConnection, routeHandler], errorHandler, dbConnectionClose)

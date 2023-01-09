import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler, loadUser } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; userId: string; loggedUser: User }

// TODO: Tests for this handler
export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService, loggedUser, query } = req
  const { user, newUserType } = body
  // const { userRole = '', userStatus = '', userClients = '' } = query
  // console.log(userId)
  const oldUserType = user.profile.userType
  await dbService.setUserType(user._id, newUserType, loggedUser)
  const eventDetails = {
    userId: user._id,
    username: user.username,
    userLastName: user.userLastName || null,
    oldUserType: oldUserType,
    newUserType: newUserType,
  }
  await dbService.addEventLog(dbService.eventLogTypes.userDelete, eventDetails, loggedUser)
  res.json({ ok: true })
  return next()
}

export default composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: true }), routeHandler],
  errorHandler,
  dbConnectionClose
)

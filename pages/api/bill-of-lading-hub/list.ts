import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler, loadUser } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; userId: string; loggedUser: User }

// TODO: Tests for this handler
export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService, loggedUser, query } = req
  const { filters, searchText, skip } = body
  const { from = '', to = '', BoLHClients = '', BoLHUsers = '' } = query

  const { BoLHubs, count } = await dbService.getBoLHList({
    user: loggedUser,
    filters,
    searchText,
    skip,
    from: from as string,
    to: to as string,
    BoLHClients: BoLHClients as string,
    BoLHUsers: BoLHUsers as string,
  })

  res.json({ BoLHubs, count })
  return next()
}

export default composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: true }), routeHandler],
  errorHandler,
  dbConnectionClose
)
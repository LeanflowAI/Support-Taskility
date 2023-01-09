import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler, loadUser } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

export const config = {
  api: {
    responseLimit: false,
  },
}

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; userId: string; loggedUser: User }

// TODO: Tests for this handler
export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService, loggedUser, query } = req
  const { filters, searchText, skip } = body
  const { from = '', to = '', cfdiType = '', cfdiStatus = '', cfdiClients = '' } = query

  const { cfdis, count } = await dbService.getCfdiList({
    user: loggedUser,
    filters,
    searchText,
    skip,
    from: from as string,
    to: to as string,
    cfdiType: cfdiType as string,
    cfdiStatus: cfdiStatus as string,
    cfdiClients: cfdiClients as string,
  })

  res.json({ cfdis, count })
  return next()
}



export default composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: true }), routeHandler],
  errorHandler,
  dbConnectionClose
)

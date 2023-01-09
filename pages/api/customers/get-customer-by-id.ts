import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, loadUser, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'newCfdi.errors.invalidUser' })

export const routeHandler = async (
  req: NextApiRequest & { dbService: DbService; loggedUser: User },
  res: NextApiResponse,
  next: Function
) => {
  const { dbService, loggedUser, query } = req
  const { profile } = loggedUser
  if (!profile.companyId) return next(new RequestError(400, 'newCfdi.errors.userWithoutCompany'))
  const id: string = query?.id?.toString() || ""

  const companyData = await dbService.getCompanyById(id)
  const businessRaltionshipData = await dbService.getServiceRelationship(profile.companyId,id)
  const data = {companyData: companyData, businessRelationshipData: businessRaltionshipData}
  // console.log('data in get-all-customers-and-users.ts', data)
  // console.log('users', usersData)
  // console.log('clients', clientsData)
  res.json({ ok: true, ...data })
  return next()
}

export default composeRoute(
  [methodFilter(), checkUserTokenMiddleware, dbConnection, loadUser(), routeHandler],
  errorHandler,
  dbConnectionClose
)
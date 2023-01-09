import { closeSync } from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler, loadUser } from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'saveCfdiDraft.errors.invalidUser' })

export const routeHandler = async (
  req: NextApiRequest & { dbService: DbService; loggedUser: User },
  res: NextApiResponse,
  next: Function
) => {
  const { loggedUser }: { loggedUser: User } = req
  const { dbService } = req
  if (!loggedUser) return next(new RequestError(400, 'saveNewPlace.errors.noData'))
  // console.log('loggedUser in api', loggedUser)
  // const { _id } = await dbService.saveNewBoLH(BoLH, loggedUser._id, loggedUser.profile?.companyId, loggedUser)
  // console.log('BoLH _id in api:', _id)
  // console.log("loggedUser", loggedUser)
  const loggedUserLicenses = loggedUser.licenses || [{ licenseId: '000777', licenseName: 'freeUser', active: true }]
  const loggedUserProfile = loggedUser.profile ? loggedUser.profile : null
  

  const company = loggedUser?.profile?.companyId ? await dbService.getCompanyProfile(loggedUser.profile.companyId) : null
  // console.log("company", company)
  const companyProfile = company?.profile ? company.profile : null

  // console.log('get-authorizations', loggedUser.licenses)
  res.json({ ok: true, loggedUserLicenses: loggedUserLicenses, loggedUserEmail: loggedUser.emails[0].address, loggedUserProfile: loggedUserProfile, companyProfile: companyProfile, loggedUserName: loggedUser.username })
  return next()
}

export default composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: false }), routeHandler],
  errorHandler,
  dbConnectionClose
)

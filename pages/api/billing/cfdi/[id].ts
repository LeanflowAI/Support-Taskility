import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService } from 'services/model'

// TODO: Update to bypass token validation only for transloadit requests.
// const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'getCfdi.errors.invalidUser' })

export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { dbService, query } = req
  const { id } = query

  if (!id) return next(new RequestError(400, 'getCfdi.errors.requiredCfdiId'))

  const cfdi = await dbService.getCfdi(id as string)
  if (!cfdi) return next(new RequestError(400, 'getCfdi.errors.cfdiNotFound'))

  const company = await dbService.getCompany({ companyId: cfdi.issuer.id })
  if (!company) return next(new RequestError(400, 'getCfdi.errors.issuerNotFound'))

  const issuerLogoUrl = await dbService.getCompanyLogoUrl(company.logoImageId ?? '')

  res.json({ ok: true, cfdi, issuerLogoUrl })
  return next()
}

export default composeRoute([methodFilter(), dbConnection, routeHandler], errorHandler, dbConnectionClose)

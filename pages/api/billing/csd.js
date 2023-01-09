import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { facturamaApi } from 'services/api/billing/facturamaApi'

// TODO: TEST THIS ROUTE
export const getHandler = async (req, res, next) => {
  if (req.method !== 'GET') return next()

  const { dbService, loggedUser } = req
  const currentCompany = await dbService.getUserCurrentCompany(loggedUser)
  const { data, error } = await facturamaApi.getCsd(currentCompany.rfc)
  if (error) return next(new RequestError(400, error))

  res.json({ ok: true, rfc: data.Rfc, uploadedAt: data.UploadDate })
  return next()
}

export const postHandler = async (req, res, next) => {
  if (req.method !== 'POST') return next()

  const { body, dbService } = req

  const { rfc, certificateFile, privateKeyFile, privateKeyPassword } = body
  if (!rfc) return next(new RequestError(400, 'loadCsd.errors.missingRfc'))
  if (!certificateFile) return next(new RequestError(400, 'loadCsd.errors.missingCertificateFile'))
  if (!privateKeyFile) return next(new RequestError(400, 'loadCsd.errors.missingPrivateKey'))
  if (!privateKeyPassword) return next(new RequestError(400, 'loadCsd.errors.missingPrivateKeyPassword'))

  const csdData = {
    Rfc: rfc,
    Certificate: certificateFile,
    PrivateKey: privateKeyFile,
    PrivateKeyPassword: privateKeyPassword,
  }
  const { error } = await facturamaApi.addCsd(csdData)
  if (error) return next(new RequestError(400, error))

  await dbService.setCompanyHaveCsd({ rfc, haveCsd: true })

  res.json({ ok: true })
  return next()
}

export const deleteHandler = async (req, res, next) => {
  if (req.method !== 'DELETE') return next()

  const { loggedUser, dbService } = req
  const currentCompany = await dbService.getUserCurrentCompany(loggedUser)

  const { error } = await facturamaApi.deleteCsd(currentCompany.rfc)
  if (error) return next(new RequestError(400, error))

  await dbService.setCompanyHaveCsd({ rfc: currentCompany.rfc, haveCsd: false })

  res.json({ ok: true })
  return next()
}

export default composeRoute(
  [
    methodFilter(['post', 'get', 'delete']),
    checkUserToken({ errorMessage: 'csd.errors.invalidUser' }),
    dbConnection,
    getHandler,
    postHandler,
    deleteHandler,
  ],
  errorHandler,
  dbConnectionClose
)

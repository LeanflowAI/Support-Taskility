import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService } from 'services/model'
import { routeHandler as sendNotificationRouteHandler } from './send-new-cfdi-notification'

type Request = NextApiRequest & { body: any; dbService: DbService; cfdiId: string }

// TODO: Check that the request comes from Transloadit
// const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'getCfdiXml.errors.invalidUser' })

export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService } = req
  // TODO: Check request signature (body.signature)
  const { transloadit } = body
  const { ok, results, params } = JSON.parse(transloadit)
  if (ok === 'ASSEMBLY_COMPLETED') {
    const { cfdiId } = JSON.parse(params)
    const pdf = results.buildPdf[0]
    await dbService.attachPdfToCfdi(cfdiId, { createdAt: new Date(), type: 'url', url: pdf.ssl_url, size: pdf.size, ext: pdf.ext })
    req.cfdiId = cfdiId // Pass the cfdiId to the send-new-cfdi-notification handler
  }

  res.json({ ok: true })
  return next()
}

export default composeRoute(
  [methodFilter('post'), dbConnection, routeHandler, sendNotificationRouteHandler],
  errorHandler,
  dbConnectionClose
)

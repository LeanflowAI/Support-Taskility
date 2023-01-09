import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { DbService } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'saveCfdiDraft.errors.invalidUser' })

export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { body: cfdi, dbService }: { body: any; dbService: DbService } = req
  if (!cfdi) return next(new RequestError(400, 'saveCfdiDraft.errors.noData'))
  await dbService.saveCfdiDraft(cfdi)
  res.json({ ok: true })
  return next()
}

export default composeRoute([methodFilter('post'), checkUserTokenMiddleware, dbConnection, routeHandler], errorHandler, dbConnectionClose)

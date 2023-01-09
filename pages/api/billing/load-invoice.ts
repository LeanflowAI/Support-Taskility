import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, errorHandler, dbConnectionClose } from 'services/api/helpers/middlewares'
import { DbService } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'loadInvoice.errors.invalidUser' })

// TODO: Tests for this handler
export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { body, dbService } = req
  const invoice = await dbService.getInvoice({ invoiceId: body.invoiceId })
  res.json({ invoice })
  return next()
}

export default composeRoute([methodFilter('post'), checkUserTokenMiddleware, dbConnection, routeHandler], errorHandler, dbConnectionClose)

import { NextApiRequest, NextApiResponse } from 'next'
import { DbService } from 'services/model'
import { composeRoute } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { post } from 'services/fetch'
import { log } from 'services/logs'

// TODO: Check that request comes from Atlas Trigger
export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { dbService }: { body: any; dbService: DbService } = req
  const cfdis = await dbService.getCancelPendingCfdis()
  await Promise.all(
    cfdis.map(async ({ _id: cfdiId }) => {
      const { error } = await post(`https://${process.env.VERCEL_URL}/api/billing/cancel-cfdi/${cfdiId}`, { body: { cfdiId } })
      if (error) log('error', error.message)
    })
  )
  res.json({ ok: true })
  return next()
}

export default composeRoute([methodFilter('post'), dbConnection, routeHandler], errorHandler, dbConnectionClose)

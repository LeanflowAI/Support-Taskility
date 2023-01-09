import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { createPdfFromUrl } from 'services/pdf'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'createCfdi.errors.invalidUser' })

type Request = NextApiRequest & { cfdiId: string }

export const generateCfdiPdf = (publicUrl: string) => async (req: Request, res: NextApiResponse, next: Function) => {
  const { cfdiId } = req.query
  if (process.env.NODE_ENV === 'production') {
    await createPdfFromUrl(`${publicUrl}/cfdi/${cfdiId}`, `${publicUrl}/api/billing/cfdi-pdf-created`, { cfdiId })
  }
  res.status(200).json({ ok: true, message: `PDF generation requested for Cfdi Id ${cfdiId}` })
  next()
}

export default composeRoute(
  [methodFilter('get'), checkUserTokenMiddleware, generateCfdiPdf(`https://${process.env.VERCEL_URL}` as string)],
  errorHandler,
  dbConnectionClose
)

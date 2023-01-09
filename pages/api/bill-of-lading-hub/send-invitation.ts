import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import {
  methodFilter,
  checkUserToken,
  dbConnection,
  dbConnectionClose,
  errorHandler,
  loadUser,
} from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'

const postmark = require('postmark')

const client = new postmark.ServerClient('34072dd1-b9cc-481d-9726-88af944744d0')

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'saveCfdiDraft.errors.invalidUser' })

export const routeHandler = async (
  req: NextApiRequest & { dbService: DbService; loggedUser: User },
  res: NextApiResponse,
  next: Function
) => {
  const { body, dbService, loggedUser }: { body: any; dbService: DbService; loggedUser: User } = req
  const { templateModel, preferedLanguage, emailToSend } = body
  if (!templateModel) return next(new RequestError(400, 'saveNewPlace.errors.noData'))
  // console.log('templateModel in api:', templateModel, 'preferedLanguage', preferedLanguage, 'loggedUser in api', loggedUser, 'emailToSend', emailToSend)

  const finalTemplateModel = { ...templateModel, userName: loggedUser.username }

  client.sendEmailWithTemplate({
    From: 'taskility@taskility.com',
    To: emailToSend,
    TemplateAlias: `bill-of-lading-hub-invite-${preferedLanguage}`,
    TemplateModel: finalTemplateModel,
  })
  // const { _id } = await dbService.saveNewBoLH(BoLH, loggedUser._id, loggedUser.profile?.companyId, loggedUser)
  // console.log('BoLH _id in api:', _id)
  res.json({ ok: true })
  return next()
}

export default composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: false }), routeHandler],
  errorHandler,
  dbConnectionClose
)

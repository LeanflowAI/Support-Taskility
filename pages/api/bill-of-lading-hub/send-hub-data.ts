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
  const { templateModel, hubState } = body
  if (!templateModel) return next(new RequestError(400, 'saveNewPlace.errors.noData'))
  // console.log('templateModel in api:', templateModel, 'loggedUser in api', loggedUser)

  const templates = hubState.share.users.map((user: { email: string; preferedLanguage: string; notify: boolean }) => {
    if (user.notify) {
      const finalTemplateModel = { ...templateModel, userName: loggedUser.username }
      // if (user.preferedLanguage === 'es' && templateModel.action === 'completed') {
      //   finalTemplateModel = { ...finalTemplateModel, action: 'completó' }
      // }
      // if (user.preferedLanguage === 'es' && templateModel.action === 'opened to edit') {
      //   finalTemplateModel = { ...finalTemplateModel, action: 'abrió para edición' }
      // }
      // console.log('finalTemplateModel.hubData', finalTemplateModel.hubData)
      return {
        From: 'taskility@taskility.com',
        To: user.email,
        TemplateAlias: `bill-of-lading-hub-data-${user.preferedLanguage}`,
        TemplateModel: finalTemplateModel,
      }
    }
    return {}
  })
  // console.log('templates', templates)
  client.sendEmailBatchWithTemplates(templates)

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

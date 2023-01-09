import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { createEmailSender } from 'services/emailService'
import { NextApiRequest, NextApiResponse } from 'next'
import { DbService } from 'services/model'

// TODO: Test this route
export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { email } = req.body
  if (!email) return next(new RequestError(400, 'accountRecovery.errors.missingData'))

  const { dbService } = req
  const user = await dbService.getUserByEmail(email)
  if (!user) return next(new RequestError(401, 'accountRecovery.errors.userNotFound'))

  const recoveryToken = await dbService.createAccountRecoveryToken({ email })
  if (!recoveryToken) return next(new RequestError(401, 'accountRecovery.errors.unexpected'))

  const recoveryLink = `${req.headers.origin}/password-change/${recoveryToken}`
  const recoveryEmailData = { to: email, templateModel: { username: user.username, email, recoveryLink } }
  const templateAlias = 'user-account-recovery'
  // process.env.ACCOUNT_RECOVERY_EMAIL_TEMPLATE_ID
  const sendRecoveryEmail = createEmailSender({ templateAlias })
  const { SubmittedAt: submittedAt, MessageID: messageId } = await sendRecoveryEmail(recoveryEmailData)
  await dbService.saveRecoveryEmailData({ username: user.username, submittedAt, messageId })

  res.json({ message: 'accountRecovery.messages.success' })
  return next()
}

export default composeRoute([methodFilter('post'), dbConnection, routeHandler], errorHandler, dbConnectionClose)

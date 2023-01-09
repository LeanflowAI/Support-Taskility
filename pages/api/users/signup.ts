import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { createEmailSender } from 'services/emailService'
import { NextApiRequest, NextApiResponse } from 'next'
import { DbService } from 'services/model'

// TODO: Test route
export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) return next(new RequestError(400, 'signup.errors.missingData'))

  const { dbService } = req
  const userByEmail = await dbService.getUserByEmail(email)
  if (userByEmail) return next(new RequestError(401, 'signup.errors.emailAlreadyUsed'))

  const userByUsername = await dbService.getUserByUsername(username)
  if (userByUsername) return next(new RequestError(401, 'signup.errors.usernameAlreadyUsed'))

  const verificationToken = await dbService.createUser({ username, email, password })
  const appUrl = req.headers.origin || req.headers.host
  // TODO: Check also that appUrl actually matches the app domain name
  if (!appUrl) return next(new RequestError(500, 'signup.errors.unexpected'))

  const verificationLink = `${appUrl}/verify-email/${verificationToken}`
  const activationEmailData = { to: email, templateModel: { username, email, verificationLink } }
  const templateAlias = 'user-account-created-and-email-verification-link' 
  // process.env.ACCOUNT_VERIFICATION_EMAIL_TEMPLATE_ALIAS
  const sendActivationEmail = createEmailSender({ templateAlias })
  const emailResult = await sendActivationEmail(activationEmailData)
  const { SubmittedAt: submittedAt, MessageID: messageId } = emailResult
  await dbService.saveActivationEmailData({ username, submittedAt, messageId })

  res.json({ message: 'signup.messages.success' })
  return next()
}

export default composeRoute([methodFilter('post'), dbConnection, routeHandler], errorHandler, dbConnectionClose)

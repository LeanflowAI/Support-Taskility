import { ServerClient } from 'postmark'
import { getNewId } from '../helpers/server'
import { log } from '../logs'

export const createEmailService = ({ apiKey, fromEmail }) => ({
  /**
   * Create a function to send emails using the specified email template.
   * @param {string} emailTemplateAlias Postmark email template Id
   * @returns {Function} Return a function to send "emailData"
   */
  sendEmailTemplate(emailTemplateAlias) {
    return emailData => {
      const { to, templateModel = {}, attachments = [], replyTo = '' } = emailData
      // console.log('template Alias Postmark', emailTemplateAlias)

      const email = {
        From: fromEmail,
        To: to,
        ReplyTo: replyTo,
        TemplateAlias: emailTemplateAlias,
        TemplateModel: templateModel,
        Attachments: attachments,
      }

      if (process.env.NODE_ENV === 'production') {
        const client = new ServerClient(apiKey)
        return client.sendEmailWithTemplate(email)
      }

      log('info', '******* DEVELOPMENT EMAIL SENT ********')
      log('info', email)
      // appLogs.message({ message: '******* DEVELOPMENT EMAIL SENT ********' });
      // appLogs.debug({ message: email });
      const fakeResponse = {
        To: emailData.to,
        SubmittedAt: new Date(),
        MessageID: getNewId(),
        ErrorCode: 0,
        Message: 'OK',
      }
      return new Promise(resolve => setTimeout(() => resolve(fakeResponse), 1000))
    }
  },
})

export const createEmailSender = ({ templateAlias }) => {
  const apiKey = process.env.POSTMARK_API_KEY_LEANFLOW
  // console.log('apiKey Postmark', apiKey)
  const fromEmail = process.env.FROM_EMAIL
  const emailService = createEmailService({ apiKey, fromEmail })
  return emailService.sendEmailTemplate(templateAlias)
}

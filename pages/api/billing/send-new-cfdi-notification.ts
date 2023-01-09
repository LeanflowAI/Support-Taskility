import { NextApiRequest, NextApiResponse } from 'next'
import { DbService, Cfdi, EmailMessage } from 'services/model'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { createEmailService } from 'services/emailService'
import { numberFormat } from 'services/helpers/mathHelp'
import { log } from 'services/logs'

const buildNewInvoiceEmailTitle = (titleTemplate: string, cfdi: Cfdi, serviceReferences: string) => {
  const fieldValues: { [index: string]: string } = {
    '#folio': cfdi.folio.toString(),
    '#referencia': serviceReferences,
    '#emisor': cfdi.issuer.name,
    '#cliente': cfdi.receiver.name,
    // TODO: Remove #referenciacliente from the options on the title template editor on business relationship.
    // '#referenciacliente': order.orderClientReference || '-',
    '#total': `${numberFormat(cfdi.total)} ${cfdi.shortCurrency} `,
  }
  const replaceWord = (word: string) =>
    word[0] === '#' && word.length > 1 && Object.keys(fieldValues).includes(word) ? fieldValues[word] : word
  return titleTemplate.split(' ').map(replaceWord).join(' ')
}

const createEmailsData = async (dbService: DbService, cfdi: Cfdi) => {
  const { issuer, receiver, relatedServices } = cfdi
  const relation = await dbService.getServiceRelationship(issuer.id, receiver.id)
  if (!relation || !relation.peopleList || !cfdi.pdfDocumentId) return []

  const pdfDocument = await dbService.getAttachedFileById(cfdi.pdfDocumentId)
  if (!pdfDocument) return []

  // TODO: Rename "newInvoiceEmailTitle" to "newCfdiEmailTitle"
  const { sendNewInvoiceEmailsLang = 'es', newInvoiceEmailTitle = `Nueva factura ${cfdi.folio}` } = relation
  const serviceReferences = relatedServices ? relatedServices?.map(({ reference }) => reference).join(', ') : ''
  return relation.peopleList
    .filter(({ sendInvoices }) => sendInvoices)
    .map(user => ({
      to: user.email,
      replyTo: 'help@taskility.com',
      // attachments: createEmailAttachments(invoice, relation, order),
      templateModel: {
        emailSubject: buildNewInvoiceEmailTitle(newInvoiceEmailTitle, cfdi, serviceReferences),
        headText: sendNewInvoiceEmailsLang === 'es' ? `Nuevo CFDI` : `New CFDI`,
        greeting: sendNewInvoiceEmailsLang === 'es' ? 'Buen día' : 'Hi,',
        receiverName: user.name,
        companyName: issuer.name,
        cfdiType: cfdi.cfdiType, // TODO: i18n
        orderReference: serviceReferences,
        cfdiLink: pdfDocument.url,
        cfdiNumber: cfdi.folio,
        year: new Date().getFullYear(),
      },
    }))
}

const createSentEmailData = ({ email, response }: { email: any; response: any }): EmailMessage => ({
  createdAt: new Date(),
  messageId: response.MessageID,
  emailStatus: 'sent',
  to: response.To,
  submittedAt: response.SubmittedAt,
  attachments: email.attachments.map(({ Name, Content }: { Name: string; Content: string }) => ({
    name: Name,
    size: Content.length,
  })),
})

const createNotificationEmailSender = async (dbService: DbService, companyId: string, clientId: string) => {
  const relation = await dbService.getServiceRelationship(companyId, clientId)
  if (!relation?.peopleList || !relation?.sendNewInvoiceEmails) return null
  const { sendNewInvoiceEmailsLang = 'es' } = relation
  const fromEmail = process.env.FROM_EMAIL
  const apiKey = process.env.POSTMARK_API_KEY
  if (!fromEmail || !apiKey) return null

  // TODO: MOVE TO ENVIRONMENT VARIABLES
  // TODO: VERIFICAR QUE SE USE LA CONEXION DE POSTMARK CON EL SERVIDOR DE "TASKILITY" NO EL DE "LEANFLOW"
  const newCfdiEmailTemplateIds = { es: '19440312', en: '19435075' }
  const emailService = createEmailService({ apiKey, fromEmail })
  if (!newCfdiEmailTemplateIds[sendNewInvoiceEmailsLang]) return null
  return emailService.sendEmailTemplate(newCfdiEmailTemplateIds[sendNewInvoiceEmailsLang])
}

/**
 * Send emails with newly created cfdis to the users configured to receive
 * them in the business relationship settings.
 */
const notifyCfdiCreation = async (dbService: DbService, cfdiId: string): Promise<{ ok: boolean; message: string }> => {
  // TODO: Review required for this attachments. Email created by Cfdi, not shipment order.
  // const createEmailAttachments = (invoice, relation, order) => {
  //   const attachments = []
  //   const { invoiceDocuments = {} } = relation
  //   const selectedInvoiceDocuments = R.keys(R.filter(R.equals(true), invoiceDocuments))

  //   if (selectedInvoiceDocuments.includes('invoice')) {
  //     const pdfData = Meteor.call('invoice.loadPdf', invoice._id)
  //     const base64PdfString = pdfData.split(',')[1]
  //     attachments.push({
  //       Name: `factura ${invoice.Folio}.pdf`,
  //       Content: base64PdfString,
  //       ContentType: 'application/octet-stream',
  //     })
  //   }

  //   if (selectedInvoiceDocuments.includes('invoiceXML')) {
  //     const xmlData = Meteor.call('invoice.loadXml', invoice._id)
  //     const base64XmlString = xmlData.split(',')[1]
  //     attachments.push({
  //       Name: `factura ${invoice.Folio}.xml`,
  //       Content: base64XmlString,
  //       ContentType: 'application/octet-stream',
  //     })
  //   }

  //   if (order.documents) {
  //     const documentsToAttach = order.documents
  //       .filter(document => !['invoice', 'invoiceXML'].includes(document.documentType))
  //       .filter(document => selectedInvoiceDocuments.includes(document.documentType))
  //       .map(({ id }) => OrderDocuments.findOne(id))
  //       .filter(Boolean)
  //       .map(doc => {
  //         const methodName = 'orderDocuments.getBase64String'
  //         const base64String = Meteor.call(methodName, doc._id)
  //         return { ...doc, base64String }
  //       })
  //       .filter(({ base64String }) => Boolean(base64String))
  //       .map(({ original, documentType, base64String }) => ({
  //         Name: `${documentType} - ${original.name}`,
  //         Content: base64String,
  //         ContentType: original.type,
  //       }))
  //     attachments.push(...documentsToAttach)
  //   }
  //   return attachments
  // }

  try {
    const cfdi = await dbService.getCfdi(cfdiId)
    if (!cfdi) return { ok: false, message: 'notifyCfdiCreation.errors.cfdiNotFound' }
    if (cfdi.deliveryStatus === 'sending') return { ok: false, message: 'notifyCfdiCreation.errors.notificationAlreadyStarted' }
    const sendInvoiceEmail = await createNotificationEmailSender(dbService, cfdi.issuer.id, cfdi.receiver.id)
    if (!sendInvoiceEmail) {
      await dbService.setCfdiDeliveryStatus(cfdiId, 'missing-config')
      return { ok: true, message: 'notifyCfdiCreation.messages.missingConfig' }
    }
    await dbService.setCfdiDeliveryStatus(cfdiId, 'sending') // set status to prevent multiple executions
    const emailsData = await createEmailsData(dbService, cfdi)
    if (!emailsData.length) {
      await dbService.setCfdiDeliveryStatus(cfdiId, 'no-recipients')
      return { ok: true, message: 'notifyCfdiCreation.messages.noRecipients' }
    }
    const sentEmails = await Promise.all(emailsData.map(async (email: any) => ({ email, response: await sendInvoiceEmail(email) })))
    // Save details of emails sent to notify invoice creation
    const sentEmailsIds = await Promise.all(
      sentEmails.map(createSentEmailData).map(async sentEmailToSave => dbService.saveEmailMessage(sentEmailToSave))
    )
    await dbService.addCfdiDeliveryEmails(cfdiId, sentEmailsIds.filter(Boolean) as Array<string>)
    await dbService.setCfdiDeliveryStatus(cfdiId, 'sent')
    return { ok: true, message: 'notifyCfdiCreation.messages.notificationsSent' }
  } catch (error) {
    await dbService.setCfdiDeliveryStatus(cfdiId, 'error')
    if (error instanceof Error) {
      log('error', error.message)
    }
    return { ok: false, message: 'notifyCfdiCreation.errors.unexpectedError' }
  }
}

type Request = NextApiRequest & { dbService: DbService; cfdiId?: string }

// TODO: Check that the request comes from Atlas trigger
// const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'getCfdiXml.errors.invalidUser' })
export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService, cfdiId: reqCfdiId } = req
  const { cfdiId: bodyCfdiId } = body
  const cfdiId = bodyCfdiId || reqCfdiId

  const { ok, message } = await notifyCfdiCreation(dbService, cfdiId)
  if (!ok) return next(new RequestError(400, message))

  res.json({ ok, message })
  return next()
}

export default composeRoute([methodFilter('post'), dbConnection, routeHandler], errorHandler, dbConnectionClose)

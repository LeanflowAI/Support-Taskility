import { parseString } from 'xml2js'
import { composeRoute, RequestError } from '../helpers'
import { methodFilter, checkUserToken, dbConnection, loadUser, dbConnectionClose, errorHandler } from '../helpers/middlewares'

// TODO: Add jsdoc to all the project
/**
 * Parse the content of an XML file and return it as an object.
 * @param xmlString String containing the content of an XML file
 * @returns {Promise<any>} Resolves with the parsed object.
 */
const xmlToJson = xmlString =>
  new Promise(resolve => parseString(xmlString, (error, jsonData) => resolve(!error ? { data: jsonData } : { error })))
// TODO: Move xmlToJson to helpers.

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

export const routeHandler = async (req, res, next) => {
  const { body, dbService, loggedUser } = req
  const { xmlString, orderReference } = body

  const { data: invoiceXmlAsJson, error } = await xmlToJson(xmlString)
  // TODO: i18n -> Error al convertir el contenido XML.
  if (error) return next(new RequestError(400, 'loadExternalXmlInvoice.errors.cantReadXmlContent'))

  await dbService.saveExternalInvoice({ invoiceXmlAsJson, orderReference, user: loggedUser })
  res.status(200).json({ ok: true })
  return next()
}

export const route = composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser(), routeHandler],
  errorHandler,
  dbConnectionClose
)

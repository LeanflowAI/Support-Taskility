const { Translate } = require('@google-cloud/translate')
const dialogflow = require('dialogflow').v2beta1

const projectId = process.env.DF_PROJECT_ID
const keyPath = process.env.DF_SERVICE_ACCOUNT_PATH
const translateApiKeyPath = process.env.GOOGLE_TRANSLATE_API_KEY

/**
 * Detect the language from a given text
 * @param {string} text
 */
const detectTextLanguage = async text => {
  const translate = new Translate({ key: translateApiKeyPath })

  let [detections] = await translate.detect(text)
  detections = Array.isArray(detections) ? detections : [detections]
  if (detections) {
    return detections[0].language
  }
  // Fallback language
  return 'en'
}

/**
 * Send a query to the dialogflow agent, and return the query result.
 * @param {string} sessionId
 * @param {string} text
 * @param {string} languageCode
 */
const sendTextUtterance = async (sessionId, text, languageCode) => {
  // Create a new session
  const sessionClient = new dialogflow.SessionsClient({ keyFilename: keyPath })
  const sessionPath = sessionClient.sessionPath(projectId, sessionId)
  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: { text: { text, languageCode } },
  }
  // TODO: Review https://cloud.google.com/dialogflow-enterprise/docs/reference/rest/v2beta1/QueryParameters
  //  to pass user credentials to fulfillment webhook.
  // Send text and return response
  const responses = await sessionClient.detectIntent(request)
  const result = responses[0].queryResult
  return result.fulfillmentText
}

module.exports = {
  detectTextLanguage,
  sendTextUtterance,
}

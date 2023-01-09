import R from 'ramda'
import { get, post, del } from '../../fetch'
import { log } from '../../logs'

// TODO: 
// TODO: Testing this API
// TODO: Replace credentials by administrative app settings
const billingApiUrl = process.env.BILLING_API_URL
const username = process.env.BILLING_API_USERNAME
const password = process.env.BILLING_API_PASSWORD
const apiCredentials = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`

const getMethod = url =>
  get(url, {
    headers: {
      Accept: 'application/json, application/xml, text/plain, text/html, *.*',
      Authorization: apiCredentials,
    },
  })

const postMethod = (url, body) =>
  post(url, {
    body,
    headers: { 'content-type': 'application/json', Accept: 'application/json', Authorization: apiCredentials },
  })

const deleteMethod = url =>
  del(url, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Accept: 'application/json, application/xml, text/plain, text/html, *.*',
      Authorization: apiCredentials,
    },
  })

// ModelState (api error schema) example. Format to get a single string.
// {
//   'cfdiToCreate.Receiver.Rfc': ['El RFC no cumple con el formato correcto'],
//   'cfdiToCreate.Receiver.CfdiUse': [
//     'El Uso del Cfdi debe corresponder con el tipo de persona (fisica o moral)',
//   ],
// }
const formatErrorDetails = R.pipe(R.values, R.flatten, R.join('\n '))

const handleBillingApiCall = async apiCallPromise => {
  try {
    return { data: await apiCallPromise }
  } catch (error) {
    const { Message, ModelState = {} } = error.details || {}
    const errorDetails = `${Message} ${formatErrorDetails(ModelState)}`
    log('error', Message ? errorDetails : error)
    return { error: Message ? errorDetails : 'billingApi.errors.accessError' }
  }
}

export const facturamaApi = {
  addCsd(csdData) {
    return handleBillingApiCall(postMethod(`${billingApiUrl}/api-lite/csds`, csdData))
  },
  getCsd(rfc) {
    return handleBillingApiCall(getMethod(`${billingApiUrl}/api-lite/csds/${rfc}`))
  },
  deleteCsd(rfc) {
    return handleBillingApiCall(deleteMethod(`${billingApiUrl}/api-lite/csds/${rfc}`))
  },
  // URL to stamp CFDI in version 3.3
  addCfdi(invoiceData) {
    return handleBillingApiCall(postMethod(`${billingApiUrl}/api-lite/2/cfdis`, invoiceData))
  },
  // URL to stamp CFDI in version 4.0
  addCfdi4(invoiceData) {
    return handleBillingApiCall(postMethod(`${billingApiUrl}/api-lite/3/cfdis`, invoiceData))
  },
  cancelCfdi(cfdiApiId) {
    return handleBillingApiCall(deleteMethod(`${billingApiUrl}/api-lite/cfdis/${cfdiApiId}`))
  },
  getCfdiXml(cfdiApiId) {
    return handleBillingApiCall(getMethod(`${billingApiUrl}/api/Cfdi/xml/issuedLite/${cfdiApiId}`))
  },
  apiCredentialsTest() {
    return handleBillingApiCall(postMethod(`${billingApiUrl}/api/cfdi`))
  },
}
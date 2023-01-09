// TODO: This require is failing in production. Can't find "require" dependency and seems to be related to missing typescript types for
// transloadit library. Import it directly from node_modules make it work by now.

import { log } from '../logs/index'
// 'services/logs/index.js'
// import TransloaditClient from '../../node_modules/transloadit/src/Transloadit'
const TransloaditClient = require('transloadit')

const createAssembly = options => {
  const transloadit = new TransloaditClient({ authKey: process.env.TRANSLOADIT_KEY, authSecret: process.env.TRANSLOADIT_SECRET })
  return new Promise((resolve, reject) => {
    transloadit.createAssembly(options, (err, result) => {
      if (err) {
        log('error', err)
        reject(err)
      }
      resolve(result)
    })
  })
}

/**
 * Request a PDF generation to transloadit API.
 * URL of the generated PDF will be received on "notifyUrl" route.
 * @param { url } string url to print as PDF
 * @param { notifyUrl } string url that will receive the notification of the finished process.
 */
export async function createPdfFromUrl(url, notifyUrl, additionalParams = {}) {
  // TODO: MOVE TEMPLATE ID TO ENVIRONMENT VARIABLES AND PREVENT CALLS TO TRANSLOADIT API ON DEVELOPMENT
  const options = {
    params: { template_id: 'a3d507ceb29748a894520fd13b7a603e', steps: { buildPdf: { url } }, notify_url: notifyUrl, ...additionalParams },
  }
  await createAssembly(options)
}

/**
 * Request a PDF generation to transloadit API.
 * URL of the generated PDF will be received on "notifyUrl" route.
 * @param { url } string url to print as PDF
 * @param { notifyUrl } string url that will receive the notification of the finished process.
 */
 export async function uploadFiletoGCP(files, additionalSteps = {}, notifyUrl, additionalParams = {}) {
  // TODO: MOVE TEMPLATE ID TO ENVIRONMENT VARIABLES AND PREVENT CALLS TO TRANSLOADIT API ON DEVELOPMENT
  const options = {
    params: { template_id: 'ab8c3e13a9374d72b1dc2dd55980df10', files: files, steps: { ...additionalSteps }, notify_url: notifyUrl,  ...additionalParams },
  }
  await createAssembly(options)
}

/**
 * Request a PDF generation to transloadit API.
 * URL of the generated PDF will be received on "notifyUrl" route.
 * @param { url } string url to print as PDF
 * @param { notifyUrl } string url that will receive the notification of the finished process.
 */
 export async function uploadProfilePhototoGCP(files, additionalSteps = {}, notifyUrl, additionalParams = {}) {
  // TODO: MOVE TEMPLATE ID TO ENVIRONMENT VARIABLES AND PREVENT CALLS TO TRANSLOADIT API ON DEVELOPMENT
  const options = {
    params: { template_id: '9ec4d8fd8a3f4692b552c49b87bced26', files: files, steps: { ...additionalSteps }, notify_url: notifyUrl,  ...additionalParams },
  }
  await createAssembly(options)
}

/**
 * Request a PDF generation to transloadit API.
 * URL of the generated PDF will be received on "notifyUrl" route.
 * @param { url } string url to print as PDF
 * @param { notifyUrl } string url that will receive the notification of the finished process.
 */
 export async function uploadCompanyLogotoGCP(files, additionalSteps = {}, notifyUrl, additionalParams = {}) {
  // TODO: MOVE TEMPLATE ID TO ENVIRONMENT VARIABLES AND PREVENT CALLS TO TRANSLOADIT API ON DEVELOPMENT
  const options = {
    params: { template_id: '8500314b98784d78b3d5601d600b7e72', files: files, steps: { ...additionalSteps }, notify_url: notifyUrl,  ...additionalParams },
  }
  await createAssembly(options)
}

/**
 * Request a PDF generation to transloadit API.
 * URL of the generated PDF will be received on "notifyUrl" route.
 * @param { url } string url to print as PDF
 * @param { notifyUrl } string url that will receive the notification of the finished process.
 */
 export async function makeFileThumbnail(files, additionalSteps = {}, notifyUrl, additionalParams = {}) {
  // TODO: MOVE TEMPLATE ID TO ENVIRONMENT VARIABLES AND PREVENT CALLS TO TRANSLOADIT API ON DEVELOPMENT
  const options = {
    params: { template_id: '96c3283ed4464f2792fce0b70e235603', files: files, steps: { ...additionalSteps }, notify_url: notifyUrl,  ...additionalParams },
  }
  await createAssembly(options)
}
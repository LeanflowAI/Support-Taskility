import { ObjectId } from 'mongodb'

/**
 * @returns {string} Random ID generated using MongoDB ObjectId
 */
export const getNewId = () => ObjectId().toString()

export const base64Encode = textToEncode => Buffer.from(textToEncode).toString('base64')

import fetch from 'node-fetch'
import { RequestError } from '../api/helpers'
import { log } from '../logs'

export const get = async (url, { headers = {} } = {}) => {
  log('verbose', `get ${url}`)
  const options = { method: 'get', headers }
  const res = await fetch(url, options)
  if (res.ok) return res.json()
  throw new RequestError(res.status, res.statusText)
}

export const post = async (url, { body = {}, headers = { 'Content-Type': 'application/json' } } = {}) => {
  log('verbose', `post ${url}`)
  const options = { method: 'post', body: JSON.stringify(body), headers }
  const res = await fetch(url, options)
  let data
  try {
    data = await res.json()
  } catch (e) {
    data = {}
  }
  if (res.ok) {
    console.log('OK status', res.status)
    return data
  }
  console.log('Error status', res.status)
  throw new RequestError(res.status, res.statusText, data)
}

export const del = async (url, { body = {}, headers = { 'Content-Type': 'application/json' } } = {}) => {
  const options = { method: 'delete', body: JSON.stringify(body), headers }
  const res = await fetch(url, options)
  if (res.ok) return res.json()
  throw new RequestError(res.status, res.statusText)
}

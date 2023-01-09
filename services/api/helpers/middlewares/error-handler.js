import { log } from '../../../logs'

// TODO: Test
// TODO: Implement app logging and log every error.
// (Add a third party logging system? Sentry or something similar?)
// Error realtime notifications to slack, MS teams, or other... Use winston!
export const errorHandler = (err, res, next) => {
  log('error', err.message)
  if (err.name === 'RequestError') {
    res.status(200).json(JSON.stringify({ error: err.message, statusCode: err.statusCode, details: err.details }))
  } else {
    res.status(500).json(JSON.stringify({ error: 'errors.unexpected' }))
  }
  next()
}

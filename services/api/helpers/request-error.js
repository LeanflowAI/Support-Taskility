export function RequestError(statusCode = 400, message = 'errors.unexpected', details) {
  this.statusCode = statusCode
  this.message = message
  this.details = details
  this.name = 'RequestError'
  this.stack = new Error().stack
}

RequestError.prototype = Object.create(Error.prototype)
RequestError.prototype.constructor = RequestError

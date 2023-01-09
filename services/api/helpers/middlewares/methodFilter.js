import { RequestError } from '../request-error'

// TODO: Tests
/**
 * @param {string | string[] | undefined} allowedMethods Allowed HTTP methods for the route
 */
export const methodFilter = (allowedMethods = ['GET', 'POST']) => async (req, res, next) => {
  const methods = typeof allowedMethods === 'string' ? [allowedMethods] : allowedMethods
  const isAllowedMethod = methods.some(method => method.toLowerCase() === req.method.toLowerCase())
  if (!isAllowedMethod) return next(new RequestError(405, 'errors.methodNotAllowed'))
  return next()
}

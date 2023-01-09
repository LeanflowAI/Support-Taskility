import { RequestError } from '../request-error'

export const loadUser = ({ isRequired = true } = {}) => async (req, res, next) => {
  const { dbService, userId } = req

  if (!dbService) return next(new RequestError(401, `errors.databaseConnectionRequired`))
  if (isRequired && !userId) return next(new RequestError(401, `errors.userNotFound`))
  req.loggedUser = await dbService.getUserById(userId)
  if (isRequired && !req.loggedUser) return next(new RequestError(401, `errors.userNotFound`))
  return next()
}

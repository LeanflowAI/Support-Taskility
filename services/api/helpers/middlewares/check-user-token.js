import { verifyToken } from '../../../crypto'
import { RequestError } from '../request-error'

// TODO: Test
export const checkUserToken = ({ errorMessage }) => (req, _, next) => {
  // TODO: Check content of req.cookies.io
  const { token } = req.cookies
  const { decoded: decodedToken, error } = verifyToken(token)
  // const { id, email, iat, exp, aud, iss } = decodedToken
  if (error) return next(new RequestError(400, errorMessage))
  const { id, email } = decodedToken

  req.token = token
  req.decodedToken = decodedToken
  req.userId = id
  req.userEmail = email
  return next()
}

export default checkUserToken

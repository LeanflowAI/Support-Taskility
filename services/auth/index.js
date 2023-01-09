import { verifyToken } from '../crypto'

// TODO: Refactor for use with "micro". Add to api/ routes
//  Merge with redirectIfNotLogged/redirectIfLogged???
export const jwtCheck = (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization) {
    res.status(401).send('No authentication token provided')
    return
  }

  const token = authorization.split(' ')[1]
  if (!token) {
    res.status(401).send('Invalid authentication header')
    return
  }

  const { decoded, error } = verifyToken(token)
  if (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(400).send('Invalid token expiration')
      return
    }
    res.status(401).send('Invalid credentials')
    return
  }

  const expiration = decoded.exp
  // Keep this validation, just in case the verification pass, but the token is already expired.
  // Compare as text because "expiration" have less precision than "Date.now()"
  if (String(Date.now()) > String(expiration)) {
    res.status(401).send('Expired token')
    return
  }

  // TODO: Set a remaining expiration time limit for token renewal:
  // i.e: if the expiration time is in under 30 minutes, issue a new token
  // if (expiration...) {

  // }

  req.decodedToken = decoded
  next()
}

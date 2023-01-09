import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute } from 'services/api/helpers'
import {
  methodFilter,
  checkUserToken,
  dbConnection,
  dbConnectionClose,
  errorHandler,
  loadUser,
} from 'services/api/helpers/middlewares'
import { DbService, User } from 'services/model'
import { geocode } from '../../../services/gps/geocoding'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; userId: string; loggedUser: User }

// TODO: Tests for this handler
export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService, loggedUser, query } = req
  const { address } = query
  // console.log(address)
  let geocodeData
  const key = 'AIzaSyDg6I_RT1J0OeRBjLrvub-8xXMLC9WvzUc'
  // const key = process.env.GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`
  await fetch(url)
    .then(response => response.json())
    .then(data => {
      geocodeData = data
      // console.log(`data:`)
      // console.log(data)
    })
  // console.log(`geocodeData:`)
  // console.log(geocodeData.results[0].address_components)
  // await dbService.deleteUser(user._id)
  res.json(geocodeData)
  // const eventDetails = { userId: user._id, username: user.username, userLastName: user.userLastName || null }
  // await dbService.addEventLog(dbService.eventLogTypes.userDelete, eventDetails, loggedUser)
  return next()
}

export default composeRoute(
  [methodFilter('get'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: true }), routeHandler],
  errorHandler,
  dbConnectionClose
)

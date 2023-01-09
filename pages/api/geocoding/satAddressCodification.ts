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
import { DbService, SatAddress, User } from 'services/model'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; userId: string; loggedUser: User }

// TODO: Tests for this handler
export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { body, dbService, loggedUser, query } = req
  // const { filters, searchText, skip } = body
  const { postalCode = "", countryCodeO } = query
  // console.log(`postalCode: ${postalCode}, countryCodeO: ${countryCodeO}`)

  // Get the Sat Codification from Database
  const result = await dbService
    .getPostalCodeDetails(postalCode as string, countryCodeO as string)
    // eslint-disable-next-line no-console
    .catch(e => console.log('Error: ', e.message))
  // console.log('result after dbService: ', result)
  if (result === 'No results found') {
    // Configure here the non MX addresses?
    return 'No results found'
  }
  const { stateCode, municipalityCode, localityCode, countryCode } = result
  const locality = localityCode ? await dbService.getLocality(localityCode, stateCode) : await dbService.getLocalitiesList(stateCode)
  const municipality = municipalityCode
    ? await dbService.getMunicipality(municipalityCode, stateCode)
    : await dbService.getMunicipalitiesList(stateCode)
  const state = stateCode
    // eslint-disable-next-line no-console
    ? await dbService.getState(stateCode, countryCode).catch(e => console.log('Error: ', e.message))
    // eslint-disable-next-line no-console
    : await dbService.getState(countryCode).catch(e => console.log('Error: ', e.message))
  const country = await dbService.getCountry(countryCode)
  const suburb = await dbService.getSuburbsList(postalCode)

  // Format address data to display in interface
  const satElementFormat = (element: any) => {
    const satElement = Array.isArray(element)
      ? element.map(e => {
          return { key: e._id, satCode: e.key, satDescription: e.satDescription }
        })
      : [{ key: element._id, satCode: element.key, satDescription: element.satDescription }]
    return satElement
  }

  const formattedSuburb = satElementFormat(suburb)
  const formattedLocality = satElementFormat(locality)
  const formattedMunicipality = satElementFormat(municipality)
  const formattedState = satElementFormat(state)
  const formattedCountry = satElementFormat(country)

  // Generate response
  const response: SatAddress = {
    suburb: formattedSuburb,
    // eslint-disable-next-line no-bitwise
    locality: formattedLocality,
    municipality: formattedMunicipality,
    state: formattedState,
    country: formattedCountry,
    postalCode: postalCode || "",
  }

  res.json(response)
  // res.json({ postalCode, countryCodeO, stateCode, municipalityCode, localityCode, countryCode })
  return next()
}

export default composeRoute(
  [methodFilter('get'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: true }), routeHandler],
  errorHandler,
  dbConnectionClose
)

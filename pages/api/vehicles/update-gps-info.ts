import R from 'ramda'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, dbConnection, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { getGpsApi } from 'services/gps/api'
import { NextApiRequest, NextApiResponse } from 'next'
import { Company, DbService } from 'services/model'

async function createVehicleFromApiData(dbService: DbService, company: Company, number: string, locationInfo: any) {
  const ownerRfc = R.path(['fullApiData', 'device_data', 'object_owner'], locationInfo)
  if (ownerRfc === company.rfc) {
    const vehicle = await dbService.getCompanyVehicle(company._id, number)
    if (!vehicle) await dbService.createCompanyVehicle(company._id, number)
  }
}

type ExternalApiGpsLocation = { number: string; locationInfo: any }

async function updateVehiclesGpsInfo(dbService: DbService, company: Company, providerId: string, locations: Array<ExternalApiGpsLocation>) {
  const updatePromises = locations.map(async ({ number, locationInfo }) => {
    await createVehicleFromApiData(dbService, company, number, locationInfo)
    await dbService.updateVehicleLocationInfo(number, company._id, providerId, locationInfo)
  })
  await Promise.all(updatePromises)
  const msg = `Datos de GPS de ${company.name} actualizados (${providerId})`
  return { message: msg }
}

async function updateCompanyVehiclesLocation(dbService: DbService, company: Company, providerId: string) {
  try {
    const api = await getGpsApi({ providerId, credentials: company.gpsApi[providerId], dbService })
    const locations: Array<ExternalApiGpsLocation> = await api.getVehiclesLocation()
    return updateVehiclesGpsInfo(dbService, company, providerId, locations)
  } catch (error) {
    // console.log(error)
    const companyProvider = `${company.name} - ${providerId}`
    const msg = `Error al consultar GPS de vehículos de ${companyProvider}`
    if (error instanceof Error) {
      return { error: msg, message: error.message, details: error }
    }
    return error
  }
}

// TODO: Write tests
export const routeHandler = async (req: NextApiRequest & { dbService: DbService }, res: NextApiResponse, next: Function) => {
  const { dbService } = req
  const companies = await dbService.getCompaniesWithGpsTracking()

  const updatesPromises = companies.flatMap(company => {
    return (
      Object.keys(company.gpsApi)
        // Exclude API credentials without a username
        .filter(providerName => company.gpsApi[providerName].username)
        .map(providerName => updateCompanyVehiclesLocation(dbService, company, providerName))
    )
  })

  await Promise.all(updatesPromises)

  res.json({ message: 'updateVehiclesGpsInfo.messages.success' })
  return next()
}

export default composeRoute([methodFilter('post'), dbConnection, routeHandler], errorHandler, dbConnectionClose)

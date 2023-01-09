import axios from 'axios'
import { inverseGeocode } from '../geocoding'

export function gpswox(params) {
  const { gpsApiProviderUrl, gpsApiUsername: username, gpsApiPassword: password, dbService } = params

  const getMethod = (endpoint, queryParams) =>
    axios
      .create({ headers: { 'Cache-Control': 'no-cache', Accept: 'application/json' } })
      .get(`https://${gpsApiProviderUrl}/api/${endpoint}`, { params: queryParams })

  const buildLocationDataFromApiItem = fullApiData => (geoCodeResult = {}) => {
    const { name: number, lat, lng, time } = fullApiData
    const { formatted_address: location } = geoCodeResult
    const dates = { activityDateTime: new Date(time), updatedAt: new Date() }
    return { number, locationInfo: { lat, lng, location, ...dates, gpsProviderId: 'gpswox', fullApiData } }
  }

  const getLocationDataFromApiItem = item =>
    inverseGeocode({ dbService, lat: item.lat, lng: item.lng }).then(buildLocationDataFromApiItem(item))

  const login = () =>
    getMethod('login', { email: username, password })
      .then(({ data: result }) => result)
      .then(({ error, user_api_hash: apiHash }) => {
        if (error) throw new Error(error)
        return apiHash
      })

  const getApiLocations = apiHash =>
    getMethod('get_devices', { lang: 'es', user_api_hash: apiHash }).then(({ data: result }) => {
      const { status, message } = result
      if (status || status === 0) throw new Error(message)
      return result.flatMap(({ items }) => items).filter(({ lat, lng }) => lat !== 0 && lng !== 0)
    })

  return {
    getVehiclesLocation: async () => {
      try {
        const apiHash = await login()
        const apiLocations = await getApiLocations(apiHash)
        return Promise.all(apiLocations.map(item => getLocationDataFromApiItem(item)))
      } catch (error) {
        // console.log(error)
        return []
      }
    },
  }
}

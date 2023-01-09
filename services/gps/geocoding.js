import axios from 'axios'

export const inverseGeocode = async ({ dbService, lat, lng }) => {
  // Search in InverseGeocodingCache collection and return only the first geocode result.
  const positionInfo = await dbService.getCachedPositionInfo(lat, lng)
  if (positionInfo) return Promise.resolve(positionInfo.result.results[0])

  // If no cache match, call API.
  const queryParams = { latlng: `${lat},${lng}`, key: process.env.GOOGLE_MAPS_API_KEY }
  return axios
    .create({ headers: { 'Cache-Control': 'no-cache', Accept: 'application/json' } })
    .get('https://maps.googleapis.com/maps/api/geocode/json', { params: queryParams })
    .then(({ data }) => {
      dbService.createCachedPositionInfo(lat, lng, data)
      return data.results[0]
    })
}

export const geocode = async ({ address }) => {
  // TODO: Search in GeocodingCache collection and return only the first geocode result.
  // const positionInfo = await dbService.getCachedPositionInfo(lat, lng)
  // if (positionInfo) return Promise.resolve(positionInfo.result.results[0])

  // If no cache match, call API.
  const queryParams = { address: address, key: process.env.GOOGLE_MAPS_API_KEY }
  return axios
    .create({ headers: { 'Cache-Control': 'no-cache', Accept: 'application/json' } })
    .get('https://maps.googleapis.com/maps/api/geocode/json', { params: queryParams })
    .then(({ data }) => {
      // dbService.createCachedPositionInfo(lat, lng, data)
      return data.results
    })
}

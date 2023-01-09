import { gpswox } from './providers/gpswox'
// import { navman } from './providers/navman'

const gpsProviderFactories = { leanflow: gpswox, /* navman, */ gpswox }

export const getGpsApi = ({ providerId, credentials, dbService }) => {
  const { url: gpsApiProviderUrl = 'tracking.leanflow.ai', username: gpsApiUsername, password: gpsApiPassword } = credentials
  return new Promise((resolve, reject) => {
    const factory = gpsProviderFactories[providerId]
    if (factory && typeof factory === 'function') return resolve(factory({ gpsApiProviderUrl, gpsApiUsername, gpsApiPassword, dbService }))
    return reject(new Error('Proveedor de GPS inválido...'))
  })
}

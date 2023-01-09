import { appDbService } from '../../../db'
import { RequestError } from '../request-error'
import { getMongoDbConnection } from '../../../db/getMongoDbConnection'

export async function dbConnection(req, _, next) {
  console.log('dbConnection reached')
  try {
    console.log('dbConection reached inside the try')
    const { client, db, close } = await getMongoDbConnection()
    console.log("conection was stablished")
    req.dbClient = client
    req.db = db
    req.dbClose = close
    req.dbService = appDbService(req.db)
    return next()
  } catch (error) {
    return next(new RequestError(500, 'errors.databaseConnection', error))
  }
}

export async function dbConnectionClose(req, _, next) {
  const { dbClose = () => {} } = req
  await dbClose()
  console.log("conection was closed")
  return next()
}

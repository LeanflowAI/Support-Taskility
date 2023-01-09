import { getMongoDbConnection } from './getMongoDbConnection'
import { appDbService } from '.'
import { DbService, User, UserType } from '../model'
import { Db } from 'mongodb'
import { SHA256 } from '../crypto'

describe('event logs', () => {
  let db: Db
  let close: Function
  let dbService: DbService

  beforeEach(async () => {
    const { db: testDb, close: testClose } = await getMongoDbConnection()
    db = testDb
    close = testClose
    dbService = appDbService(db)
  })

  afterAll(async () => {
    await close()
  })

  test('add a log correctly', async () => {
    const fakeUser: User = { _id: 'user', username: 'username', profile: { userType: 'client' as UserType } }
    await db.collection('eventLogs').deleteMany({})

    await dbService.addEventLog(dbService.eventLogTypes.createCfdi, { id: '123', folio: '0001' }, fakeUser)

    const count = await db.collection('eventLogs').countDocuments()
    expect(count).toBe(1)
    const { hash, ...createdLog } = await db.collection('eventLogs').findOne({})

    const expectedHash = SHA256(JSON.stringify({ ...createdLog, hash: '', previousHash: SHA256(JSON.stringify({})) }))
    expect(hash).toBe(expectedHash)
  })
})

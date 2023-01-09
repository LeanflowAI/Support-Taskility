import { getMongoDbConnection } from '../../../db/getMongoDbConnection'
import { loadUser } from './loadUser'
import { appDbService } from '../../../db'

const mockRes = () => ({
  headers: {},
  writeValue: '',
  jsonValue: {},
  setHeader(name, value) {
    this.headers = { ...this.headers, [name]: value }
  },
  status(value) {
    this.status = value
    return this
  },
  write(value) {
    this.writeValue = value
  },
  end() {},
  json(value) {
    try {
      this.jsonValue = JSON.parse(value)
    } catch (e) {
      this.jsonValue = value
    }
  },
})

describe('Load user from database middleware', () => {
  let db
  let close
  let dbService
  const fakeUser = { _id: 'fakeuserid', username: 'fake user' }

  beforeAll(async () => {
    const { db: testDb, close: testClose } = await getMongoDbConnection()
    db = testDb
    close = testClose
    dbService = appDbService(db)
    await db.collection('users').deleteMany({})
    await db.collection('users').insertOne(fakeUser)
  })

  afterAll(async () => {
    await close()
  })

  const loadLoggedUser = loadUser()

  test('fail without a database connection', async () => {
    const req = { method: 'POST', userId: 'fakeuserid', dbService: null }
    const res = mockRes()
    const err = await loadLoggedUser(req, res, e => e)
    expect(err.message).toBe('errors.databaseConnectionRequired')
  })

  test('error on request without a userId', async () => {
    const req = { method: 'POST', userId: undefined, dbService }
    const res = mockRes()
    const err = await loadLoggedUser(req, res, e => e)
    expect(err.message).toBe('errors.userNotFound')
  })

  test('return the requested user', async () => {
    const req = { method: 'POST', userId: 'fakeuserid', dbService }
    const res = mockRes()
    const err = await loadLoggedUser(req, res, e => e)
    expect(req.loggedUser).toEqual(fakeUser)
    expect(err).toBe(undefined)
  })

  // TODO: Test optional loading (with {isRequired= false})
})

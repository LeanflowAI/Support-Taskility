import { routeHandler as loadExternalInvoiceXml } from './load-external-invoice-xml'
import { getMongoDbConnection } from '../../db/getMongoDbConnection'
import { appDbService } from '../../db'

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

describe('load external invoice xml', () => {
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
    await db.collection('companies').deleteMany({})
    await db.collection('companies').insertMany([
      { fiscalRegime: '601', rfc: 'ATR150824MU1', name: 'A1A Trucking SA de CV' },
      { rfc: 'ATC100618FF2', name: 'KALTEX LOGISTICS S.A. DE C.V.' },
    ])
  })

  afterAll(async () => {
    await close()
  })

  test('error on empty xmlString', async () => {
    const req = { method: 'POST', body: {}, dbService }
    const res = mockRes()
    const err = await loadExternalInvoiceXml(req, res, e => e)
    expect(err.message).toBe('loadExternalXmlInvoice.errors.cantReadXmlContent')
  })

  // TODO: Test the invoice load linked to a shipment order
  // TODO: Test xml with taxes
  // TODO: Test the invoice load with duplicated "folio" (error)
  // TODO: Test the invoice load with duplicated "uuid" (error)
  // TODO: Test the invoice load linked to a shipment order with no enough pending payment (error)
  // TODO: Test the invoice load linked to a shipment order with status payed (error)
})

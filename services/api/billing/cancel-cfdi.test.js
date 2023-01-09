import { createInvoiceOrCreditNote } from 'pages/api/billing/create-cfdi'
import { routeHandler as cancelCfdi } from 'pages/api/billing/cancel-cfdi'
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

describe('Cancel cfdi', () => {
  let db
  let close
  let dbService
  const fakeUserCantCancel = { _id: 'fakeuser1', username: 'fake user', profile: { canCancelInvoices: false } }
  const fakeUser = {
    _id: 'fakeuser2',
    username: 'fake user 2',
    profile: { canCreateInvoices: true, canCancelInvoices: true },
  }

  beforeAll(async () => {
    const { db: testDb, close: testClose } = await getMongoDbConnection()
    db = testDb
    close = testClose
    dbService = appDbService(db)
    await db.collection('users').deleteMany({})
    await db.collection('users').insertOne(fakeUser)
    await db.collection('cfdis').deleteMany({})
    await db.collection('cfdis').insertMany([
      { _id: 'invoice1' },
      { _id: 'invoice2', canceledAt: new Date(), status: 'canceled' },
      {
        _id: 'invoice3',
        cfdiType: 'invoice',
        relatedCfdis: [{ id: '1', type: 'paymentProof', uuid: 'uuid-payment-proof' }],
      },
      {
        _id: 'invoice4',
        cfdiType: 'invoice',
        relatedCfdis: [
          { id: '1', type: 'paymentProof', uuid: 'uuid-payment-proof' },
          { id: '2', type: 'paymentProof', uuid: 'uuid-payment-proof2' },
        ],
      },
      { _id: 'invoice5', relatedCfdis: [{ id: '1', type: 'creditNote' }] },
    ])
  })

  afterAll(async () => {
    await close()
  })

  test("fails when the specified cfdi can't be found on the database", async () => {
    const req = { method: 'POST', body: { cfdiId: 'dontExists' }, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await cancelCfdi(req, res, e => e)
    expect(err.message).toBe('cancelCfdi.errors.cfdiNotFound')
  })

  test("fails when user don't have authorization", async () => {
    const req = { method: 'POST', body: { cfdiId: 'invoice1' }, dbService, loggedUser: fakeUserCantCancel }
    const res = mockRes()
    const err = await cancelCfdi(req, res, e => e)
    expect(err.message).toBe('cancelCfdi.errors.userCantCancelCfdis')
  })

  test('fails if the cfdi is already canceled', async () => {
    const req = { method: 'POST', body: { cfdiId: 'invoice2' }, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await cancelCfdi(req, res, e => e)
    expect(err.message).toBe('cancelCfdi.errors.alreadyCanceled')
  })

  test('fails if the cfdi have one payment proof', async () => {
    const req = { method: 'POST', body: { cfdiId: 'invoice3' }, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await cancelCfdi(req, res, e => e)
    expect(err.message).toBe('cancelCfdi.errors.hasPaymentProof')
    expect(err.details).toEqual({ paymentProofsUuids: ['uuid-payment-proof'] })
  })

  test('fails if the cfdi have more than one payment proof', async () => {
    const req = { method: 'POST', body: { cfdiId: 'invoice4' }, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await cancelCfdi(req, res, e => e)
    expect(err.message).toBe('cancelCfdi.errors.hasPaymentProof')
    expect(err.details).toEqual({ paymentProofsUuids: ['uuid-payment-proof', 'uuid-payment-proof2'] })
  })

  test('cancel an invoice', async () => {
    await db.collection('companies').deleteMany({})
    await db.collection('companies').insertMany([
      {
        _id: 'issuer-id',
        name: 'Issuer Company',
        rfc: 'AAA010101AAA',
        fiscalRegime: '601',
        addressData: { zipCode: '67300' },
      },
      { _id: 'receiver-id', name: 'Receiver Company', rfc: 'SME111110NY1' },
    ])

    const requestBody = {
      cfdiType: 'invoice',
      issuerId: 'issuer-id',
      receiverId: 'receiver-id',
      currency: 'USD',
      exchangeRate: 20.123,
      paymentMethod: 'PUE',
      paymentType: '01',
      creditDays: 8,
      cfdiUse: 'G03',
      notes: 'invoice notes',
      items: [{ productCode: '80111611', unit: 'E48', quantity: 1, unitValue: 100, subtotal: 100, total: 100 }],
    }
    const createReq = { method: 'POST', body: requestBody, dbService, loggedUser: fakeUser }
    const createRes = mockRes()
    await createInvoiceOrCreditNote(createReq, createRes, e => e)

    const req = { method: 'POST', body: { cfdiId: createRes.jsonValue.cfdiId }, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await cancelCfdi(req, res, e => e)
    expect(err).not.toBeDefined()
  })
})

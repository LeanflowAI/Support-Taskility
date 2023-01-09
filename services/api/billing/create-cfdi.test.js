import { createInvoiceOrCreditNote, createPaymentProof } from 'pages/api/billing/create-cfdi'
import { getMongoDbConnection } from 'services/db/getMongoDbConnection'
import { appDbService } from 'services/db'

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

describe('Create cfdis', () => {
  let db
  let close
  let dbService
  const fakeUserCantCreate = {
    _id: 'fakeuser2',
    username: 'fake user 2',
    profile: { canCreateInvoices: false, canCreateCreditNotes: false, canCreatePaymentProofs: false },
  }
  const fakeUser = {
    _id: 'fakeuser2',
    username: 'fake user 2',
    profile: { canCreateInvoices: true, canCreateCreditNotes: true, canCreatePaymentProofs: true },
  }
  const companies = [
    {
      _id: 'issuer-id',
      name: 'Issuer Company',
      rfc: 'AAA010101AAA', // 'ALO110913N98',
      fiscalRegime: '601',
      addressData: { zipCode: '67300' },
    },
    { _id: 'busy-issuer-id', isSigningCfdi: true },
    { _id: 'receiver-id', name: 'Receiver Company', rfc: 'SME111110NY1' },
  ]
  const cfdis = [
    { _id: 'fakeInvoiceId1', cfdiType: 'invoice', uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e1', pendingAmount: 200 },
    {
      _id: 'fakeInvoiceId2',
      cfdiType: 'invoice',
      uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e2',
      pendingAmount: 200,
      relatedCfdis: [{ id: 'someOtherRelatedCfdiId' }],
    },
    { _id: 'fakeInvoiceId3', cfdiType: 'invoice', uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e3', pendingAmount: 150 },
    { _id: 'fakeInvoiceId4', cfdiType: 'invoice', uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e4', pendingAmount: 60 },
    {
      _id: 'fakeInvoiceId5',
      cfdiType: 'invoice',
      status: 'active',
      uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e5',
      issuer: { id: 'issuer-id' },
      receiver: { id: 'receiver-id' },
      folio: 2345,
      shortCurrency: 'MXN',
      paymentMethod: 'PPD',
      payedAmount: 0,
      pendingAmount: 20345,
      total: 20345,
      createdAt: new Date(),
      items: [
        {
          id: 'testItemId',
          productCode: '123456',
          unit: 'E48',
          quantity: 1,
          unitValue: 20345,
          subtotal: 20345,
          total: 20345,
          service: { id: 'fakeShipmentId2', quotationId: 'fakeQuotationId2', status: 'active' },
        },
      ],
    },
    {
      _id: 'fakeInvoiceId6',
      cfdiType: 'invoice',
      uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e6',
      issuer: { id: 'issuer-id' },
      receiver: { id: 'receiver-id' },
      folio: 2346,
      shortCurrency: 'MXN',
      paymentMethod: 'PPD',
      payedAmount: 100,
      pendingAmount: 100,
      total: 200,
      createdAt: new Date(),
      items: [
        {
          id: 'testItemId',
          productCode: '123456',
          unit: 'E48',
          quantity: 1,
          unitValue: 200,
          subtotal: 200,
          total: 200,
        },
      ],
    },
  ]
  const shipments = [
    { _id: 'fakeShipmentId', referencia: 'AAA00001' },
    { _id: 'fakeShipmentId2', quotations: [{ id: 'fakeQuotationId2' }] },
  ]

  beforeAll(async () => {
    const { db: testDb, close: testClose } = await getMongoDbConnection()
    db = testDb
    close = testClose
    dbService = appDbService(db)
    await db.collection('companies').deleteMany({})
    await db.collection('companies').insertMany(companies)
    await db.collection('users').deleteMany({})
    await db.collection('users').insertOne(fakeUser)
    await db.collection('cfdis').deleteMany({})
    await db.collection('cfdis').insertMany(cfdis)
    await db.collection('ordenesDeEmbarque').deleteMany({})
    await db.collection('ordenesDeEmbarque').insertMany(shipments)
  })

  afterAll(async () => {
    await close()
  })

  test('fails if the cfdiType is not specified', async () => {
    const req = { method: 'POST', body: {}, dbService, loggedUser: fakeUserCantCreate }
    const res = mockRes()
    const err = await createInvoiceOrCreditNote(req, res, e => e)
    expect(err.message).toBe('createCfdi.errors.cfdiTypeRequired')
  })

  test('fails if the cfdiType is incorrect', async () => {
    const req = { method: 'POST', body: { cfdiType: 'incorrectCfdiType' }, dbService, loggedUser: fakeUserCantCreate }
    const res = mockRes()
    const err = await createInvoiceOrCreditNote(req, res, e => e)
    expect(err.message).toBe('createCfdi.errors.invalidCfdiType')
  })

  test('fails if the user is unauthorized (invoice)', async () => {
    const req = { method: 'POST', body: { cfdiType: 'invoice' }, dbService, loggedUser: fakeUserCantCreate }
    const err = await createInvoiceOrCreditNote(req, mockRes(), e => e)
    expect(err.message).toBe('createCfdi.errors.userUnauthorized')
  })

  test('fails if the user is unauthorized (creditNote)', async () => {
    const req = { method: 'POST', body: { cfdiType: 'creditNote' }, dbService, loggedUser: fakeUserCantCreate }
    const err = await createInvoiceOrCreditNote(req, mockRes(), e => e)
    expect(err.message).toBe('createCfdi.errors.userUnauthorized')
  })

  test('fails if the user is unauthorized (payment proof)', async () => {
    const req = { method: 'POST', body: { cfdiType: 'paymentProof' }, dbService, loggedUser: fakeUserCantCreate }
    const err = await createPaymentProof(req, mockRes(), e => e)
    expect(err.message).toBe('createCfdi.errors.userUnauthorized')
  })

  test('fails if another CFDI is being signed', async () => {
    const requestBody = { cfdiType: 'invoice', issuerId: 'busy-issuer-id' }
    const req = { method: 'POST', body: requestBody, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await createInvoiceOrCreditNote(req, res, e => e)
    expect(err.message).toBe('createCfdi.errors.cfdiSigningInProgress')
  })

  test('can create a basic invoice', async () => {
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
      items: [
        { productCode: '80111611', unit: 'E48', quantity: 1, unitValue: 100, subtotal: 100, total: 100 },
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 100,
          subtotal: 100,
          total: 112,
          taxes: [
            { name: 'iva', rate: 0.16, isRetention: false, value: 16 },
            { name: 'iva', rate: 0.04, isRetention: true, value: 4 },
          ],
          notes: 'item notes',
        },
      ],
    }
    const req = { method: 'POST', body: requestBody, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await createInvoiceOrCreditNote(req, res, e => e)

    const company = await db.collection('companies').findOne({ _id: 'issuer-id' })
    expect(company && company.isSigningCfdi).toBe(false)
    expect(err).not.toBeDefined()
    expect(res.jsonValue.cfdiId).toBeDefined()
    const createdCfdi = await db.collection('cfdis').findOne({ _id: res.jsonValue.cfdiId })
    expect(createdCfdi).not.toBeFalsy()
    // TODO: Check createdCfdi fields details
    const sentCfdi = await db.collection('sentCfdis').findOne({ createdCfdiId: res.jsonValue.cfdiId })
    expect(sentCfdi).not.toBeFalsy()
    expect(sentCfdi.createdBy).toBe('fakeuser2')
    expect(sentCfdi.createdByUsername).toBe('fake user 2')
    expect(sentCfdi.clientParams).toEqual(requestBody)
    expect(sentCfdi.sentCfdi).not.toBeFalsy()
    expect(sentCfdi.sentCfdi.CfdiType).toBe('I')
    expect(sentCfdi.signedCfdi.Id).not.toBeFalsy()
  })

  test('can create a basic credit note without related invoices', async () => {
    const requestBody = {
      cfdiType: 'creditNote',
      issuerId: 'issuer-id',
      receiverId: 'receiver-id',
      currency: 'USD',
      exchangeRate: 20.123,
      paymentMethod: 'PUE',
      paymentType: '01',
      creditDays: 8,
      cfdiUse: 'G03',
      notes: 'invoice notes',
      items: [
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 100,
          subtotal: 100,
          total: 100,
        },
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 100,
          subtotal: 100,
          total: 112,
          taxes: [
            { name: 'iva', rate: 0.16, isRetention: false, value: 16 },
            { name: 'iva', rate: 0.04, isRetention: true, value: 4 },
          ],
          notes: 'item notes',
        },
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 50,
          subtotal: 50,
          total: 56,
          taxes: [
            { name: 'iva', rate: 0.16, isRetention: false, value: 8 },
            { name: 'iva', rate: 0.04, isRetention: true, value: 2 },
          ],
          notes: 'item notes',
        },
      ],
    }
    const req = { method: 'POST', body: requestBody, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await createInvoiceOrCreditNote(req, res, e => e)

    const company = await db.collection('companies').findOne({ _id: 'issuer-id' })
    expect(company && company.isSigningCfdi).toBe(false)
    expect(err).not.toBeDefined()
    expect(res.jsonValue.cfdiId).toBeDefined()
    const createdCfdi = await db.collection('cfdis').findOne({ _id: res.jsonValue.cfdiId })
    expect(createdCfdi).not.toBeFalsy()
    // TODO: Check createdCfdi fields details
    const sentCfdi = await db.collection('sentCfdis').findOne({ createdCfdiId: res.jsonValue.cfdiId })
    expect(sentCfdi).not.toBeFalsy()
    expect(sentCfdi.createdBy).toBe('fakeuser2')
    expect(sentCfdi.createdByUsername).toBe('fake user 2')
    expect(sentCfdi.clientParams).toEqual(requestBody)
    expect(sentCfdi.sentCfdi).not.toBeFalsy()
    expect(sentCfdi.sentCfdi.CfdiType).toBe('E')
    expect(sentCfdi.signedCfdi.Id).not.toBeFalsy()
  })

  test('fails creating a credit note with related invoices without enough pendingAmount', async () => {
    const requestBody = {
      cfdiType: 'creditNote',
      issuerId: 'issuer-id',
      receiverId: 'receiver-id',
      currency: 'USD',
      exchangeRate: 20.123,
      paymentMethod: 'PUE',
      paymentType: '01',
      creditDays: 8,
      cfdiUse: 'G03',
      notes: 'invoice notes',
      items: [
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 90,
          subtotal: 90,
          total: 90,
          invoiceId: 'fakeInvoiceId6',
        },
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 50,
          subtotal: 50,
          total: 50,
          invoiceId: 'fakeInvoiceId6',
        },
      ],
    }
    const req = { method: 'POST', body: requestBody, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await createInvoiceOrCreditNote(req, res, e => e)
    expect(err.message).toBe('createCfdi.errors.invoiceWithoutPendingAmount')
  })

  test('can create a credit note with related invoices', async () => {
    const requestBody = {
      cfdiType: 'creditNote',
      issuerId: 'issuer-id',
      receiverId: 'receiver-id',
      currency: 'USD',
      exchangeRate: 20.123,
      paymentMethod: 'PUE',
      paymentType: '01',
      creditDays: 8,
      cfdiUse: 'G03',
      notes: 'invoice notes',
      items: [
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 100,
          subtotal: 100,
          total: 100,
          invoiceId: 'fakeInvoiceId1',
        },
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 100,
          subtotal: 100,
          total: 112,
          taxes: [
            { name: 'iva', rate: 0.16, isRetention: false, value: 16 },
            { name: 'iva', rate: 0.04, isRetention: true, value: 4 },
          ],
          notes: 'item notes',
          invoiceId: 'fakeInvoiceId2',
        },
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 50,
          subtotal: 50,
          total: 56,
          taxes: [
            { name: 'iva', rate: 0.16, isRetention: false, value: 8 },
            { name: 'iva', rate: 0.04, isRetention: true, value: 2 },
          ],
          notes: 'item notes',
          invoiceId: 'fakeInvoiceId2',
        },
      ],
    }
    const req = { method: 'POST', body: requestBody, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await createInvoiceOrCreditNote(req, res, e => e)

    const company = await db.collection('companies').findOne({ _id: 'issuer-id' })
    expect(company && company.isSigningCfdi).toBe(false)
    expect(err).not.toBeDefined()
    expect(res.jsonValue.cfdiId).toBeDefined()
    const createdCfdi = await db.collection('cfdis').findOne({ _id: res.jsonValue.cfdiId })
    expect(createdCfdi).not.toBeFalsy()
    // TODO: Check createdCfdi fields details
    const sentCfdi = await db.collection('sentCfdis').findOne({ createdCfdiId: res.jsonValue.cfdiId })
    expect(sentCfdi).not.toBeFalsy()
    expect(sentCfdi.createdBy).toBe('fakeuser2')
    expect(sentCfdi.createdByUsername).toBe('fake user 2')
    expect(sentCfdi.clientParams).toEqual(requestBody)
    expect(sentCfdi.sentCfdi).not.toBeFalsy()
    expect(sentCfdi.sentCfdi.CfdiType).toBe('E')
    expect(sentCfdi.signedCfdi.Id).not.toBeFalsy()

    const relatedInvoice1 = await db.collection('cfdis').findOne({ _id: 'fakeInvoiceId1' })
    const relatedInvoice2 = await db.collection('cfdis').findOne({ _id: 'fakeInvoiceId2' })
    expect(relatedInvoice1.relatedCfdis.find(({ id }) => id === res.jsonValue.cfdiId)).toBeDefined()
    expect(relatedInvoice2.relatedCfdis.find(({ id }) => id === res.jsonValue.cfdiId)).toBeDefined()
    expect(relatedInvoice1.relatedCfdis).toHaveLength(1)
    expect(relatedInvoice2.relatedCfdis).toHaveLength(2)
  })

  test('can create a credit note with a related service', async () => {
    const requestBody = {
      cfdiType: 'creditNote',
      issuerId: 'issuer-id',
      receiverId: 'receiver-id',
      currency: 'USD',
      exchangeRate: 20.123,
      paymentMethod: 'PUE',
      paymentType: '01',
      creditDays: 8,
      cfdiUse: 'G03',
      notes: 'invoice notes',
      items: [
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 100,
          subtotal: 100,
          total: 112,
          taxes: [
            { name: 'iva', rate: 0.16, isRetention: false, value: 16 },
            { name: 'iva', rate: 0.04, isRetention: true, value: 4 },
          ],
          notes: 'item notes',
          service: { id: 'fakeShipmentId' },
          invoiceId: 'fakeInvoiceId3',
        },
        {
          productCode: '80111611',
          unit: 'E48',
          quantity: 1,
          unitValue: 50,
          subtotal: 50,
          total: 56,
          taxes: [
            { name: 'iva', rate: 0.16, isRetention: false, value: 8 },
            { name: 'iva', rate: 0.04, isRetention: true, value: 2 },
          ],
          notes: 'item notes',
          invoiceId: 'fakeInvoiceId4',
        },
      ],
    }
    const req = { method: 'POST', body: requestBody, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await createInvoiceOrCreditNote(req, res, e => e)

    const company = await db.collection('companies').findOne({ _id: 'issuer-id' })
    expect(company && company.isSigningCfdi).toBe(false)
    expect(err).not.toBeDefined()
    expect(res.jsonValue.cfdiId).toBeDefined()
    const createdCfdi = await db.collection('cfdis').findOne({ _id: res.jsonValue.cfdiId })
    expect(createdCfdi).not.toBeFalsy()
    expect(createdCfdi.folio).toBe(1)
    // TODO: Check createdCfdi fields details
    const sentCfdi = await db.collection('sentCfdis').findOne({ createdCfdiId: res.jsonValue.cfdiId })
    expect(sentCfdi).not.toBeFalsy()
    expect(sentCfdi.createdBy).toBe('fakeuser2')
    expect(sentCfdi.createdByUsername).toBe('fake user 2')
    expect(sentCfdi.clientParams).toEqual(requestBody)
    expect(sentCfdi.sentCfdi).not.toBeFalsy()
    expect(sentCfdi.sentCfdi.CfdiType).toBe('E')
    expect(sentCfdi.signedCfdi.Id).not.toBeFalsy()

    const relatedInvoice3 = await db.collection('cfdis').findOne({ _id: 'fakeInvoiceId3' })
    const relatedInvoice4 = await db.collection('cfdis').findOne({ _id: 'fakeInvoiceId4' })
    expect(relatedInvoice3.relatedCfdis.find(({ id }) => id === res.jsonValue.cfdiId)).toBeDefined()
    expect(relatedInvoice4.relatedCfdis.find(({ id }) => id === res.jsonValue.cfdiId)).toBeDefined()
    expect(relatedInvoice3.relatedCfdis).toHaveLength(1)
    expect(relatedInvoice4.relatedCfdis).toHaveLength(1)

    const relatedService = await db.collection('ordenesDeEmbarque').findOne({ _id: 'fakeShipmentId' })
    expect(relatedService.quotations).toHaveLength(1)
    expect(relatedService.quotations[0].total).toBe(-112)
    expect(relatedService.quotations[0].haveTax).toBe(true)
    expect(relatedService.quotations[0].haveIvaRet).toBe(true)
  })

  test('can create a payment proof', async () => {
    const requestBody = {
      cfdiType: 'paymentProof',
      issuerId: 'issuer-id',
      receiverId: 'receiver-id',
      notes: '',
      payments: [
        {
          date: '2018-10-01',
          paymentForm: '03',
          currency: 'USD',
          amount: 1188.62,
          exchangeRate: 19.1374,
          relatedCfdis: [{ id: 'fakeInvoiceId5', uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e5', total: 62.11, exchangeRate: 1 }],
        },
      ],
    }
    const req = { method: 'POST', body: requestBody, dbService, loggedUser: fakeUser }
    const res = mockRes()
    const err = await createPaymentProof(req, res, e => e)

    const company = await db.collection('companies').findOne({ _id: 'issuer-id' })
    expect(company && company.isSigningCfdi).toBe(false)
    expect(err).not.toBeDefined()
    expect(res.jsonValue.cfdiId).toBeDefined()
    const createdCfdi = await db.collection('cfdis').findOne({ _id: res.jsonValue.cfdiId })
    expect(createdCfdi).not.toBeFalsy()
    expect(createdCfdi.payments).toEqual([
      {
        date: '2018-10-01',
        paymentForm: '03',
        currency: 'USD',
        amount: 1188.62,
        exchangeRate: 19.1374,
        cfdisUuids: ['78341e1e-abd9-4ac3-b154-05ed3d10a8e5'],
      },
    ])
    expect(createdCfdi.relatedCfdis).toEqual([
      {
        id: 'fakeInvoiceId5',
        uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e5',
        type: 'invoice',
        status: 'active',
        folio: 2345,
        currency: 'MXN',
        exchangeRate: 1,
        total: 20345,
        createdAt: createdCfdi.relatedCfdis[0].createdAt,
        previousBalanceAmount: 20345,
        amountPaid: 62.11,
        partialityNumber: 1,
        paymentMethod: 'PPD',
      },
    ])

    const sentCfdi = await db.collection('sentCfdis').findOne({ createdCfdiId: res.jsonValue.cfdiId })
    expect(sentCfdi).not.toBeFalsy()
    expect(sentCfdi.createdBy).toBe('fakeuser2')
    expect(sentCfdi.createdByUsername).toBe('fake user 2')
    expect(sentCfdi.clientParams).toEqual(requestBody)
    expect(sentCfdi.sentCfdi).not.toBeFalsy()
    expect(sentCfdi.sentCfdi.CfdiType).toBe('P')
    expect(sentCfdi.signedCfdi.Id).not.toBeFalsy()
    expect(sentCfdi.signedCfdi.Complement.Payments[0]).not.toBeFalsy()

    const relatedInvoice = await db.collection('cfdis').findOne({ uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e5' })
    expect(relatedInvoice.status).toBe('partiallyPayed')
    expect(relatedInvoice.relatedCfdis.find(({ id }) => id === res.jsonValue.cfdiId)).toBeDefined()
    expect(relatedInvoice.relatedCfdis).toHaveLength(1)
    expect(relatedInvoice.payedAmount).toBe(62.11)
    expect(relatedInvoice.pendingAmount).toBe(20282.89)

    // TODO: Add test to check for status on fully payed invoices.

    const relatedService = await db.collection('ordenesDeEmbarque').findOne({ _id: 'fakeShipmentId2' })
    expect(relatedService.quotations).toHaveLength(1)
    expect(relatedService.quotations[0].relatedCfdi).toEqual({
      id: 'fakeInvoiceId5',
      itemId: 'testItemId',
      status: 'partiallyPayed',
    })
  })

  // TODO: Additional tests
  // Validation rules
  // Test foreign receiver
  // Error on invoice currency and quotations mismatch
  // Test invoice's "pendingAmount" after credit note or payment proof craetion
  // Create a payment proof must fail if one of the documents is canceled
  // generateCfdiPdf call transloadit API correctly
})

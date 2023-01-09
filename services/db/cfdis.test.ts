import { getMongoDbConnection } from './getMongoDbConnection'
import { appDbService } from '.'
import { DbService, Cfdi, ShipmentOrder } from '../model'
import { Db } from 'mongodb'

describe('updateRelatedCfdis', () => {
  let db: Db
  let close: Function
  let dbService: DbService

  beforeEach(async () => {
    const { db: testDb, close: testClose } = await getMongoDbConnection()
    db = testDb
    close = testClose
    dbService = appDbService(db)
    await db.collection('migrationTestsCollection').deleteMany({})
    await db.collection('migrationTestsCollection').insertMany([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 5 }])
  })

  afterAll(async () => {
    await close()
  })

  test('Update status for cancel pending invoice', async () => {
    const cancelDate = new Date()
    db.collection('cfdis').deleteMany({})
    db.collection('cfdis').insertOne({ _id: 'invoice-to-cancel' })

    await dbService.setCfdiAsCanceled('invoice-to-cancel', cancelDate, true)

    const canceledCfdi = await dbService.getCfdi('invoice-to-cancel')
    expect(canceledCfdi.status).toBe('cancelPending')
    expect(canceledCfdi.canceledAt).toEqual(cancelDate)
  })

  test('Update status for canceled invoice', async () => {
    const cancelDate = new Date()
    db.collection('cfdis').deleteMany({})
    db.collection('cfdis').insertOne({ _id: 'invoice-to-cancel' })

    await dbService.setCfdiAsCanceled('invoice-to-cancel', cancelDate)

    const canceledCfdi = await dbService.getCfdi('invoice-to-cancel')
    expect(canceledCfdi.status).toBe('canceled')
    expect(canceledCfdi.canceledAt).toEqual(cancelDate)
  })

  test('Update related services for a canceled invoice', async () => {
    const cancelDate = new Date()
    const cfdiToCancel: Cfdi = {
      _id: 'invoice-to-cancel',
      cfdiType: 'invoice',
      total: 1000,
      pendingAmount: 1000,
      payedAmount: 0,
      relatedServices: [{ id: 'service', reference: 'AAA000001' }],
      items: [{ id: 'item-id', service: { id: 'service', quotationId: 'q1' } }],
    }
    const relatedService: ShipmentOrder = {
      _id: 'service',
      quotations: [{ id: 'q1', notes: '...', relatedCfdi: { id: 'invoice-to-cancel', status: 'active' } }],
    }
    db.collection('cfdis').deleteMany({})
    db.collection('cfdis').insert(cfdiToCancel)
    db.collection('ordenesDeEmbarque').deleteMany({})
    db.collection('ordenesDeEmbarque').insert(relatedService)

    await dbService.setCfdiAsCanceled('invoice-to-cancel', cancelDate)

    const canceledCfdi: Cfdi = await dbService.getCfdi('invoice-to-cancel')
    expect(canceledCfdi.status).toBe('canceled')
    expect(canceledCfdi.canceledAt).toEqual(cancelDate)
    expect(canceledCfdi.pendingAmount).toEqual(0)
    expect(canceledCfdi.payedAmount).toEqual(0)
    const updatedService: ShipmentOrder = await dbService.getShipment({ shipmentId: 'service' })
    expect(updatedService.quotations[0].relatedCfdi?.status).toBe('canceled')
    expect(updatedService.quotations).toHaveLength(2)
    expect(updatedService.quotations[0].id).not.toBe(updatedService.quotations[1].id)
  })

  test('Update related services for a canceled credit note', async () => {
    const cancelDate = new Date()
    const cfdiToCancel: Cfdi = {
      _id: 'credit-note-to-cancel',
      cfdiType: 'creditNote',
      total: 1000,
      relatedServices: [{ id: 'service', reference: 'AAA000001' }],
      items: [{ id: 'item-id', service: { id: 'creditnote-service', quotationId: 'q1' } }],
    }
    const relatedService: ShipmentOrder = {
      _id: 'creditnote-service',
      quotations: [{ id: 'q1', notes: '...', relatedCfdi: { id: 'credit-note-to-cancel', itemId: 'item-id', status: 'active' } }],
    }
    db.collection('cfdis').deleteMany({})
    db.collection('cfdis').insert(cfdiToCancel)
    db.collection('ordenesDeEmbarque').deleteMany({})
    db.collection('ordenesDeEmbarque').insert(relatedService)

    await dbService.setCfdiAsCanceled('credit-note-to-cancel', cancelDate)

    const canceledCfdi: Cfdi = await dbService.getCfdi('credit-note-to-cancel')
    expect(canceledCfdi.status).toBe('canceled')
    expect(canceledCfdi.canceledAt).toEqual(cancelDate)
    expect(canceledCfdi.pendingAmount).not.toBeDefined()
    expect(canceledCfdi.payedAmount).not.toBeDefined()
    const updatedService: ShipmentOrder = await dbService.getShipment({ shipmentId: 'creditnote-service' })
    expect(updatedService.quotations).toHaveLength(1)
    expect(updatedService.quotations[0].relatedCfdi?.status).toBe('canceled')
  })

  test('Update related services for a canceled payment proof', async () => {
    const cancelDate = new Date()
    const cfdiToCancel = {
      _id: 'payment-to-cancel',
      status: 'active',
      cfdiType: 'paymentProof',
      payments: [
        {
          date: '2018-10-01',
          paymentForm: '03',
          currency: 'USD',
          amount: 62,
          exchangeRate: 1,
          cfdisUuids: ['78341e1e-abd9-4ac3-b154-05ed3d10a8e6'],
        },
      ],
      relatedCfdis: [
        {
          id: 'invoice-id',
          uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e6',
          type: 'invoice',
          status: 'active',
          folio: 2345,
          currency: 'USD',
          exchangeRate: 1,
          total: 100,
          previousBalanceAmount: 100,
          amountPaid: 62,
          partialityNumber: 1,
          paymentMethod: 'PPD',
        },
      ],
      notes: '',
    }
    const relatedInvoice: Cfdi = {
      _id: 'invoice-id',
      uuid: '78341e1e-abd9-4ac3-b154-05ed3d10a8e6',
      status: 'partiallyPayed',
      folio: 2345,
      cfdiType: 'invoice',
      shortCurrency: 'USD',
      total: 100,
      pendingAmount: 38,
      payedAmount: 62,
      relatedServices: [{ id: 'service', reference: 'AAA000001' }],
      items: [{ id: 'item-id', service: { id: 'service', quotationId: 'q1' } }],
    }
    const relatedService: ShipmentOrder = {
      _id: 'service',
      quotations: [{ id: 'q1', notes: '...', relatedCfdi: { id: 'invoice-id', itemId: 'item-id', status: 'active' } }],
    }
    db.collection('cfdis').deleteMany({})
    db.collection('cfdis').insertMany([cfdiToCancel, relatedInvoice])
    db.collection('ordenesDeEmbarque').deleteMany({})
    db.collection('ordenesDeEmbarque').insert(relatedService)

    await dbService.setCfdiAsCanceled('payment-to-cancel', cancelDate)

    const canceledCfdi: Cfdi = await dbService.getCfdi('payment-to-cancel')
    expect(canceledCfdi.status).toBe('canceled')
    expect(canceledCfdi.canceledAt).toEqual(cancelDate)
    expect(canceledCfdi.pendingAmount).not.toBeDefined()
    expect(canceledCfdi.payedAmount).not.toBeDefined()
    expect(canceledCfdi.relatedCfdis[0].status).toBe('active')

    const invoice: Cfdi = await dbService.getCfdi('invoice-id')
    expect(invoice.status).toBe('active')
    expect(invoice.pendingAmount).toBe(100)
    expect(invoice.payedAmount).toBe(0)

    const updatedService: ShipmentOrder = await dbService.getShipment({ shipmentId: 'service' })
    expect(updatedService.quotations).toHaveLength(1)
    expect(updatedService.quotations[0].relatedCfdi?.status).toBe('active')
  })
})

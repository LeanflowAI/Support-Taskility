/* eslint-disable no-unused-vars */
import { Db, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import parseJSON from 'date-fns/parseJSON'
import R from 'ramda'
import { SHA256 } from '../crypto'
import { num } from '../helpers/mathHelp'
import { i18n } from '../i18n'
import { getServiceName, getSatTaxName, getCurrencyName, getPaymentTypeName, getPaymentMethodName, getFiscalRegimeName } from '../catalogs'
import {
  DbService,
  Cfdi,
  User,
  UserType,
  ShipmentOrder,
  Company,
  AttachedFile,
  CfdiType,
  ShipmentOrderQuotation,
  CfdiRelatedCfdi,
  CfdiStatus,
  EventLog,
  EventLogType,
  Relationship,
  RelationshipType,
  RelationshipCompanyRole,
  EmailMessage,
  CfdiDeliveryStatus,
  CurrencyRate,
  GeocodingPositionInfo,
  Vehicle,
  Place,
} from '../model'
import { getNewId } from '../helpers/server'

export const appDbService = (db: Db): DbService => {
  const AttachedFiles = db.collection<AttachedFile>('attachedFiles')
  const BusinessRelationships = db.collection<Relationship>('businessRelationships')
  const Cfdis = db.collection<Cfdi>('cfdis')
  const CfdiDrafts = db.collection('cfdiDrafts') // TODO: Define CfdiDraft type/interface
  const Companies = db.collection<Company>('companies')
  const EmailMessages = db.collection<EmailMessage>('emailMessages')
  const EventLogs = db.collection<EventLog>('eventLogs')
  const SentCfdis = db.collection('sentCfdis')
  const ShipmentOrders = db.collection<ShipmentOrder>('ordenesDeEmbarque')
  const Users = db.collection<User>('users')
  const CurrencyRates = db.collection<CurrencyRate>('currencyRates')
  const InverseGeocodingCache = db.collection<GeocodingPositionInfo>('inverseGeocodingCache')
  const Vehicles = db.collection<Vehicle>('vehicles')
  const Places = db.collection<Place>('places')
  const SatPostalCodes = db.collection('sat.postalCodes') // TODO: Define type/interface
  const SatCountries = db.collection('sat.countries') // TODO: Define type/interface
  const SatStates = db.collection('sat.states') // TODO: Define type/interface
  const SatLocalities = db.collection('sat.localities') // TODO: Define type/interface
  const SatMunicipalities = db.collection('sat.municipalities') // TODO: Define type/interface
  const SatSuburbs = db.collection('sat.suburbs') // TODO: Define type/interface
  const SatProductAndServices = db.collection('sat.productAndServicesCatalog') // TODO: Define type/interface
  const SatTariffCodes = db.collection('sat.tariffCodes') // TODO: Define type/interface
  const SatDangerousMaterialCodes = db.collection('sat.dangerousMaterial')
  const Drivers = db.collection('drivers') // TODO: Define type/interface
  const Products = db.collection('products')
  const Counters = db.collection('counters')
  const BoLHubs = db.collection('billOfLadingHubs')
  const TrackingPositions = db.collection('trackingPositions')
  const DoFExchangeRates = db.collection('dofExchangeRates')

  const getClientById = async (clientId: string) => {
    return Companies.findOne({ _id: clientId })
  }

  // const  getClientByName = async(clientName: string)=> {
  //   return Companies.findOne({ name: new RegExp(clientName, 'i') })
  // }

  // async getOwedTotals({ companyId, clientId }: { companyId: string; clientId: string }) {
  //   if (!clientId || !companyId) {
  //     return Promise.resolve(null)
  //   }

  //   const pipeline = [
  //     {
  //       $match: {
  //         Type: 'I - Ingreso',
  //         invoiceCompanyId: companyId,
  //         clientCompanyId: clientId,
  //         $or: [
  //           { pendingAmount: { $gt: 0 } },
  //           // TODO Migrate database to add calculated pendingAmount to all invoices
  //           // TODO Then, remove this second condition
  //           { pendingAmount: { $exists: false } },
  //         ],
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: '$Currency',
  //         amount: {
  //           $sum: '$Total',
  //         },
  //       },
  //     },
  //     {
  //       $match: {
  //         amount: {
  //           $gt: 0,
  //         },
  //       },
  //     },
  //   ]
  //   await Cfdis
  //     .aggregate(pipeline)
  //     .toArray()
  // },

  // async getShipmentOrderByReference(shipmentReference: string) {
  //   if (!shipmentReference) {
  //     return Promise.resolve(null)
  //   }
  //   return await ShipmentOrders.findOne({ referencia: new RegExp(shipmentReference, 'i') })
  // },

  // getOrderStatus(order: ShipmentOrder, lang: string) {
  //   const { currentMilestoneNumber, isChecked } = order
  //   if (!currentMilestoneNumber && currentMilestoneNumber !== 0) {
  //     return lang === 'es' ? 'Creada' : 'Created'
  //   }
  //   if (currentMilestoneNumber === 0) {
  //     return lang === 'es' ? 'Pickup' : 'Pickup'
  //   }
  //   if (currentMilestoneNumber > 0 && currentMilestoneNumber < 256) {
  //     return lang === 'es' ? 'En tránsito' : 'In process'
  //   }
  //   if (currentMilestoneNumber === 256 && !isChecked) {
  //     return lang === 'es' ? 'Entrega' : 'Delivery'
  //   }
  //   if (isChecked) {
  //     return lang === 'es' ? 'Recibido' : 'Received'
  //   }
  //   return ''
  // },

  const validateCredentials = (user: User, password: string) => {
    const currentPass = user.services.password.bcrypt
    const passSha = SHA256(password)
    return bcrypt.compareSync(passSha, currentPass)
  }

  const getUserByEmail = async (email: string): Promise<User | null> => Users.findOne({ 'emails.address': email })

  const getUserByUsername = async (username: string): Promise<User | null> => Users.findOne({ username })

  // TODO: create database collection ("users") indexes on unique fields
  // TODO: Add password strenght requirements (min chars, include symbols, ...)
  // TODO: Check how to increase bcrypt rounds over time.
  //  - Asks users for password update periodically?

  const createUser = async (params: { username: string; email: string; password: string }): Promise<string> => {
    const { username, email, password } = params
    const passwordHash = bcrypt.hashSync(SHA256(password), 10)
    // Use SHA256 to generate a token than can be used on the url.
    const verificationToken = SHA256(bcrypt.hashSync(email, 10))
    const user: User = {
      createdAt: new Date(),
      services: {
        email: {
          verificationTokens: [
            {
              token: verificationToken,
              address: email,
              when: new Date(),
            },
          ],
        },
        password: { bcrypt: passwordHash },
      },
      username,
      emails: [{ address: email, verified: false }],
      profile: { userType: UserType.client, companyId: 'none' },
      licenses: [{ licenseId: '000777', licenseName: 'freeUser', active: true }],
    }
    await Users.insertOne(user)
    return verificationToken
  }

  const saveActivationEmailData = async (params: { username: string; submittedAt: string; messageId: string }) => {
    const { username, submittedAt, messageId } = params
    const update = {
      $set: {
        'services.email.verificationTokens.0.submittedAt': submittedAt,
        'services.email.verificationTokens.0.messageId': messageId,
      },
    }
    await Users.updateOne({ username }, update)
  }

  const getUserById = async (userId: string): Promise<User | null> => Users.findOne({ _id: userId })

  const getUserByActivationToken = async (token: string): Promise<User | null> => {
    if (!token) return Promise.resolve(null)
    return Users.findOne({ 'services.email.verificationTokens.token': token })
  }

  const activateUser = async (token: string) => {
    // TODO: Improve verification by checking that the encoded token (bcrypt) match the email.
    const filter = { 'services.email.verificationTokens.token': token }
    // TODO: Add tests and improve. This implementation assumes a single email by user.
    const update = { $set: { 'emails.0.verified': true, 'services.email.verificationTokens': [] } }
    Users.updateOne(filter, update)
  }

  const setUserEnabled = async (userId: string) => {
    // TODO: Generate Log
    // console.log(`Enabling: ${userId}`)
    const filter = { _id: userId }
    const update = { $set: { enabled: true } }
    await Users.updateOne(filter, update)
  }

  const setUserDisabled = async (userId: string) => {
    // TODO: Generate Log
    // console.log(`Disabling: ${userId}`)
    const filter = { _id: userId }
    const update = { $set: { enabled: false } }
    await Users.updateOne(filter, update)
  }

  const deleteUser = async (userId: String) => {
    // TODO: Generate Log
    // console.log(userId, loggedUser)
    const filter = { _id: userId }
    const update = { $set: { deleted: true } }
    await Users.updateOne(filter, update)
  }

  const setUserType = async (userId: string, newUserType: UserType, loggedUser: object) => {
    // TODO: Generate Log
    // console.log(userId, loggedUser)
    const filter = { _id: userId }
    const update = { $set: { 'profile.userType': newUserType } }
    await Users.updateOne(filter, update)
  }

  // const getUserProfilePhoto = async (userId: string) => {
  //   const filter = { _id: userId }
  //   const fields = { 'profile.photo': 1, _id: 0 }
  //   Users.find(filter, fields)
  // }

  const createAccountRecoveryToken = async (params: { email: string }) => {
    const { email } = params
    const recoveryToken = SHA256(bcrypt.hashSync(email, 10))
    const user = await getUserByEmail(email)
    if (!user) {
      return ''
    }
    const update = { $set: { 'services.recovery': { token: recoveryToken, when: new Date() } } }
    await Users.updateOne({ _id: user._id }, update)
    return recoveryToken
  }

  const saveRecoveryEmailData = async (params: { username: string; submittedAt: string; messageId: string }) => {
    const { username, submittedAt, messageId } = params
    const user = await getUserByUsername(username)
    if (user) {
      const update = {
        $set: {
          'services.recovery.submittedAt': submittedAt,
          'services.recovery.messageId': messageId,
        },
      }
      await Users.updateOne({ _id: user._id }, update)
    }
  }

  const getUserByRecoveryToken = async (token: string) =>
    // TODO: Check token age. If it's too old (set expiration time on app config), return null
    // TODO: Check recovery token string format (length and valid characters)
    Users.findOne({ 'services.recovery.token': token })

  const updateUserPassword = async (token: string, newPassword: string) => {
    const user = await getUserByRecoveryToken(token)
    if (user) {
      const passwordHash = bcrypt.hashSync(SHA256(newPassword), 10)
      const update = { $set: { 'services.password.bcrypt': passwordHash, 'services.recovery.token': null } }
      await Users.updateOne({ _id: user._id }, update)
    }
  }

  // TODO: Move invoice helpers out of here
  // const getInvoiceBalance = (invoice: Cfdi) => {
  //   const { total, pendingAmount } = invoice
  //   return pendingAmount === 0 ? pendingAmount : pendingAmount || total
  // }

  // TODO: USE THIS FUNCTIONS TO CALCULATE THE VALUES ON INVOICE INSERT/UPDATE
  // const getTaxesByType = (taxType: 'transferred' | 'withheld', invoice: Cfdi) => {
  //   const { taxes = [] } = invoice
  //   return taxes.filter(({ type }) => type === taxType)
  // }
  // const getWithheldIva = (invoice: Cfdi) =>
  //   getTaxesByType('withheld', invoice).reduce((sum, { total }) => sum + total, 0)
  // const getTransferredIva = (invoice: Cfdi) =>
  //   getTaxesByType('transferred', invoice).reduce((sum, { total }) => sum + total, 0)
  // const getExpirationDate = (invoice: Cfdi): Date => {
  //   const paymentConditions: { [x: string]: number } = {
  //     Contado: 0,
  //     '0 días': 0,
  //     '15 días': 15,
  //     '20 días': 20,
  //     '30 días': 30,
  //     '45 días': 45,
  //   }
  //   const expirationDays = paymentConditions[invoice.paymentConditions] || 0
  //   return addDays(parseISO(invoice.createdAt.toString()), expirationDays)
  // }
  // TODO: (END) USE THIS FUNCTIONS TO CALCULATE THE VALUES ON INVOICE INSERT/UPDATE ///

  // TODO: Create tests for this function
  const createCfdiListQuery = (
    issuersIds: Array<string>,
    filters: any[] = [],
    searchText: string,
    from?: string,
    to?: string,
    cfdiType?: string,
    cfdiStatus?: string,
    cfdiClients?: string
  ) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const startDate = from ? new Date(from) : new Date(year - 10, month - 1, 1)
    const endDate = to ? new Date(to) : new Date(year, month + 1, 0, 11, 59, 59)
    const defaultFilters = [{ name: 'dateRange', value: { from: startDate, to: endDate } }]

    const filter = (filterName: string) => [...defaultFilters, ...filters].find(({ name }: { name: String }) => name === filterName)

    // TODO: Get user by session in token (params.token)
    // const user = await getUserByToken(token)

    // TODO: Return only user's invoices
    const query: { [key: string]: any } = { 'issuer.id': { $in: issuersIds } }

    const dateRangeFilter = filter('dateRange')
    if (dateRangeFilter) {
      const { from, to } = dateRangeFilter.value
      query.createdAt = { $gte: new Date(from), $lte: new Date(to) }
    }

    if (searchText) query.$text = { $search: searchText }

    if (cfdiType) {
      const arrayCfdiType = cfdiType.split(',')
      query.cfdiType = { $in: arrayCfdiType }
    }

    if (cfdiStatus) {
      const arrayCfdiStatus = cfdiStatus.split(',')
      query.status = { $in: arrayCfdiStatus }
    }

    if (cfdiClients) {
      const arrayCfdiClients = cfdiClients.split(',')
      query['receiver.id'] = { $in: arrayCfdiClients }
    }

    const statusFilter = filter('status')
    // TODO: Consider the implementation of the helpers (getInvoiceBalance) directly from the database.
    if (statusFilter) query.status = statusFilter.value

    const issuerFilter = filter('issuer')
    if (issuerFilter) {
      query['issuer.name'] = { $regex: issuerFilter.value, $options: 'i' }
    }

    const clientFilter = filter('client')
    if (clientFilter) {
      query['receiver.name'] = { $regex: clientFilter.value, $options: 'i' }
    }

    const clientRfcFilter = filter('clientRfc')
    if (clientRfcFilter) {
      query['receiver.rfc'] = { $regex: clientRfcFilter.value, $options: 'i' }
    }

    const currencyFilter = filter('currency')
    if (currencyFilter) query.shortCurrency = { $regex: currencyFilter.value, $options: 'i' }

    const referenceFilter = filter('reference')
    if (referenceFilter) query['relatedServices.reference'] = { $regex: referenceFilter.value, $options: 'i' }

    const exchangeRateFilter = filter('exchangeRate')
    if (exchangeRateFilter) {
      const { from, to } = exchangeRateFilter.value
      query.exchangeRate = { $gte: Number(from), $lte: Number(to) }
    }

    const subtotalFilter = filter('subtotal')
    if (subtotalFilter) {
      const { from, to } = subtotalFilter.value
      query.subtotal = { $gte: Number(from), $lte: Number(to) }
    }

    const totalFilter = filter('total')
    if (totalFilter) {
      const { from, to } = totalFilter.value
      query.total = { $gte: Number(from), $lte: Number(to) }
    }

    return query
  }

  const getCfdi = async (cfdiId?: string): Promise<Cfdi | null> => Cfdis.findOne({ _id: cfdiId })

  const getCfdis = async (cfdiIds?: Array<string>): Promise<Array<Cfdi>> => Cfdis.find({ _id: { $in: cfdiIds } }).toArray()

  const getInvoice = async ({ invoiceId }: { invoiceId?: string }): Promise<Cfdi | null> =>
    Cfdis.findOne({ _id: invoiceId, cfdiType: 'invoice' })

  const saveLoginToken = async (params: { userId?: string; token: string }) => {
    const { userId, token } = params
    const hashedToken = bcrypt.hashSync(SHA256(token), 10)
    const filter = { _id: userId }
    const update = { $addToSet: { 'services.resume.loginTokens': { hashedToken, when: new Date() } } }
    await Users.updateOne(filter, update)
  }

  const saveUserSettings = async (params: { userId: string; settings: object }) => {
    const { userId, settings } = params
    const filter = { _id: userId }
    const update = { $set: { 'profile.settings': settings } }
    await Users.updateOne(filter, update)
  }

  const createInvoiceFromXmlJsonData = async (externalXmlAsJsonData: string, user: User) => {
    const data: any = R.pathOr(null, ['cfdi:Comprobante'], externalXmlAsJsonData)
    if (!data) throw new Error('Contenido de archivo XML no válido.')

    const comprobante = data.$
    if (comprobante.TipoDeComprobante !== 'I') throw new Error('Solo se pueden cargar comprobantes de ingreso (Facturas).')

    const issuer: any = R.pathOr(null, ['cfdi:Emisor', 0, '$'], data)
    const issuerCompany = await Companies.findOne({ rfc: issuer.Rfc })
    if (!issuerCompany) throw new Error('El emisor de la factura no se encuentra registrado en la aplicación.')

    const receiver: any = R.pathOr(null, ['cfdi:Receptor', 0, '$'], data)
    const isForeign = receiver && receiver.Rfc !== process.env.FOREIGN_RFC
    const receiverCompany = await Companies.findOne(isForeign ? { name: receiver.Nombre } : { rfc: receiver.Rfc })
    if (!receiverCompany) throw new Error(`El receptor de la factura ${receiver.Nombre} no se encuentra registrado en la aplicación.`)

    const concepts = data['cfdi:Conceptos']
    const taxes = data['cfdi:Impuestos'] // also have 'cfdi:Retenciones' and 'cfdi:Traslados'
    const complement: any = R.pathOr(null, ['cfdi:Complemento', 0, 'tfd:TimbreFiscalDigital', 0, '$'], data)

    const duplicatedByUuid = await Cfdis.findOne({ uuid: complement.UUID })
    if (duplicatedByUuid) throw new Error(`La factura con UUID ${complement.UUID} ya se encuentra registrada.`)

    const xmlItemsFromConcepts = (concept: any) => {
      const conceptData: any = R.pathOr(null, ['cfdi:Concepto', 0, '$'], concept)
      return conceptData
        ? {
            quantity: Number(conceptData.Cantidad),
            unit: conceptData.ClaveUnidad,
            description: getServiceName(conceptData.ClaveProdServ),
            unitValue: Number(conceptData.ValorUnitario),
            total: Number(conceptData.Importe),
          }
        : null
    }

    const taxesFromXmlTaxes = (tax: any) => {
      const ret: any = R.pathOr(null, ['cfdi:Retenciones', 0, 'cfdi:Retencion', 0, '$'], tax)
      const tras: any = R.pathOr(null, ['cfdi:Traslados', 0, 'cfdi:Traslado', 0, '$'], tax)

      const invoiceTaxes = []
      const invoiceTaxesTotals = []

      let retTotal = 0
      let transTotal = 0

      if (ret) {
        invoiceTaxes.push({
          name: getSatTaxName(ret.Impuesto) as string,
          type: 'withheld' as 'withheld' | 'transferred', // TODO: Solve this ugly casting
          total: Number(ret.Importe),
        })
        retTotal += Number(ret.Importe)
      }

      if (tras) {
        invoiceTaxes.push({
          name: getSatTaxName(tras.Impuesto) as string,
          type: 'transferred' as 'withheld' | 'transferred', // TODO: Solve this ugly casting
          total: Number(tras.Importe),
          rate: num(tras.TasaOCuota).times(100).val(),
        })
        transTotal += Number(tras.Importe)
      }

      if (retTotal > 0) {
        invoiceTaxesTotals.push({ name: 'withheldIva', value: retTotal })
      }
      if (transTotal > 0) {
        invoiceTaxesTotals.push({ name: 'transferredIva', value: transTotal })
      }

      return { taxes: invoiceTaxes, taxesTotals: invoiceTaxesTotals }
    }

    const invoice: Cfdi = {
      folio: 0, // TODO: The folio number must be set correctly
      createdBy: user._id,
      createdByUsername: user.username,
      status: 'active',
      cfdiType: 'invoice',
      createdAt: parseJSON(comprobante.Fecha),
      certNumber: comprobante.NoCertificado,
      paymentTerms: `${comprobante.FormaPago} - ${getPaymentTypeName(comprobante.FormaPago)}`,
      paymentMethod: `${comprobante.MetodoPago} - ${getPaymentMethodName(comprobante.MetodoPago)}`,
      expeditionPlace: comprobante.LugarExpedicion,
      currency: `${comprobante.Moneda} - ${getCurrencyName(comprobante.Moneda)}`,
      shortCurrency: comprobante.Moneda,
      subtotal: Number(comprobante.SubTotal),
      total: Number(comprobante.Total),
      issuer: {
        id: issuerCompany._id.toString(),
        fiscalRegime: `${issuer.RegimenFiscal} - ${getFiscalRegimeName(issuer.RegimenFiscal)}`,
        rfc: issuer.Rfc,
        name: issuer.Nombre,
        address: issuerCompany.address,
        phone: issuerCompany.phoneNumber || '',
      },
      receiver: {
        id: receiverCompany._id.toString(),
        rfc: receiver.Rfc,
        name: receiver.Nombre,
        address: receiverCompany.address,
        // TODO: Add cfdiUse and foreignFiscalId
      },
      uuid: complement.UUID,
      cfdiSign: complement.SelloCFD,
      satCertNumber: complement.NoCertificadoSAT,
      satSign: complement.SelloSAT,
      cfdiSignDate: new Date(), // TODO: Get correct date from XML data
      loadDateTime: new Date(),
      items: concepts.map(xmlItemsFromConcepts),
      ...taxesFromXmlTaxes(taxes ? taxes[0] : []), // taxes and taxesTotals
      pendingAmount: Number(comprobante.Total),
      sourceXmlDocumentId: '', // TODO: implementation of 'attachedFiles' collection pending
      payedAmount: 0,
      deliveryStatus: 'sent',
    }

    // Optional fields
    if (comprobante.Folio) invoice.folio = comprobante.Folio
    if (comprobante.TipoCambio) invoice.exchangeRate = comprobante.TipoCambio

    return invoice
  }

  interface SaveExternalInvoiceParams {
    invoiceXmlAsJson: any
    orderReference: string
    user: User
  }

  const saveExternalInvoice = async ({ invoiceXmlAsJson, orderReference, user }: SaveExternalInvoiceParams) => {
    const invoice = await createInvoiceFromXmlJsonData(invoiceXmlAsJson, user)

    const invoiceToInsert: any = {
      ...invoice,
      createdBy: user._id,
      createdByUsername: user.username,
      loadDateTime: new Date(),
    }

    if (orderReference) {
      const order = await ShipmentOrders.findOne({ reference: orderReference })
      if (!order) throw new Error(`Orden con referencia ${orderReference} no encontrada.`)

      if (order.cfdis) {
        // TODO: This validation must be updated to check the owed value of the order, and allow the link between the
        // order and the invoice if the owed value is greater or equal to the invoice total
        const msg = `La orden con referencia ${orderReference} ya tiene una o más facturas asociadas.`
        throw new Error(msg)
      }
      invoiceToInsert.relatedServices = [{ id: order._id, reference: orderReference }]
    }

    const { insertedId }: { insertedId: any } = await Cfdis.insertOne(invoiceToInsert)

    // TODO: Update to validate that the order is not fully payed and the pending amount is greater
    //   than the imported invoice total
    if (orderReference) {
      const orderInvoice = { id: insertedId, uuid: invoice.uuid, folio: invoice.folio, total: invoice.total }
      await ShipmentOrders.updateOne({ reference: orderReference }, { $push: { invoices: orderInvoice } })
    }

    // TODO: APP LOGS IMPLEMENTATION - EXTERNAL INVOICE LOADING PROCESS IS PENDING.
    // LOADED CFDIS CAN BE RELATED TO MULTIPLE SERVICES. COMPLETE REDESIGN REQUIRED.
    // const eventDetails = { invoiceId, invoiceNumber: invoice.Folio || '' }
    // const eventDetails = {
    //   invoiceId: insertedId,
    //   invoiceNumber: invoice.Folio || '',
    //   shipmentOrderId: [order._id || ''],
    // }
    // Meteor.call('eventLogs.add', 'invoices.loadFromXml', eventDetails, user)
  }

  const setCompanyHaveCsd = async ({ rfc, haveCsd }: { rfc: string; haveCsd: boolean }) => {
    await Companies.updateOne({ rfc }, { $set: { haveCsd } })
  }

  const getUserCurrentCompany = ({ user }: { user: User }) => Companies.findOne({ _id: user.profile.companyId })

  const getAttachedFileById = (attachedFileId: string) => AttachedFiles.findOne({ _id: attachedFileId })

  const attachCfdiBase64Xml = async ({ cfdiId, xmlDocument }: { cfdiId: string; xmlDocument: string }) => {
    const { insertedId }: { insertedId: any } = await AttachedFiles.insertOne({
      createdAt: new Date(),
      type: 'base64',
      base64Data: xmlDocument,
      ext: 'xml',
      size: xmlDocument.length,
    })
    await Cfdis.updateOne({ _id: cfdiId }, { $set: { xmlDocumentId: insertedId } })
  }

  const getCompany = async ({ companyId, fields = {} }: { companyId: string; fields?: { [key: string]: number } }) => {
    return Companies.findOne({ _id: companyId }, { projection: fields })
  }

  const getShipment = async ({ shipmentId }: { shipmentId: string }) => ShipmentOrders.findOne({ _id: shipmentId })

  const getShipments = async ({ shipmentIds }: { shipmentIds: Array<string> }) =>
    ShipmentOrders.find({ _id: { $in: shipmentIds } }).toArray()

  const setCompanySigningCfdi = async (companyId: string, isSigningCfdi: boolean) => {
    const company = await getCompany({ companyId })
    // Fail if the company is already signing a CFDI
    if (isSigningCfdi && company && company.isSigningCfdi) return false
    const { modifiedCount } = await Companies.updateOne({ _id: companyId }, { $set: { isSigningCfdi } })
    return modifiedCount === 1
  }

  const getNextCfdiNumber = async ({ companyId, cfdiType }: { cfdiType: CfdiType; companyId: string }) => {
    const company = await getCompany({ companyId })
    if (!company) return null
    if (company.isSigningCfdi) return null

    const { initialInvoiceNumber, initialCreditNoteNumber, initialPaymentProofNumber } = company
    const { lastInvoiceNumber, lastCreditNoteNumber, lastPaymentProofNumber } = company
    let nextNumber = null

    if (cfdiType === 'invoice') nextNumber = Number(lastInvoiceNumber) + 1 || parseInt(initialInvoiceNumber as string, 10) || 1

    if (cfdiType === 'creditNote') nextNumber = Number(lastCreditNoteNumber) + 1 || parseInt(initialCreditNoteNumber as string, 10) || 1

    if (cfdiType === 'paymentProof')
      nextNumber = Number(lastPaymentProofNumber) + 1 || parseInt(initialPaymentProofNumber as string, 10) || 1

    return nextNumber
  }

  type saveCfdiSentToSignParams = { user: User; clientParams: any; sentCfdi: any; signedCfdi: any; signError: any }

  const saveCfdiSentToSign = async (params: saveCfdiSentToSignParams) => {
    const { user, clientParams, sentCfdi, signedCfdi, signError } = params
    const { _id: createdBy, username: createdByUsername } = user
    const document = { createdAt: new Date(), createdBy, createdByUsername, clientParams, sentCfdi, signedCfdi }
    // const { result, insertedId } = await SentCfdis.insertOne(signError ? { ...document, signError } : document)
    // return result.ok ? (insertedId as string) : null
    const { acknowledged, insertedId } = await SentCfdis.insertOne(signError ? { ...document, signError } : document)
    return acknowledged ? (insertedId.toString() as string) : null
  }

  /** Update payed amount, pending amount and status on invoices related to a payment proof */
  const updateCfdiBalance = async (cfdiId: string, amountPaid: number) => {
    const queryResult = await Cfdis.findOneAndUpdate(
      { _id: cfdiId, cfdiType: 'invoice' },
      { $inc: { payedAmount: amountPaid, pendingAmount: -amountPaid } },
      { returnDocument: 'after' }
      // { returnOriginal: false }
    )
    if (queryResult) {
      const { ok, value } = queryResult
      if (ok && value) {
        let status: CfdiStatus = (value.total as number) - amountPaid > 0 ? 'partiallyPayed' : 'payed'
        if (value.payedAmount === 0) status = 'active'
        await Cfdis.updateOne({ _id: cfdiId, cfdiType: 'invoice' }, { $set: { status } })
      }
    }
  }

  /** Create denormalized data for a new CFDI on 'relatedCfdis' field of related CFDIs */
  const addDenormalizedRelatedCfdis = async (cfdi: Cfdi) => {
    const { relatedCfdis } = cfdi

    if (!relatedCfdis) return

    if (['invoice', 'creditNote'].includes(cfdi.cfdiType)) {
      const denormalizedCfdi: CfdiRelatedCfdi = {
        id: cfdi._id,
        uuid: cfdi.uuid,
        type: cfdi.cfdiType,
        status: cfdi.status,
        folio: cfdi.folio,
        createdAt: cfdi.createdAt,
        currency: cfdi.currency as string,
        exchangeRate: cfdi.exchangeRate,
        total: cfdi.total,
      }
      const relatedCfdiIds = relatedCfdis.map(({ id }) => id).filter(Boolean)
      await Cfdis.updateMany({ _id: { $in: relatedCfdiIds } }, { $addToSet: { relatedCfdis: denormalizedCfdi } })
    } else if (cfdi.cfdiType === 'paymentProof') {
      await Promise.all(
        relatedCfdis.map(async ({ id, amountPaid, previousBalanceAmount, partialityNumber, paymentMethod }) => {
          const denormalizedCfdi: CfdiRelatedCfdi = {
            id: cfdi._id,
            uuid: cfdi.uuid,
            type: cfdi.cfdiType,
            status: cfdi.status,
            folio: cfdi.folio,
            createdAt: cfdi.createdAt,
            previousBalanceAmount: previousBalanceAmount,
            amountPaid: amountPaid,
            partialityNumber: partialityNumber,
            paymentMethod: paymentMethod,
          }
          await Cfdis.updateOne({ _id: id }, { $addToSet: { relatedCfdis: denormalizedCfdi } })

          if (!amountPaid) return
          await updateCfdiBalance(id, amountPaid)
        })
      )
    }
  }

  /** Update quotations of each service related to the specified cfdi */
  const updateRelatedServices = async (cfdiId: string) => {
    const cfdi = await Cfdis.findOne({ _id: cfdiId })
    if (!cfdi) return

    if (cfdi.cfdiType === 'invoice') {
      if (!cfdi.items) return
      // Update related service (shipment order) quotations
      await Promise.all(
        cfdi.items.map(async ({ service, id: cfdiItemId }) => {
          if (!service) return
          const relatedCfdiInfo = { id: cfdi._id, itemId: cfdiItemId, status: cfdi.status, folio: cfdi.folio }
          const modifier = { $set: { 'quotations.$.relatedCfdi': relatedCfdiInfo } }
          await ShipmentOrders.updateOne({ 'quotations.id': service.quotationId }, modifier)

          // If the invoice was canceled, create a new quotation to replace the canceled related quotation
          if (cfdi.status === 'canceled') {
            const { quotations } = (await getShipment({ shipmentId: service.id })) as ShipmentOrder
            const { relatedCfdi, ...newQuotation } = quotations!.find(({ id }) => id === service.quotationId) as any
            const addQuotationModifier = { $addToSet: { quotations: { ...newQuotation, id: getNewId() } } }
            await ShipmentOrders.updateOne({ _id: service?.id }, addQuotationModifier)
          }
        })
      )
    } else if (cfdi.cfdiType === 'creditNote') {
      if (!cfdi.items) return
      // Create quotations with negative values into related services
      await Promise.all(
        cfdi.items.map(async item => {
          if (!item.service) return
          // Just update the status if the negative quotation already exists.
          const { modifiedCount } = await ShipmentOrders.updateOne(
            { 'quotations.relatedCfdi.itemId': item.id },
            { $set: { 'quotations.$.relatedCfdi.status': cfdi.status } }
          )
          // Create negative quotation if the previous operation don't succeed
          if (modifiedCount === 0) {
            const haveTax = Boolean(item.taxes && item.taxes?.find(t => t.isRetention === false))
            const tax = haveTax ? (item.taxes && item.taxes?.find(t => t.isRetention === false)?.value) || 0 : 0
            const haveIvaRet = Boolean(item.taxes && item.taxes?.find(t => t.isRetention === true))
            const ivaRet = haveIvaRet ? (item.taxes && item.taxes?.find(t => t.isRetention === true)?.value) || 0 : 0
            const negativeQuotation: ShipmentOrderQuotation = {
              id: getNewId(),
              productCode: item.productCode,
              description: getServiceName(item.productCode),
              unit: item.unit,
              quantity: item.quantity,
              unitValue: item.unitValue,
              currency: cfdi.shortCurrency as string,
              haveTax,
              tax,
              haveIvaRet,
              ivaRet,
              taxesTotal: tax - ivaRet,
              subtotal: item.subtotal,
              total: -item.total,
              relatedCfdi: { id: cfdi._id.toString(), itemId: item.id, status: 'active', folio: cfdi.folio },
            }
            const modifier = { $addToSet: { quotations: negativeQuotation } }
            await ShipmentOrders.updateOne({ _id: item.service?.id }, modifier)
          }
        })
      )
    } else if (cfdi.cfdiType === 'paymentProof') {
      // Update de status of quotations of invoices payed on the payment proof.
      if (cfdi.relatedCfdis) {
        await Promise.all(cfdi.relatedCfdis.map(async ({ id }) => updateRelatedServices(id)))
      }
    }
  }

  const saveNewPlace = async (place: Place) => {
    const { acknowledged, insertedId } = await Places.insertOne(place)
    // console.log(result)
    return acknowledged ? { name: place.name?.toString(), _id: insertedId } : null
  }

  const saveNewCompany = async (company: any, user: User) => {
    const preparedCompany = { ...company, createdAt: new Date(), createdBy: user }
    const { acknowledged, insertedId } = await Companies.insertOne(preparedCompany)
    return acknowledged ? { name: company.name?.toString(), _id: insertedId } : null
  }

  const saveNewVehicle = async (vehicle: any, user: User) => {
    const preparedVehicle = { ...vehicle, createdAt: new Date(), createdBy: user }
    const { acknowledged, insertedId } = await Vehicles.insertOne(preparedVehicle)
    // console.log('result in save vehicle to db: ', result, insertedId)
    return acknowledged ? { name: vehicle.name?.toString(), _id: insertedId } : null
  }

  const saveNewDriver = async (driver: any, user: User) => {
    const preparedDriver = { ...driver, createdAt: new Date(), createdBy: user }
    const { acknowledged, insertedId } = await Drivers.insertOne(preparedDriver)
    // console.log('result in save driver to db: ', result, insertedId)
    return acknowledged ? { name: driver.name?.toString(), _id: insertedId } : null
  }

  const saveNewProduct = async (product: any, user: User) => {
    const preparedProduct = { ...product, createdAt: new Date(), createdBy: user }
    const { acknowledged, insertedId } = await Products.insertOne(preparedProduct)
    // console.log('result in save driver to db: ', result, insertedId)
    return acknowledged ? { name: product.description?.toString(), _id: insertedId } : null
  }

  const saveCfdi = async ({ cfdi, sentCfdiId }: { cfdi: Cfdi; sentCfdiId: string | null }) => {
    const { acknowledged, insertedId: cfdiId } = await Cfdis.insertOne(cfdi)
    await addDenormalizedRelatedCfdis({ _id: cfdiId, ...cfdi })
    await updateRelatedServices(cfdiId.toString())
    // Update the company lastInvoiceNumber, lastCreditNoteNumber or lastPaymentProofNumber
    const lastNumberFieldByCfdiType = {
      invoice: 'lastInvoiceNumber',
      creditNote: 'lastCreditNoteNumber',
      paymentProof: 'lastPaymentProofNumber',
    }
    // const setParameters = {[lastNumberFieldByCfdiType[cfdi.cfdiType]] : cfdi.folio.toString() }
    // await Companies.updateOne({ _id: cfdi.issuer.id }, { $set: setParameters })

    if (cfdi.cfdiType === 'invoice') {
      await Companies.updateOne({ _id: cfdi.issuer.id }, { $set: { lastInvoiceNumber: cfdi.folio } })
    }
    if (cfdi.cfdiType === 'creditNote') {
      await Companies.updateOne({ _id: cfdi.issuer.id }, { $set: { lastCreditNoteNumber: cfdi.folio } })
    }
    if (cfdi.cfdiType === 'paymentProof') {
      await Companies.updateOne({ _id: cfdi.issuer.id }, { $set: { lastPaymentProofNumber: cfdi.folio } })
    }
    // Link the data sent and received to the API (SentCfdis collection) with the newly created CFDI
    await SentCfdis.updateOne({ _id: sentCfdiId }, { $set: { createdCfdiId: cfdiId } })
    return acknowledged ? cfdiId.toString() : null
  }

  type addCancelRequestToCfdiParams = {
    cfdiId: string
    user: User | undefined
    requestDate: Date
    cancelDate: Date
    cancelResultMessage: string
  }
  const addCfdiCancelRequest = async (params: addCancelRequestToCfdiParams) => {
    const { cfdiId, user, cancelDate, requestDate, cancelResultMessage } = params
    const { _id: userId = undefined, username = undefined } = user || {}
    const cfdiModifier = {
      $push: {
        cancelRequests: {
          userId: userId,
          username,
          requestDate,
          status: (cancelDate ? 'canceled' : 'pending') as 'canceled' | 'pending',
          message: cancelResultMessage,
        },
      },
    }
    await Cfdis.updateOne({ _id: cfdiId }, cfdiModifier)
  }

  const updateCfdiDiscountedStatus = async (cfdiId: string, status: CfdiStatus) => {
    const modifier: any = { $set: { status: status } }
    const cfdiBefore = await Cfdis.findOne({ _id: cfdiId })
    if (cfdiBefore && cfdiBefore.cfdiType === 'invoice') {
      await Cfdis.updateOne({ _id: cfdiId }, modifier)
    }
  }

  const setCfdiAsCanceled = async (cfdiId: string, cancelDate: Date, pending?: boolean) => {
    const modifier: any = { $set: { canceledAt: cancelDate, status: pending ? 'cancelPending' : 'canceled' } }
    const cfdiBefore = await Cfdis.findOne({ _id: cfdiId })
    if (cfdiBefore && cfdiBefore.cfdiType === 'invoice') modifier.$set.pendingAmount = 0
    await Cfdis.updateOne({ _id: cfdiId }, modifier)
    const cfdi = await Cfdis.findOne({ _id: cfdiId })
    if (!cfdi) return

    if (cfdi.cfdiType === 'paymentProof') {
      const { relatedCfdis = [] } = cfdi
      Promise.all(relatedCfdis.map(async ({ id, amountPaid }) => updateCfdiBalance(id, -(amountPaid as number))))
    }
    await updateRelatedServices(cfdiId)
  }

  const eventLogTypes = {
    createCfdi: { name: 'cfdis.create', category: 'operative' } as EventLogType,
    cancelCfdi: { name: 'cfdi.cancel', category: 'operative' } as EventLogType,
    userDisable: { name: 'user.disable', category: 'userManagement' } as EventLogType,
    userEnable: { name: 'user.enable', category: 'userManagement' } as EventLogType,
    userDelete: { name: 'user.delete', category: 'userManagement' } as EventLogType,
    // 'shipmentOrder.created': { name: 'shipmentOrder.created', category: 'operative' },
    // 'shipmentOrder.updateOwner': { name: 'shipmentOrder.updateOwner', category: 'administrative' },
    // 'shipmentOrder.toggleCancel': { name: 'shipmentOrder.toggleCancel', category: 'operative' },
    // 'shipmentOrder.toggleCompleted': { name: 'shipmentOrder.toggleCompleted', category: 'operative' },
    // 'shipmentOrder.addQuotationRow': { name: 'shipmentOrder.addQuotationRow', category: 'operative' },
    // 'shipmentOrder.removeQuotationRow': { name: 'shipmentOrder.removeQuotationRow', category: 'operative' },
    // 'invoices.createDraft': { name: 'invoices.createDraft', category: 'operative' },
    // 'invoices.loadFromXml': { name: 'invoices.loadFromXml', category: 'operative' },
    // 'creditNote.createFromInvoice': { name: 'creditNote.createFromInvoice', category: 'operative' },
    // 'orderTemplates.updateFromOrder': { name: 'orderTemplates.updateFromOrder', category: 'operative' },
  }

  const getLastEventLog = async (): Promise<EventLog> => {
    const lastEvent = await EventLogs.findOne({}, { sort: { number: -1 } })
    if (lastEvent !== null)
      // @ts-ignore
      return lastEvent
    const originHash = SHA256(JSON.stringify({}))
    return { _id: getNewId(), number: 0, createdAt: new Date(), hash: originHash, event: null }
  }

  /**
   * Insert a new event log in the database.
   * @param eventLogType Event log type name
   * @param eventLogDetails Object containing the specific data related to the event log type.
   */
  const addEventLog = async (eventLogType: EventLogType, eventLogDetails: any, user: User) => {
    const { hash: previousHash, number } = await getLastEventLog()
    const eventLog: EventLog = {
      _id: getNewId(),
      number: number + 1,
      createdAt: new Date(),
      event: { ...eventLogType, ...eventLogDetails },
      user: { id: user._id, username: user.username, role: user.profile.userType },
      hash: '',
    }
    eventLog.hash = SHA256(JSON.stringify({ ...eventLog, previousHash }))

    // TODO: Chain verification method.
    //  Run as a test to ensure the integrity of the chain
    await EventLogs.insertOne(eventLog, { writeConcern: { w: 0 } })
  }

  const attachPdfToCfdi = async (cfdiId: string, file: AttachedFile) => {
    const { insertedId } = await AttachedFiles.insertOne(file)
    await Cfdis.updateOne({ _id: cfdiId }, { $set: { pdfDocumentId: insertedId.toString(), pdfDocumentUrl: file.url } })
  }

  const attachCfdiBase64CancelXml = async ({ cfdiId, xmlDocument }: { cfdiId: string; xmlDocument: string }) => {
    const { insertedId }: { insertedId: any } = await AttachedFiles.insertOne({
      createdAt: new Date(),
      type: 'base64',
      base64Data: xmlDocument,
      ext: 'xml',
      size: xmlDocument.length,
    })
    await Cfdis.updateOne({ _id: cfdiId }, { $set: { cancelXmlDocumentId: insertedId } })
  }

  const getCancelPendingCfdis = async () => Cfdis.find({ status: 'cancelPending' }).toArray()

  const getBusinessRelationship = async (
    relationshipType: RelationshipType,
    companyId: string,
    companyRole: RelationshipCompanyRole,
    relatedCompanyId: string,
    fields: { [key: string]: number } = {}
  ) => {
    const selector = {
      relationshipType,
      $and: [
        { companies: { $elemMatch: { companyId, role: companyRole } } },
        { companies: { $elemMatch: { companyId: relatedCompanyId } } },
      ],
    }
    return BusinessRelationships.findOne(selector, { projection: fields })
  }

  const getServiceRelationship = async (providerCompanyId: string, clientCompanyId: string, fields?: { [key: string]: number }) =>
    getBusinessRelationship('service', providerCompanyId, 'serviceProvider', clientCompanyId, fields)

  const getBusinessRelationships = async (
    relationshipType: RelationshipType,
    companyId: string,
    companyRole: RelationshipCompanyRole,
    fields: { [key: string]: number } = {}
  ) => {
    const selector = { relationshipType, $and: [{ companies: { $elemMatch: { companyId, role: companyRole } } }] }
    return BusinessRelationships.find(selector).project(fields).toArray()
  }

  type getCompanyClientsParams = { providerCompanyId: string; fields: { [key: string]: number } }

  const getCompanyClients = async ({ providerCompanyId, fields = {} }: getCompanyClientsParams) => {
    const relations = await getBusinessRelationships('service', providerCompanyId, 'serviceProvider', { _id: 1, companies: 1 })

    const clientsIds = relations
      .flatMap(({ companies }) => companies)
      .filter(({ companyId }) => companyId !== providerCompanyId)
      .map(({ companyId }) => companyId)
    return Companies.find({ _id: { $in: clientsIds } })
      .project(fields)
      .sort({ name: 1 })
      .toArray()
  }

  const setCfdiDeliveryStatus = async (cfdiId: string, deliveryStatus: CfdiDeliveryStatus) => {
    Cfdis.updateOne({ _id: cfdiId }, { $set: { deliveryStatus } })
  }

  const saveEmailMessage = async (sentEmailToSave: EmailMessage) => {
    const { acknowledged, insertedId: cfdiId } = await EmailMessages.insertOne(sentEmailToSave)
    return acknowledged ? cfdiId.toString() : null
  }

  const addCfdiDeliveryEmails = async (cfdiId: string, sentEmailsIds: Array<string>) => {
    Cfdis.updateOne({ _id: cfdiId }, { $set: { deliveryEmails: sentEmailsIds } })
  }

  const getBillingPendingServices = async (companyId: string, clientId: string, fields: { [key: string]: number } = {}) => {
    const selector = {
      companyId,
      clientId,
      cancelled: { $ne: true },
      quotations: { $exists: true, $elemMatch: { relatedCfdi: { $exists: false } } },
    }
    return ShipmentOrders.find(selector).project(fields).toArray()
  }

  const saveExchangeRate = async (rate: CurrencyRate) => {
    CurrencyRates.insertOne(rate)
  }

  const getExchangeRate = async (date: Date, fromCurrency: string, toCurrency: string) => {
    const currencyRatesOnDate = await CurrencyRates.findOne({ date, base: fromCurrency })
    if (currencyRatesOnDate) {
      const rate = currencyRatesOnDate.rates[toCurrency]
      if (rate) return rate
    }
    return null
  }

  // TODO: Migrate image files to store on Digital Ocean Spaces
  const getCompanyLogoUrl = async (logoId: string) => {
    if (!logoId) return ''
    const logo: any = await db.collection('cfs.companyLogos.filerecord').findOne({ _id: logoId })
    const { key } = logo?.copies?.companyLogos ?? {}
    return key ? `https://app.leanflow.ai/cfs/files/${key.replace('-', '/')}` : ''
  }

  const getUserCurrentCompanyId = (user: User) => user.profile?.companyId

  const getCompanyParent = async (company: Company) => Companies.findOne({ _id: company.parentCompanyId })

  /**
   * Retrieve the main company of the user, even if it have selected a child company.
   * The current company can be a child: this will find parent and then all childs.
   */
  const getUserMainCompany = async (user: User) => {
    const userCurrentCompanyId = getUserCurrentCompanyId(user)
    if (!userCurrentCompanyId) return null
    const currentCompany = await Companies.findOne({ _id: userCurrentCompanyId })
    if (!currentCompany) return null
    const parentCompany = await getCompanyParent(currentCompany)
    return parentCompany ?? currentCompany
  }

  /** Array of companies where the current user take part, that includes the user main company and its children. */
  const getAllUserCompanies = async (user: User, fields: { [key: string]: number } = {}) => {
    const company = await getUserMainCompany(user)
    if (!company) return []
    return Companies.find({ $or: [{ _id: company._id }, { parentCompanyId: company._id.toString() }] })
      .project(fields)
      .sort({ name: 1 })
      .toArray()
  }

  type getCfdiListParams = {
    user: User
    filters?: any[]
    searchText?: string
    skip?: number
    from?: string
    to?: string
    cfdiType?: string
    cfdiStatus?: string
    cfdiClients?: string
  }

  const getCfdiList = async (params: getCfdiListParams) => {
    const { user, filters = [], searchText = '', skip = 0, from, to, cfdiType, cfdiStatus, cfdiClients } = params
    if (!user) return Promise.resolve({ cfdis: [], count: 0 })
    const companies = await getAllUserCompanies(user, { _id: 1 })
    const issuersIds = companies.map(({ _id }) => _id)
    const pageSize = 50
    const selector = createCfdiListQuery(issuersIds, filters, searchText, from, to, cfdiType, cfdiStatus, cfdiClients)

    // TODO: RETURN ONLY REQUIRED FIELDS!!! ADD "fields" PARAMETER TO "getCfdiListParams"
    const cfdis = await Cfdis.find(selector)
      .skip(skip)
      // TODO: IMPLEMENTATION PENDING: INFINITE SCROLL FOR CFDIS LIST
      // .limit(pageSize)
      .project({ pdfData: 0, xmlData: 0 })
      .sort({ createdAt: -1 })
      .toArray()
    const count = await Cfdis.find(selector).count()

    return Promise.resolve({ cfdis, count })
  }

  const saveCfdiDraft = async (cfdi: any) => {
    await CfdiDrafts.insertOne(cfdi)
  }

  const getCfdiDraftsByBoLHId = async (id: string) => {
    return CfdiDrafts.find({ BoLHId: id }).toArray()
  }
  const findCfdis = async (searchText: string) => {
    const searchTextRegex = { $regex: searchText, $options: 'i' }
    const searchTextNumber = !Number.isNaN(Number(searchText)) ? Number(searchText) : Number.NaN
    return Cfdis.find({
      $or: [
        { folio: searchTextNumber },
        { total: searchTextNumber },
        { 'receiver.name': searchTextRegex },
        { 'issuer.name': searchTextRegex },
      ],
    }).toArray()
  }

  const getPaymentProofPendingInvoices = async (companyId: string, clientId: string, fields: { [key: string]: number } = {}) => {
    const selector = {
      cfdiType: 'invoice' as CfdiType,
      'issuer.id': companyId,
      'receiver.id': clientId,
      pendingAmount: { $gt: 0 },
      cancelled: { $ne: true },
    }
    return Cfdis.find(selector).project(fields).toArray()
  }

  const getAllUserClients = async (user: User, fields: { [key: string]: number } = {}) => {
    const companies = await getAllUserCompanies(user, { _id: 1 })
    const companiesIds = companies.map(({ _id }) => _id)
    let repeatClients: any[] = []
    // TODO: FIX
    // eslint-disable-next-line no-restricted-syntax
    for await (const companyId of companiesIds) {
      const providerCompanyId = companyId
      const clientsArray = await getCompanyClients({ providerCompanyId, fields })
      // repeatClients = clientsArray
      repeatClients = repeatClients.concat(clientsArray)
    }
    // @ts-ignore
    const clients = repeatClients.reduce((unique, item) => {
      // @ts-ignore
      return unique.some(o => o._id === item._id) ? unique : [...unique, item]
    }, [])
    return clients
  }

  async function createCachedPositionInfo(lat: number, lng: number, result: any) {
    await InverseGeocodingCache.insertOne({ createdAt: new Date(), lat, lng, result })
  }

  async function getCachedPositionInfo(lat: number, lng: number) {
    const buildGpsRangeQuery = (precision: number, value: number) => {
      const precisionVariation = 10 ** -precision
      return { $gt: value - precisionVariation / 2, $lt: value + precisionVariation / 2 }
    }
    const selector = { 'result.status': 'OK', lat: buildGpsRangeQuery(3, lat), lng: buildGpsRangeQuery(3, lng) }
    const positionInfo = await InverseGeocodingCache.find(selector).sort({ createdAt: -1 }).limit(1).toArray()
    return positionInfo[0]
  }

  async function getCompaniesWithGpsTracking() {
    return Companies.find({ gpsApi: { $exists: true }, disabled: { $ne: true } })
      .project({ name: 1, gpsApi: 1 })
      .toArray()
  }

  async function createCompanyVehicle(companyId: string, vehicleNumber: string) {
    await Vehicles.insertOne({ companyId, number: vehicleNumber, createdAt: new Date() })
  }

  async function getCompanyVehicle(companyId: string, vehicleNumber: string) {
    return Vehicles.findOne({ companyId, number: vehicleNumber })
  }

  async function updateVehicleLocationInfo(number: string, companyId: string, providerId: string, locationInfo: any) {
    // "foundOnGpsApi" used to show an indicator of vehicles with gps api information.
    await Vehicles.updateOne(
      { number, companyId },
      { $set: { [`gpsInfo.${providerId}`]: locationInfo, foundOnGpsApi: true, lastUpdateAt: new Date() } }
    )
  }

  const getUsersList = async (user: User) => {
    if (!user) return Promise.resolve({ users: [], count: 0 })
    const companies = await getAllUserCompanies(user, { _id: 1 })
    const companiesIds = companies.map(({ _id }) => _id)
    const pageSize = 50
    const selector = { 'profile.companyId': { $in: companiesIds } }

    // TODO: RETURN ONLY REQUIRED FIELDS!!! ADD "fields" PARAMETER TO "getCfdiListParams"
    const users = await Users.find(selector)
      // .skip(skip)
      // TODO: IMPLEMENTATION PENDING: INFINITE SCROLL FOR CFDIS LIST
      // .limit(pageSize)
      .project({ services: 0 })
      .sort({ username: 1 })
      .toArray()
    const count = await Users.find(selector).count()

    return Promise.resolve({ users, count })
  }

  // Places services. SAT Address Codification
  // const getPostalCodeDetails = async (postalCode: string, countryCodeO?: string) => {
  //   const filter = { postalCode: postalCode }
  //   // console.log(`arrived to getPostalCodeDetails process with variables: ${postalCode}, ${countryCodeO} and filter: ${filter}`)
  //   // const fields: any = { stateCode: 1, municipalityCode: 1, localityCode: 1, countryCode: 1 }
  //   const results = await satPostalCodes.find(filter)
  //   // const { stateCode, municipalityCode, localityCode, countryCode } = results
  //   // console.log(results)
  //   return results
  // }

  const getPostalCodeDetails = async (postalCode: string, countryCode?: string) => {
    try {
      const result = await SatPostalCodes.findOne({ postalCode, countryCode })
      if (!result) {
        // console.log('No results found')
        return 'No results found'
      }
      return result
    } catch (err) {
      // console.log(err)
      return `Error: ${err}`
    }
  }

  const getState = async (stateCode: string, countryCode?: string) => {
    return SatStates.findOne({ key: stateCode, countryCode: countryCode })
  }

  const getLocality = async (localityCode: string, stateCode: string) => {
    return stateCode ? SatLocalities.findOne({ key: localityCode, stateCode }) : null
  }

  const getMunicipality = async (municipalityCode: string, stateCode: string) => {
    return stateCode ? SatMunicipalities.findOne({ key: municipalityCode, stateCode }) : null
  }

  const getCountry = async (countryCode: string | string[]) => {
    return SatCountries.findOne({ key: countryCode })
  }

  const getSuburbsList = async (postalCode: string | string[]) => {
    return SatSuburbs.find({ postalCode }).toArray()
  }

  const getLocalitiesList = async (stateCode: string | string[]) => {
    return SatLocalities.find({ stateCode }).toArray()
  }

  const getMunicipalitiesList = async (stateCode: string | string[]) => {
    return SatMunicipalities.find({ stateCode }).toArray()
  }

  const getStatesList = async (countryCode: string | string[]) => {
    return SatStates.find({ countryCode }).toArray()
  }

  const searchPlaces = async (searchText: string | string[]) => {
    return Places.aggregate([
      { $match: { $or: [{ name: { $regex: searchText, $options: 'i' } }, { formattedAddress: { $regex: searchText, $options: 'i' } }] } },
      { $sort: { name: 1 } },
      { $project: { name: 1, formattedAddress: 1, satAddress: 1, geolocation: 1 } },
    ]).toArray()
  }

  const searchCompanies = async (searchText: string | string[]) => {
    return Companies.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: searchText, $options: 'i' } },
            { comercialName: { $regex: searchText, $options: 'i' } },
            { rfc: { $regex: searchText, $options: 'i' } },
          ],
        },
      },
      { $sort: { name: 1, comercialName: 1 } },
      { $project: { name: 1, comercialName: 1, rfc: 1, foreignFiscalId: 1, country: 1 } },
    ]).toArray()
  }

  const searchVehicles = async (searchText: string | string[], companyId: string, type: string) => {
    if (type !== 'any')
      return Vehicles.aggregate([
        {
          $match: {
            companyId: companyId,
            type: type,
            $or: [
              { number: { $regex: searchText, $options: 'i' } },
              { plateNumber: { $regex: searchText, $options: 'i' } },
              { satType: { $regex: searchText, $options: 'i' } },
            ],
          },
        },
        { $sort: { number: 1, plateNumber: 1 } },
        {
          $project: {
            number: 1,
            plateNumber: 1,
            type: 1,
            companyId: 1,
            active: 1,
            modelYear: 1,
            typeOfVehicleSAT: 1,
            SCTPermitNumber: 1,
            SCTPermit: 1,
            insurance: 1,
            typeOfTrailerSAT: 1,
          },
        },
        { $limit: 20 },
      ]).toArray()
    return Vehicles.aggregate([
      {
        $match: {
          companyId: companyId,
          $or: [
            { number: { $regex: searchText, $options: 'i' } },
            { plateNumber: { $regex: searchText, $options: 'i' } },
            { satType: { $regex: searchText, $options: 'i' } },
          ],
        },
      },
      { $sort: { number: 1, plateNumber: 1 } },
      {
        $project: {
          number: 1,
          plateNumber: 1,
          type: 1,
          companyId: 1,
          active: 1,
          modelYear: 1,
          typeOfVehicleSAT: 1,
          SCTPermitNumber: 1,
          SCTPermit: 1,
          insurance: 1,
          typeOfTrailerSAT: 1,
        },
      },
      { $limit: 20 },
    ]).toArray()
  }

  const searchDrivers = async (searchText: string | string[], companyId: string) => {
    return Drivers.aggregate([
      {
        $match: {
          companyId: companyId,
          $or: [
            { name: { $regex: searchText, $options: 'i' } },
            { document: { $regex: searchText, $options: 'i' } },
            { rfc: { $regex: searchText, $options: 'i' } },
          ],
        },
      },
      { $sort: { name: 1, document: 1, rfc: 1 } },
      {
        $project: {
          rfc: 1,
          document: 1,
          name: 1,
          foreignFiscalId: 1, // En caso de que RFCFigura sea XEXX010101000
          countryOfResidence: 1, // En caso de que RFCFigura sea XEXX010101000
          address: 1,
          companyId: 1,
          email: 1,
          phoneNumber: 1,
        },
      },
      { $limit: 20 },
    ]).toArray()
  }

  const searchProducts = async (searchText: string | string[], companyId: string) => {
    return Products.aggregate([
      {
        $match: {
          companyId: companyId,
          $or: [
            { productCode: { $regex: searchText, $options: 'i' } },
            { description: { $regex: searchText, $options: 'i' } },
            { satProductCode: { $regex: searchText, $options: 'i' } },
          ],
        },
      },
      { $sort: { description: 1, productCode: 1, satProductCode: 1 } },
      {
        $project: {
          productCode: 1,
          description: 1,
          value: 1,
          currency: 1,
          satProductCode: 1,
          satUnitKey: 1,
          dimensions: 1,
          weightInKg: 1,
          packagingCode: 1,
          packagingDescription: 1,
          dangerousMaterial: 1,
          dangerousMaterialCode: 1,
          tariffCode: 1,
          Pedimentos: 1,
          companyId: 1,
        },
      },
      { $limit: 20 },
    ]).toArray()
  }

  const getCurrentCounterNumber = async (name: string) => {
    return Counters.findOne({ name: name })
  }

  const saveCounterNumber = async (name: string, counter: number) => {
    Counters.updateOne({ name: name }, { $set: { counter: counter } })
  }

  const incrementCompanyBoLHCounter = async (companyId: string | undefined, increaseRate: number) => {
    Companies.updateOne({ _id: companyId }, { $inc: { nextBoLHNumber: increaseRate } })
    console.log(`counter added ${increaseRate} to nextBoLHNumber in ${companyId}`)
  }

  const incrementCompanyOrderCounter = async (companyId: string | undefined, increaseRate: number) => {
    Companies.updateOne({ _id: companyId }, { $inc: { nextOrderNumber: increaseRate } })
    console.log(`counter added 1 to nextOrderNumber in ${companyId}`)
  }

  const incrementCounterNumber = async (name: string, increaseRate: number) => {
    Counters.updateOne({ name: name }, { $inc: { counter: increaseRate } })
    // console.log('counter added 1')
  }

  const getCompanyById = async (companyId: string | undefined) => {
    return Companies.findOne({ _id: companyId })
  }

  const getCompanyByIdSync = (companyId: string | undefined) => {
    return Companies.findOne({ _id: companyId })
  }

  const createNewShipmetFromBoLH = async (companyId: string | undefined, shipmentReference: string, user: User, customerId?: string) => {
    const type: 'order' | 'quotation' = 'order'
    const shipment = {
      type: type,
      companyId: companyId!,
      referencia: shipmentReference,
      clientId: customerId!,
      userId: user._id,
      author: user.username,
    }

    const { acknowledged, insertedId } = await ShipmentOrders.insertOne(shipment)
    console.log('New Shipment', acknowledged)

    if (acknowledged === true) {
      await incrementCompanyOrderCounter(companyId, 1)
      console.log('Shipment incremented')
      return { ok: true, referencia: shipment?.referencia?.toString(), _id: insertedId }
    }
    return { ok: false, referencia: '', _id: '', error: 'New Bill of Lading Hub not saved to Database' }
  }

  const saveNewBoLH = async (
    BoLH: any,
    userId: string,
    companyId: string | undefined,
    user: any,
    createShipmentWithHub: boolean = true
  ) => {
    const company = await getCompanyById(companyId)
    if (company) {
      console.log('saveNewBoLH company: ', company)
      console.log('saveNewBoLH company: ', company)
      const nextBoLHCounter = company?.nextBoLHNumber?.toString()
      console.log('user inside saveNewBoLH', user)
      const folio =
        nextBoLHCounter!.length < 4
          ? `${company.orderNumberPrefix}${nextBoLHCounter?.padStart(4, '0')}`
          : `${company.orderNumberPrefix}${nextBoLHCounter}`
      const initials =
        user.name && user.lastName
          ? user.name?.substring(0, 1).toUpperCase() + user.lastName?.substring(0, 1).toUpperCase()
          : user.emails[0].address.substring(0, 2).toUpperCase()
      let BoLHAssembled = {
        createdBy: userId,
        createdAt: new Date(),
        companyId: companyId,
        companyName: company.name,
        folio: folio,
        ...BoLH,
        status: {
          generalInfoComplete: false,
          loadComplete: false,
          goodsComplete: false,
          customsComplete: false,
          transportsComplete: false,
          pricesComplete: false,
          documentsComplete: false,
          isReadyToAction: true,
        },
        billOfLading2: {
          internationalTransport: 'No',
          locations: [],
          goods: {
            totalWeight: 0, // Peso Bruto total en KG del total de itemancías
            weightUnit: 'KGM',
            totalGoods: 0, // El valor de este campo debe ser igual al número de secciones good que se registren en el complemento.
            good: [],
          },
          transports: [],
        },
        share: {
          typeOfAccess: 'Private',
          userToSendInvitation: {
            preferedLanguage: 'es',
          },
          users: [
            {
              userId: user._id,
              name: user.name || user.username,
              lastName: user.lastName || '',
              initials: initials || '',
              notify: true,
              preferedLanguage: 'es',
              writePermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports', 'prices', 'costs'],
              viewPermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports', 'prices', 'costs'],
              email: user.emails[0].address,
              mobile: user.mobile || '',
              companyId: user.profile.companyId,
              companyName: user.profile.companyName,
              telegramAutenticationToken: user.telegram?.autenticationToken || '',
              telegramChatId: user.telegram?.chatId || '',
              hubManager: true,
            },
          ],
        },
      }
      if (createShipmentWithHub) {
        const nextShipmentCounter = company?.nextOrderNumber?.toString()
        const shipmentReference =
          nextShipmentCounter!.length < 6
            ? `${company.orderNumberPrefix}-${nextShipmentCounter!.padStart(6, '0')}`
            : `${company.orderNumberPrefix}-${nextShipmentCounter} `
        BoLHAssembled = {
          ...BoLHAssembled,
          tags: [
            {
              type: 'Shipment',
              value: shipmentReference,
              closable: false,
            },
          ],
        }
        await createNewShipmetFromBoLH(companyId, shipmentReference, user, '')
      }

      if (company.logoImageId) {
        BoLHAssembled = { ...BoLHAssembled, companyLogo: company.logoImageId }
      }

      const { acknowledged, insertedId } = await BoLHubs.insertOne(BoLHAssembled)
      // console.log(result)

      if (acknowledged === true) {
        // await incrementCounterNumber('BoL Hubs', 1)
        await incrementCompanyBoLHCounter(companyId, 1)
        return { ok: true, name: BoLHAssembled.name?.toString(), _id: insertedId }
      }
      return { ok: false, name: '', _id: '', error: 'New Bill of Lading Hub not saved to Database' }
    }
    return { ok: false, name: '', _id: '', error: 'Company not found. New Bill of Lading not saved to DB' }
  }

  const getBillOfLadingHub = (id: string) => {
    return BoLHubs.findOne({ _id: id })
  }

  const getBillOfLadingHubListByUser = (userId: string) => {
    return BoLHubs.find({ userId: userId }).toArray()
  }

  const getMultipleBillOfLadingHubs = (hubsIds: Array<string>) => {
    return BoLHubs.find({ _id: { $in: hubsIds } }).toArray()
  }

  const updateBoLHField = async (id: string, action: string, fields: any) => {
    // console.log('Reached updateBoLHField')
    if (action === 'Update') {
      // console.log('update fields in updateBolHField', fields)
      BoLHubs.updateOne({ _id: id }, { $set: fields })
    }
    if (action === 'Delete') {
      // console.log('delete fields in updateBolHField', fields)
      BoLHubs.updateOne({ _id: id }, { $unset: fields })
    }
    return null
  }

  // TODO: Create tests for this function
  const createBoLHListQuery = (
    issuersIds: Array<string>,
    filters: any[] = [],
    searchText: string,
    userEmail: string,
    from?: string,
    to?: string,
    BoLHClients?: string,
    BoLHUsers?: string
  ) => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const startDate = from ? new Date(from) : new Date(year - 10, month - 1, 1)
    const endDate = to ? new Date(to) : new Date(year, month + 1, 0, 11, 59, 59)
    const defaultFilters = [{ name: 'dateRange', value: { from: startDate, to: endDate } }]

    const filter = (filterName: string) => [...defaultFilters, ...filters].find(({ name }: { name: String }) => name === filterName)

    // TODO: Get user by session in token (params.token)
    // const user = await getUserByToken(token)

    // TODO: Return only user's invoices
    const query: { [key: string]: any } = { 'share.users': { $elemMatch: { email: userEmail } } }

    const dateRangeFilter = filter('dateRange')
    if (dateRangeFilter) {
      const { from, to } = dateRangeFilter.value
      query.createdAt = { $gte: new Date(from), $lte: new Date(to) }
    }

    if (searchText) query.$text = { $search: searchText }

    if (BoLHClients) {
      const arrayBoLHClients = BoLHClients.split(',')
      query.clientId = { $in: arrayBoLHClients }
    }

    if (BoLHUsers) {
      const arrayBoLHUsers = BoLHUsers.split(',')
      query.createdBy = { $in: arrayBoLHUsers }
    }

    const statusFilter = filter('status')
    // TODO: Consider the implementation of the helpers (getInvoiceBalance) directly from the database.
    if (statusFilter) query.status = statusFilter.value

    const issuerFilter = filter('issuer')
    if (issuerFilter) {
      query['issuer.name'] = { $regex: issuerFilter.value, $options: 'i' }
    }

    const clientFilter = filter('client')
    if (clientFilter) {
      query['receiver.name'] = { $regex: clientFilter.value, $options: 'i' }
    }

    const clientRfcFilter = filter('clientRfc')
    if (clientRfcFilter) {
      query['receiver.rfc'] = { $regex: clientRfcFilter.value, $options: 'i' }
    }

    const currencyFilter = filter('currency')
    if (currencyFilter) query.shortCurrency = { $regex: currencyFilter.value, $options: 'i' }

    const referenceFilter = filter('reference')
    if (referenceFilter) query['relatedServices.reference'] = { $regex: referenceFilter.value, $options: 'i' }

    const exchangeRateFilter = filter('exchangeRate')
    if (exchangeRateFilter) {
      const { from, to } = exchangeRateFilter.value
      query.exchangeRate = { $gte: Number(from), $lte: Number(to) }
    }

    const subtotalFilter = filter('subtotal')
    if (subtotalFilter) {
      const { from, to } = subtotalFilter.value
      query.subtotal = { $gte: Number(from), $lte: Number(to) }
    }

    const totalFilter = filter('total')
    if (totalFilter) {
      const { from, to } = totalFilter.value
      query.total = { $gte: Number(from), $lte: Number(to) }
    }

    return query
  }

  type getBoLHListParams = {
    user: User
    filters?: any[]
    searchText?: string
    skip?: number
    from?: string
    to?: string
    BoLHClients?: string
    BoLHUsers?: string
  }

  const getBoLHList = async (params: getBoLHListParams) => {
    // console.log('getBoLHList params:', params)
    const { user, filters = [], searchText = '', skip = 0, from, to, BoLHClients, BoLHUsers } = params
    if (!user) return Promise.resolve({ BoLHubs: [], count: 0 })
    const companies = await getAllUserCompanies(user, { _id: 1 })
    const issuersIds = companies.map(({ _id }) => _id)
    const pageSize = 50

    // From to edit
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const startDate = from ? new Date(from) : new Date(year - 10, month - 1, 1)
    const endDate = to ? new Date(to) : new Date(year, month + 1, 0, 11, 59, 59)
    const defaultFilters = [{ name: 'dateRange', value: { from: startDate, to: endDate } }]
    const arrayBoLHClients = BoLHClients?.split(',')
    const arrayBoLHUsers = BoLHUsers?.split(',')
    const userEmail = user.emails[0].address || ''
    const selector = createBoLHListQuery(issuersIds, filters, searchText, userEmail, from, to, BoLHClients, BoLHUsers)

    // TODO: RETURN ONLY REQUIRED FIELDS!!! ADD "fields" PARAMETER TO "getCfdiListParams"
    const boLHubs = await BoLHubs.find(selector)
      .skip(skip)
      // TODO: IMPLEMENTATION PENDING: INFINITE SCROLL FOR BoLHubs LIST
      // .limit(pageSize)
      .project({ pdfData: 0, xmlData: 0 })
      .sort({ createdAt: -1 })
      .toArray()
    const count = await BoLHubs.find(selector).count()
    console.log('getBoLHList results: BoLHubs', 'count', count)
    return Promise.resolve({ BoLHubs: boLHubs, count })
  }

  const copyBoLHubById = async (id: string) => {
    // Get the original Hub for copy
    const originalHub = await getBillOfLadingHub(id)

    // Generate new name
    const newName = originalHub ? `Copy of ${originalHub.name || originalHub.folio}` : `Copy of Hub`

    // Delete _id field
    if (originalHub) {
      originalHub._id = new ObjectId()
    }

    // Get next Hub folio number
    if (originalHub) {
      const company = await getCompanyById(originalHub.companyId)
      if (company) {
        console.log('saveNewBoLH company: ', company)
        console.log('saveNewBoLH company: ', company)
        const nextBoLHCounter = company?.nextBoLHNumber?.toString()
        const newFolio =
          nextBoLHCounter!.length < 4
            ? `${company.orderNumberPrefix}${nextBoLHCounter?.padStart(4, '0')}`
            : `${company.orderNumberPrefix}${nextBoLHCounter}`
        await incrementCompanyBoLHCounter(originalHub.companyId, 1)

        // Build new hub with Updated Timestamp
        const newHub = { ...originalHub, name: newName, folio: newFolio, createdAt: new Date() }

        // Insert newHub in database
        const { acknowledged, insertedId } = await BoLHubs.insertOne(newHub)

        // if insert is successful increase folio number
        if (acknowledged === true) {
          // await incrementCounterNumber('BoL Hubs', 1)
          return Promise.resolve({ acknowledged, _id: insertedId })
        }
        return Promise.resolve({ acknowledged, _id: '', error: 'New Bill of Lading Hub not saved to Database' })
      }
    }
    return Promise.resolve({ ok: false, _id: '', error: 'New Bill of Lading Hub not saved to Database' })
  }

  const copyMultipleHubsById = async (hubsIds: Array<string>) => {
    // Get the original Hubs for copy
    const originalHubs = await getMultipleBillOfLadingHubs(hubsIds)
    // console.log('originalHubs', originalHubs)

    // Create newHubIds array to send back the result response
    const newHubs: any[] = []

    // Get next Hub folio number
    const company = await getCompanyById(originalHubs[0].companyId)
    let hubCounter = company?.nextBoLHNumber || 1
    // console.log('hubCounter', hubCounter)

    if (company) {
      // Travel trhough the array and edit hubs to make a copy
      const hubPromises = originalHubs.map(async hub => {
        // Convert hub in variable
        const oldHub = hub

        // Delete _id field and documents
        oldHub._id = new ObjectId()

        // Change name
        const newName = `Copy of ${oldHub.name}`

        // Generate next Folio

        // console.log('copyMultipleBoLH company: ', company)
        // Generate new folio
        const nextBoLHCounter = hubCounter.toString()
        const nextBoLHCounterString = nextBoLHCounter.toString()
        const newFolio =
          nextBoLHCounterString!.length < 4
            ? `${company.orderNumberPrefix}${nextBoLHCounterString?.padStart(4, '0')}`
            : `${company.orderNumberPrefix}${nextBoLHCounterString}`
        // console.log('copyMultipleBoLH newFolio: ', newFolio)

        // Add 1 to hub counter
        hubCounter += 1
        // console.log('hubCounter after adding 1', hubCounter)

        // Construct newHub
        const newHub = {
          ...oldHub,
          name: newName,
          folio: newFolio,
          createdAt: new Date(),
          billOfLading2: { ...oldHub.billOfLading2, costs: [], transports: [] },
        }
        // console.log('copyMultipleBoLH newHub: ', newHub)

        // Insert newHub in newHubs array
        newHubs.push(newHub)
      })
      // Get all results of promises array
      Promise.all(hubPromises)

      // Insert newHub in database
      const { acknowledged, insertedIds } = await BoLHubs.insertMany(newHubs)

      // console.log('insert result', result)
      // console.log('insertedId', insertedIds)
      // if insert is successful increase folio number

      if (acknowledged === true) {
        // await incrementCounterNumber('BoL Hubs', 1)
        await incrementCompanyBoLHCounter(originalHubs[0].companyId, originalHubs.length)
      }
      // Return promise response
      return Promise.resolve({ acknowledged, insertedIds })
    }
    return Promise.reject(new Error('No Host Company information available in the Hub')).then(
      () => {
        // not called
      },
      error => {
        console.error(error) // Stacktrace
      }
    )
  }

  const getHubsForCopy = async (hubsIds: Array<string>) => {
    // Get the original Hubs for copy
    const originalHubs = await getMultipleBillOfLadingHubs(hubsIds)
    // console.log('originalHubs', originalHubs)

    // Create newHubIds array to send back the result response
    const newHubs: any[] = []

    // Get next Hub folio number
    const company = await getCompanyById(originalHubs[0].companyId)
    const hubCounter = company?.nextBoLHNumber || 1

    // Return results
    return Promise.resolve({ originalHubs, hubCounter })
  }

  const searchSATCodesProductAndServices = async (searchText: string) => {
    return SatProductAndServices.aggregate([
      {
        $match: {
          $or: [
            { key: { $regex: searchText, $options: 'i' } },
            { satDescription: { $regex: searchText, $options: 'i' } },
            { similarWords: { $regex: searchText, $options: 'i' } },
          ],
        },
      },
      { $sort: { key: 1 } },
      {
        $project: {
          key: 1,
          satDescription: 1,
          dangerousMaterial: 1,
        },
      },
      { $limit: 20 },
    ]).toArray()
  }

  const searchSATTariffCodes = async (searchText: string) => {
    return SatTariffCodes.aggregate([
      {
        $match: {
          $or: [
            { key: { $regex: searchText, $options: 'i' } },
            { satDescription: { $regex: searchText, $options: 'i' } },
            { umt: { $regex: searchText, $options: 'i' } },
          ],
        },
      },
      { $sort: { key: 1 } },
      {
        $project: {
          key: 1,
          satDescription: 1,
          umt: 1,
        },
      },
      { $limit: 20 },
    ]).toArray()
  }

  const searchSATDangerousMaterialCodes = async (searchText: string) => {
    return SatDangerousMaterialCodes.aggregate([
      {
        $match: {
          $or: [
            { key: { $regex: searchText, $options: 'i' } },
            { description: { $regex: searchText, $options: 'i' } },
            { classOrDiv: { $regex: searchText, $options: 'i' } },
          ],
        },
      },
      { $sort: { key: 1 } },
      {
        $project: {
          key: 1,
          description: 1,
          classOrDiv: 1,
        },
      },
      { $limit: 20 },
    ]).toArray()
  }

  const saveNewTrackingPosition = async (shipmentId: string, coords: object, timestamp: string, companyId: string) => {
    const date = new Date()
    TrackingPositions.insertOne({ shipmentId: shipmentId, coords: coords, timestamp: timestamp, companyId: companyId, createdAt: date })
    return null
  }

  const getShipmentLastPosition = async (shipmentId: string) => {
    const position = TrackingPositions.find({ shipmentId: shipmentId }).sort({ createdAt: -1 }).limit(1).toArray()
    console.log('position from database')
    return position
  }

  const getCompanyProfile = async (companyId: string | undefined) => {
    const company = Companies.findOne({ _id: companyId })
    return company
  }

  const saveExchangeRateDoF = async (date: Date, exchangeRate: string) => {
    // console.log('date in dB Insert', date)
    // console.log('exchangeRate in dB Insert', exchangeRate)
    await DoFExchangeRates.insertOne({ date: date, exchangeRate: exchangeRate, currency: 'USD' })
    return null
  }

  const getCompany40 =  ({ companyId, fields }: { companyId: string; fields?: { [key: string]: number } }) => {
    return Promise.resolve(null)
  }


  return {
    validateCredentials,
    getUserByEmail,
    getUserByUsername,
    createUser,
    saveActivationEmailData,
    getUserById,
    getUserByActivationToken,
    activateUser,
    createAccountRecoveryToken,
    saveRecoveryEmailData,
    getUserByRecoveryToken,
    updateUserPassword,
    getCfdiList,
    getInvoice,
    saveUserSettings,
    saveLoginToken,
    saveExternalInvoice,
    setCompanyHaveCsd,
    getUserCurrentCompany,
    getCfdi,
    getCfdis,
    // @ts-ignore
    getCompany,
    getShipment,
    getShipments,
    setCompanySigningCfdi,
    getNextCfdiNumber,
    saveCfdiSentToSign,
    saveCfdi,
    addCfdiCancelRequest,
    setCfdiAsCanceled,
    eventLogTypes,
    addEventLog,
    getAttachedFileById,
    attachPdfToCfdi,
    attachCfdiBase64Xml,
    attachCfdiBase64CancelXml,
    getCancelPendingCfdis,
    // @ts-ignore
    getServiceRelationship,
    getCompanyClients,
    setCfdiDeliveryStatus,
    saveEmailMessage,
    addCfdiDeliveryEmails,
    getBillingPendingServices,
    saveExchangeRate,
    getExchangeRate,
    getCompanyLogoUrl,
    getAllUserCompanies,
    saveCfdiDraft,
    findCfdis,
    getPaymentProofPendingInvoices,
    // @ts-ignore
    getAllUserClients,
    // updateCfdiDiscountedStatus,
    createCachedPositionInfo,
    getCachedPositionInfo,
    getCompaniesWithGpsTracking,
    createCompanyVehicle,
    getCompanyVehicle,
    updateVehicleLocationInfo,
    // user
    getUsersList,
    setUserEnabled,
    setUserDisabled,
    deleteUser,
    setUserType,
    // getUserProfilePhoto,
    getPostalCodeDetails,
    getState,
    getLocality,
    getMunicipality,
    getSuburbsList,
    getCountry,
    getLocalitiesList,
    getMunicipalitiesList,
    getStatesList,
    saveNewPlace,
    searchPlaces,
    saveNewCompany,
    searchCompanies,
    searchVehicles,
    searchDrivers,
    saveNewVehicle,
    saveNewDriver,
    searchProducts,
    saveNewProduct,
    getCurrentCounterNumber,
    saveCounterNumber,
    incrementCounterNumber,
    saveNewBoLH,
    getBillOfLadingHub,
    getBillOfLadingHubListByUser,
    updateBoLHField,
    getBoLHList,
    searchSATCodesProductAndServices,
    searchSATTariffCodes,
    searchSATDangerousMaterialCodes,
    saveNewTrackingPosition,
    getShipmentLastPosition,
    getCompanyProfile,
    getCfdiDraftsByBoLHId,
    getClientById,
    saveExchangeRateDoF,
    copyBoLHubById,
    copyMultipleHubsById,
    getHubsForCopy,
    getCompanyById,
    getCompany40,
  }
}

// TODO: Add indexes
// const rawCollection = EventLogs.rawCollection()
// rawCollection.createIndex({ number: 1 }, { unique: true })
// rawCollection.createIndex({ createdAt: 1 })
// rawCollection.createIndex({ 'event.shipmentOrderId': 1 })

import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, loadUser, dbConnectionClose, errorHandler } from 'services/api/helpers/middlewares'
import { facturamaApi } from 'services/api/billing/facturamaApi'
import { getCreditTermName, getServiceName } from 'services/catalogs'
import { DbService, Cfdi, User, ShipmentOrder, ShipmentOrderQuotation, Company, Company40, CfdiType } from 'services/model'
import { getNewId } from 'services/helpers/server'
import { createPdfFromUrl } from 'services/pdf'
import { generateCartaPorte2ToStamp } from 'services/sat/generateCartaPorte2JsonToStamp'

type CfdiItemFromClient = {
  productCode: string
  unit: string
  quantity: number
  unitValue: number
  taxes?: Array<{ name: string; rate: number; isRetention: boolean; value: number }>
  subtotal: number
  total: number
  /** Required for credit notes */
  invoiceId?: string
  /** Allows to link a service quotation to an invoice or credit note.
   * 'quotationId' required for invoices
   * For credit notes, the quotation is created back into the related service.
   */
  service?: { id: string; quotationId?: string }
  notes?: string
}

type CfdiPaymentFromClientRelatedCfdi = {
  id: string
  uuid: string
  total: number
  exchangeRate?: number
}

/** Payments details. Only required for payment proofs */
type CfdiPaymentFromClient = {
  date: Date
  paymentForm: string
  currency: string
  amount: number
  exchangeRate: number
  payerAccount?: { number: string; bankRfc: string; bankName: string }
  receiverAccount?: { number: string; bankRfc: string }
  issuerAccount?: { number: string; bankRfc: string }
  operationNumber?: string
  relatedCfdis: Array<CfdiPaymentFromClientRelatedCfdi>
}

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'createCfdi.errors.invalidUser' })

const userCanCreateCfdiType = (cfdiType: CfdiType, user: User) => {
  if (cfdiType === 'invoice') return Boolean(user.profile.canCreateInvoices)
  // TODO: Create permission settings for "canCreateCreditNotes"
  // if (cfdiType === 'creditNote') return Boolean(user.profile.canCreateCreditNotes)
  if (cfdiType === 'creditNote') return Boolean(user.profile.canCreateInvoices)
  if (cfdiType === 'paymentProof') return Boolean(user.profile.canCreatePaymentProofs)
  return false
}

const relatedShipmentsIdsFromItems = (items: Array<CfdiItemFromClient>) => {
  const ids = items.map(({ service }) => service && service.id).filter(Boolean)
  return [...new Set(ids)] as Array<string>
}

const relatedShipmentQuotationsFromItems = (items: Array<CfdiItemFromClient>, relatedShipments: Array<ShipmentOrder>) => {
  const ids = items.map(({ service }) => service && service.quotationId).filter(Boolean)
  return relatedShipments
    ? relatedShipments
        .flatMap(({ quotations }) => quotations!)
        .filter(Boolean)
        .filter(({ id }) => ids.includes(id))
    : []
}

const createCfdiApiItem = (item: CfdiItemFromClient, relatedQuotation?: ShipmentOrderQuotation) => {
  const { taxes = [], ...mergedItem } = { ...item, ...relatedQuotation }

  const newItem: any = {
    ProductCode: mergedItem.productCode,
    // Use product code if the SAT service is not present in the catalog.
    Description: getServiceName(mergedItem.productCode) || mergedItem.productCode,
    UnitCode: mergedItem.unit,
    UnitPrice: mergedItem.unitValue,
    Quantity: mergedItem.quantity,
    Subtotal: mergedItem.subtotal,
    Total: mergedItem.total,
    TaxObject: mergedItem.taxObject,
  }
  if (taxes.length > 0) {
    newItem.Taxes = taxes
      .map(tax => ({
        Total: tax.value,
        Name: 'IVA',
        Base: mergedItem.subtotal,
        IsRetention: tax.isRetention,
        Rate: tax.rate,
      }))
      .filter(Boolean)
  }
  return newItem
}

const createApiCfdiItems = (items: Array<CfdiItemFromClient>, relatedQuotations: Array<ShipmentOrderQuotation>) =>
  items.map(item => {
    const relatedQuotation = relatedQuotations.find(({ id }) => id === item.service?.quotationId)
    return createCfdiApiItem(item, relatedQuotation)
  })

/** Build the receiver object to compose the CFDI that will be signed on the API */
const createApiCfdiReceiver = (receiver: Company40, cfdiUse: string) => {
  let invoiceReceiver = {
    Rfc: receiver.rfc,
    Name: receiver.name,
    CfdiUse: cfdiUse,
    FiscalRegime: receiver.fiscalRegime,
    TaxZipCode: receiver.addressData.zipCode,
    Address: {
      Street: receiver.addressData.street,
      ExteriorNumber: receiver.addressData.exteriorNumber,
      InteriorNumber: receiver.addressData.interiorNumber || '',
      Neiborhood: receiver.addressData.neighborhood.satCode || '',
      Municipality: receiver.addressData.municipality?.satCode || '',
      ZipCode: receiver.addressData.zipCode,
      State: receiver.addressData.state.satCode,
      Country: receiver.addressData.country,
    }
  }
  const { addressData, foreignFiscalId } = receiver

  if (receiver.addressData) {
    invoiceReceiver = {
      ...invoiceReceiver,
    }
  }
  // Data required only for foreign clients.
  // Add only if the data (both country and fiscalId) exists on database.
  if (receiver.rfc.toUpperCase() === process.env.FOREIGN_RFC && addressData.country && foreignFiscalId) {
    return { ...invoiceReceiver, TaxResidence: addressData.country, TaxRegistrationNumber: foreignFiscalId.trim() }
  }
  return invoiceReceiver
}

const createCfdiReceiver = (receiver: Company40, cfdiUse: string) => {
  const invoiceReceiver = {
    id: receiver._id,
    rfc: receiver.rfc,
    name: receiver.name,
    address: receiver.address,
    cfdiUse,
  }
  return receiver.foreignFiscalId ? { foreignFiscalId: receiver.foreignFiscalId, ...invoiceReceiver } : invoiceReceiver
}

const createCfdiIssuer = (issuer: Company40) => ({
  id: issuer._id,
  fiscalRegime: issuer.fiscalRegime,
  rfc: issuer.rfc,
  name: issuer.name,
  address: issuer.address,
  phone: issuer.phoneNumber,
})

type CreateCfdiRequest = NextApiRequest & { dbService: DbService; loggedUser: User; cfdiId: string | null }

export const createInvoiceOrCreditNote = async (req: CreateCfdiRequest, res: NextApiResponse, next: Function) => {
  const { body, loggedUser, dbService }: { body: any; loggedUser: User; dbService: DbService } = req
  const { issuerId, receiverId, currency, exchangeRate, paymentMethod, paymentType, creditDays, cfdiUse, notes = '', BoLHState } = body
  const { cfdiType, items }: { cfdiType: CfdiType; items: Array<CfdiItemFromClient> } = body

  if (!cfdiType) return next(new RequestError(400, 'createCfdi.errors.cfdiTypeRequired'))
  if (!['invoice', 'creditNote', 'paymentProof'].includes(cfdiType)) return next(new RequestError(400, 'createCfdi.errors.invalidCfdiType'))

  if (cfdiType === 'paymentProof') return next()

  if (!userCanCreateCfdiType(cfdiType, loggedUser)) return next(new RequestError(400, 'createCfdi.errors.userUnauthorized'))

  // TODO: Para los datos que correspondan, verificar que sus valores existan en sus respectivos catálogos
  if (!issuerId) return next(new RequestError(400, 'createCfdi.errors.issuerRequired'))
  const issuer = await dbService.getCompany40({ companyId: issuerId })
  if (!issuer) return next(new RequestError(400, 'createCfdi.errors.issuerNotFound'))
  if (issuer.isSigningCfdi) return next(new RequestError(400, 'createCfdi.errors.cfdiSigningInProgress'))
  if (!receiverId) return next(new RequestError(400, 'createCfdi.errors.receiverRequired'))
  const receiver = await dbService.getCompany40({ companyId: receiverId })
  if (!receiver) return next(new RequestError(400, 'createCfdi.errors.receiverNotFound'))
  if (receiverId === issuerId) return next(new RequestError(400, 'createCfdi.errors.issuerReceiverAreEqual'))
  if (!paymentMethod) return next(new RequestError(400, 'createCfdi.errors.paymentMethodRequired'))
  if (!paymentType) return next(new RequestError(400, 'createCfdi.errors.paymentTypeRequired'))
  if (!creditDays && creditDays !== 0) return next(new RequestError(400, 'createCfdi.errors.creditDaysRequired'))
  if (!getCreditTermName(creditDays)) return next(new RequestError(400, 'createCfdi.errors.invalidCreditDaysOption'))
  if (!cfdiUse) return next(new RequestError(400, 'createCfdi.errors.cfdiUseRequired'))
  if (!currency) return next(new RequestError(400, 'createCfdi.errors.currencyRequired'))
  if (currency !== 'MXN') {
    const isRateInvalid = Number.isNaN(Number(exchangeRate)) || Number(exchangeRate) === 0
    if (isRateInvalid) return next(new RequestError(400, 'createCfdi.errors.invalidExchangeRate'))
  }
  if (!items || !items.length) return next(new RequestError(400, 'createCfdi.errors.itemsRequired'))
  // TODO: Validate items structure

  const uniqueInvoiceIds = [...new Set(items.map(({ invoiceId }) => invoiceId).filter(Boolean))] as Array<string>
  const relatedInvoices = await dbService.getCfdis(uniqueInvoiceIds)
  if (cfdiType === 'creditNote') {
    if (relatedInvoices.length !== uniqueInvoiceIds.length) return next(new RequestError(400, 'createCfdi.errors.invoiceNotFound'))
    // const newExpectedPendingAmounts = relatedInvoices.map()
    const valueByInvoice = items
      .filter(({ invoiceId }) => Boolean(invoiceId))
      .reduce(
        (byInvoice: any, { invoiceId, total }) => ({
          ...byInvoice,
          [invoiceId as string]: byInvoice[invoiceId as string] ? byInvoice[invoiceId as string] + total : total,
        }),
        {}
      )
    if (relatedInvoices.some(({ _id, pendingAmount = 0 }) => pendingAmount < valueByInvoice[_id]))
      return next(new RequestError(400, 'createCfdi.errors.invoiceWithoutPendingAmount'))
  }

  const relatedShipmentsIds = relatedShipmentsIdsFromItems(items)
  const relatedShipments = await dbService.getShipments({ shipmentIds: relatedShipmentsIds })
  if (relatedShipments.length < relatedShipmentsIds.length) return next(new RequestError(400, 'createCfdi.errors.relatedServiceNotFound'))

  if (cfdiType === 'invoice') {
    const haveInvalidShipmentType = relatedShipments.some(({ type }) => type !== 'order')
    if (haveInvalidShipmentType) return next(new RequestError(400, 'createCfdi.errors.invalidRelatedServiceType'))
  }

  const relatedShipmentQuotations = relatedShipmentQuotationsFromItems(items, relatedShipments)
  const alreadyBilledQuotations = relatedShipmentQuotations.filter(({ relatedCfdi }) => relatedCfdi)
  if (alreadyBilledQuotations.length > 0) return next(new RequestError(400, 'createCfdi.errors.alreadyBilledQuotations'))

  const quotationsCurrencies = [...new Set(relatedShipmentQuotations.map(({ currency: curr }) => curr))]

  if (quotationsCurrencies.length > 1) return next(new RequestError(400, 'createCfdi.errors.onlyOneCurrency'))
  if (quotationsCurrencies.length === 1 && quotationsCurrencies[0] !== currency)
    return next(new RequestError(400, 'createCfdi.errors.incompatibleCurrencies'))

  const folio = await dbService.getNextCfdiNumber({ cfdiType, companyId: issuerId })
  if (!folio) return next(new RequestError(400, 'createCfdi.errors.cantGetNextCfidNumber'))

  const locked = await dbService.setCompanySigningCfdi(issuerId, true)
  if (!locked) return next(new RequestError(400, 'createCfdi.errors.cfdiSigningInProgress'))

  const cfdiToSign: any = {
    ExpeditionPlace: issuer.addressData.zipCode, // Ok 4.0 TODO: Make sure the Postal Code exists in SAT Catalogue
    Folio: folio, // Ok 4.0
    Currency: currency,
    CfdiType: 'I', // ingreso // OK 4.0
    PaymentForm: paymentType, // PPD, PUD // OK 4.0
    PaymentMethod: paymentMethod, // Cheque, Tarjeta de crédito, Tarjeta débito, ...
    PaymentConditions: getCreditTermName(creditDays),
    Issuer: { FiscalRegime: issuer.fiscalRegime, Rfc: issuer.rfc, Name: issuer.name }, // OK 4.0
    Receiver: createApiCfdiReceiver(receiver, cfdiUse),
    Items: createApiCfdiItems(items, relatedShipmentQuotations),
  }
  if (cfdiType === 'creditNote') {
    cfdiToSign.CfdiType = 'E'
    cfdiToSign.CfdiRelations = { Type: 'I', Cfdis: [...new Set(relatedInvoices.map(({ uuid }) => uuid))] }
    cfdiToSign.PaymentMethod = 'PUE'
  }

  // TODO: Trim this accountLastDigits field when its SAVED on the database.
  if (receiver.accountLastDigits) cfdiToSign.PaymentAccountNumber = receiver.accountLastDigits
  // "CurrencyExchangeRate" is required only when currency is different from MNX
  if (currency !== 'MXN') cfdiToSign.CurrencyExchangeRate = Number(exchangeRate)
  // If Invoice has Complemento Carta Porte 2.0 calculateIt and add it to cfdiToSign

  // Check if it the invoice has BoL Complement
  // eslint-disable-next-line no-console
  if (BoLHState?.billOfLading2) console.log('generateCartaPorte2ToStamp = ', generateCartaPorte2ToStamp(BoLHState?.billOfLading2))
  if (BoLHState?.billOfLading2) cfdiToSign.Complemento = generateCartaPorte2ToStamp(BoLHState?.billOfLading2)
  // eslint-disable-next-line no-console
  console.log('cfdiToSign', cfdiToSign)

  const { data: signedCfdi, error: signError } = await facturamaApi.addCfdi4(cfdiToSign)
  // eslint-disable-next-line no-console
  console.log('signedCfdi', signedCfdi)
  // eslint-disable-next-line no-console
  console.log('signedCfdi error', signError)

  const clientParams = {
    cfdiType,
    issuerId,
    receiverId,
    currency,
    exchangeRate,
    paymentMethod,
    paymentType,
    creditDays,
    cfdiUse,
    notes,
    items,
  }
  const sentCfdi = { user: loggedUser, clientParams, sentCfdi: cfdiToSign, signedCfdi, signError }
  const sentCfdiId = await dbService.saveCfdiSentToSign(sentCfdi)
  if (signError) {
    await dbService.setCompanySigningCfdi(issuerId, false)
    return next(new RequestError(400, 'createCfdi.errors.apiSignError', { message: signError }))
  }

  const cfdi: Cfdi = {
    createdAt: new Date(signedCfdi.Date), // Assigned from API "Date" field
    // expirationDate?: Date // TODO: Calcular
    createdBy: loggedUser._id,
    createdByUsername: loggedUser.username,
    status: 'active',
    deliveryStatus: 'pending',
    apiId: signedCfdi.Id, // Id given by the SAT API. Optional: CFDIs loaded from XML don't have it
    issuer: createCfdiIssuer(issuer),
    receiver: createCfdiReceiver(receiver, cfdiUse),
    cfdiType,
    folio,
    certNumber: signedCfdi.CertNumber,
    paymentTerms: signedCfdi.PaymentTerms,
    paymentConditions: signedCfdi.PaymentConditions,
    paymentMethod: signedCfdi.PaymentMethod,
    expeditionPlace: signedCfdi.ExpeditionPlace,
    exchangeRate: signedCfdi.ExchangeRate,
    currency: signedCfdi.Currency,
    shortCurrency: signedCfdi.Currency.slice(0, 3),
    subtotal: signedCfdi.Subtotal,
    total: signedCfdi.Total,
    uuid: signedCfdi.Complement.TaxStamp.Uuid,
    cfdiSign: signedCfdi.Complement.TaxStamp.CfdiSign,
    cfdiSignDate: signedCfdi.Complement.TaxStamp.Date, // TODO: Test to ensure is stored as Date type
    satCertNumber: signedCfdi.Complement.TaxStamp.SatCertNumber,
    satSign: signedCfdi.Complement.TaxStamp.SatSign,
    items: items.map(item => ({ id: getNewId(), ...item })),
    relatedServices: relatedShipments.map(shipment => ({
      id: shipment._id,
      reference: shipment.referencia,
      notes: shipment.observaciones || '',
      createdAt: shipment.submitted!,
      clientReference: shipment.orderClientReference || '',
      origin: shipment.origin!,
      destination: shipment.destination!,
    })),
    notes,
  }

  if (cfdiType === 'invoice') {
    cfdi.pendingAmount = signedCfdi.Total
    cfdi.payedAmount = 0
  }

  if (cfdiType === 'creditNote') {
    cfdi.relatedCfdis = relatedInvoices.map(invoice => ({
      id: invoice._id,
      uuid: invoice.uuid,
      type: 'invoice',
      status: invoice.status,
      folio: invoice.folio,
      currency: invoice.shortCurrency as string,
      exchangeRate: invoice.exchangeRate,
      total: invoice.total,
      createdAt: invoice.createdAt,
    }))
  }

  if (BoLHState?.billOfLading2 !== undefined) {
    cfdi.complement!.billOfLading20 = cfdiToSign.Complemento.CartaPorte20
  }

  const cfdiId = await dbService.saveCfdi({ cfdi, sentCfdiId })
  await dbService.setCompanySigningCfdi(issuerId, false)

  const eventDetails = { id: cfdiId, type: cfdiType, number: cfdi.folio || null }
  await dbService.addEventLog(dbService.eventLogTypes.createCfdi, eventDetails, loggedUser)

  req.cfdiId = cfdiId
  res.json({ ok: true, cfdiId, message: 'createCfdi.messages.success' })
  return next()
}

const buildApiPaymentProofData = (
  folio: number,
  issuer: Company40,
  receiver: Company40,
  payments: Array<CfdiPaymentFromClient>,
  relatedInvoices: Array<Cfdi>
) => {
  const nextPartialityNumber = (invoice: Cfdi) => {
    const count = invoice.relatedCfdis?.filter(cfdi => cfdi.type === 'paymentProof').length
    return count ? count + 1 : 1
  }

  const buildApiRelatedDocument = (paymentCurrency: string, document: CfdiPaymentFromClientRelatedCfdi) => {
    const { id, total, exchangeRate } = document
    const invoice: Cfdi = relatedInvoices.find(({ _id }) => _id === id) as Cfdi
    const { uuid, folio: invoiceFolio, paymentMethod, shortCurrency } = invoice
    const documentData: any = {
      Uuid: uuid,
      Folio: invoiceFolio,
      Currency: shortCurrency,
      PaymentMethod: paymentMethod?.slice(0, 3),
      PartialityNumber: nextPartialityNumber(invoice),
      PreviousBalanceAmount: invoice.pendingAmount,
      AmountPaid: total,
    }
    if (paymentCurrency !== shortCurrency) documentData.ExchangeRate = exchangeRate
    return documentData
  }

  const buildApiRelatedDocuments = (currency: string, relatedDocuments: Array<CfdiPaymentFromClientRelatedCfdi>) =>
    relatedDocuments.map(document => buildApiRelatedDocument(currency, document))

  const buildApiPaymentData = (payment: CfdiPaymentFromClient) => {
    const { date, paymentForm, currency, amount, relatedCfdis, exchangeRate } = payment
    const { payerAccount, receiverAccount } = payment
    const paymentData: any = {
      Date: date,
      PaymentForm: paymentForm,
      Currency: currency,
      Amount: amount,
      RelatedDocuments: buildApiRelatedDocuments(currency, relatedCfdis),
    }

    if (payerAccount) {
      paymentData.RfcIssuerPayerAccount = payerAccount.bankRfc
      paymentData.PayerAccount = payerAccount.number
      if (payerAccount.bankRfc === process.env.FOREIGN_RFC) paymentData.ForeignAccountNamePayer = payerAccount.bankName
    }

    if (receiverAccount) {
      paymentData.BeneficiaryAccount = receiverAccount.number
      if (receiverAccount.bankRfc !== process.env.FOREIGN_RFC) paymentData.RfcReceiverBeneficiaryAccount = receiverAccount.bankRfc
    }

    if (currency !== 'MXN' && exchangeRate) paymentData.ExchangeRate = exchangeRate

    return paymentData
  }

  return {
    ExpeditionPlace: issuer.addressData.zipCode,
    Folio: folio,
    CfdiType: 'P', // pago
    Issuer: { Rfc: issuer.rfc, Name: issuer.name, FiscalRegime: issuer.fiscalRegime },
    // P01 is required for payment proofs.
    Receiver: { Rfc: receiver.rfc, Name: receiver.name, CfdiUse: 'P01' },
    Complemento: { Payments: payments.map(buildApiPaymentData) },
  }
}

export const createPaymentProof = async (req: CreateCfdiRequest, res: NextApiResponse, next: Function) => {
  const { body, loggedUser, dbService }: { body: any; loggedUser: User; dbService: DbService } = req
  const { issuerId, receiverId, notes } = body
  const { cfdiType, payments }: { cfdiType: CfdiType; payments: Array<CfdiPaymentFromClient> } = body

  if (!cfdiType) return next(new RequestError(400, 'createCfdi.errors.cfdiTypeRequired'))
  if (cfdiType !== 'paymentProof') return next()

  if (!['invoice', 'creditNote', 'paymentProof'].includes(cfdiType)) return next(new RequestError(400, 'createCfdi.errors.invalidCfdiType'))

  if (!userCanCreateCfdiType(cfdiType, loggedUser)) return next(new RequestError(400, 'createCfdi.errors.userUnauthorized'))

  // TOOD: Para los datos que correspondan, verificar que sus valores existan en sus respectivos catálogos
  if (!issuerId) return next(new RequestError(400, 'createCfdi.errors.issuerRequired'))
  const issuer = await dbService.getCompany40({ companyId: issuerId })
  if (!issuer) return next(new RequestError(400, 'createCfdi.errors.issuerNotFound'))
  if (issuer.isSigningCfdi) return next(new RequestError(400, 'createCfdi.errors.cfdiSigningInProgress'))
  if (!receiverId) return next(new RequestError(400, 'createCfdi.errors.receiverRequired'))
  const receiver = await dbService.getCompany40({ companyId: receiverId })
  if (!receiver) return next(new RequestError(400, 'createCfdi.errors.receiverNotFound'))
  if (receiverId === issuerId) return next(new RequestError(400, 'createCfdi.errors.issuerReceiverAreEqual'))

  if (!payments) return next(new RequestError(400, 'createCfdi.errors.paymentsRequired'))

  // Every document have the same issuerId and receiverId
  const allRelatedInvoices = payments.flatMap(({ relatedCfdis }) => relatedCfdis)
  const relatedDocumentsIds = [...new Set(allRelatedInvoices.map(({ id }) => id))]
  const relatedInvoices = await dbService.getCfdis(relatedDocumentsIds)

  if (relatedInvoices.some(invoice => !invoice.pendingAmount))
    return next(new RequestError(400, 'createCfdi.errors.invoiceWithoutPendingAmount'))
  if (relatedInvoices.some(invoice => invoice.pendingAmount && invoice.pendingAmount <= 0))
    return next(new RequestError(400, 'createCfdi.errors.invoiceAlreadyPayed'))

  const allDocsMatchIssuerAndReceiver = allRelatedInvoices.every(related => {
    const invoice = relatedInvoices.find(({ _id }) => _id === related.id)
    return invoice?.issuer?.id === issuerId && invoice?.receiver?.id === receiverId
  })
  if (!allDocsMatchIssuerAndReceiver) return next(new RequestError(400, 'createCfdi.errors.incorrectInvoiceCompanies'))

  const folio = await dbService.getNextCfdiNumber({ cfdiType, companyId: issuerId })
  if (!folio) return next(new RequestError(400, 'createCfdi.errors.cantGetNextCfidNumber'))

  const locked = await dbService.setCompanySigningCfdi(issuerId, true)
  if (!locked) return next(new RequestError(400, 'createCfdi.errors.cfdiSigningInProgress'))

  const cfdiToSign = buildApiPaymentProofData(folio, issuer, receiver, payments, relatedInvoices)

  const { data: signedCfdi, error: signError } = await facturamaApi.addCfdi4(cfdiToSign)
  const clientParams = { cfdiType, issuerId, receiverId, payments, notes }
  const sentCfdi = { user: loggedUser, clientParams, sentCfdi: cfdiToSign, signedCfdi, signError }
  const sentCfdiId = await dbService.saveCfdiSentToSign(sentCfdi)

  if (signError) {
    await dbService.setCompanySigningCfdi(issuerId, false)
    return next(new RequestError(400, 'createCfdi.errors.apiSignError', { message: signError }))
  }

  const signedRelatedDocuments = signedCfdi.Complement.Payments.flatMap(
    ({ RelatedDocuments }: { RelatedDocuments: any }) => RelatedDocuments
  )
  const cfdi: Cfdi = {
    createdAt: new Date(signedCfdi.Date),
    createdBy: loggedUser._id,
    createdByUsername: loggedUser.username,
    status: 'active',
    deliveryStatus: 'pending',
    apiId: signedCfdi.Id,
    issuer: createCfdiIssuer(issuer),
    receiver: createCfdiReceiver(receiver, 'P01'),
    cfdiType,
    folio: signedCfdi.Folio,
    certNumber: signedCfdi.CertNumber,
    expeditionPlace: signedCfdi.ExpeditionPlace,
    uuid: signedCfdi.Complement.TaxStamp.Uuid,
    cfdiSign: signedCfdi.Complement.TaxStamp.CfdiSign,
    cfdiSignDate: signedCfdi.Complement.TaxStamp.Date, // TODO: Test to ensure is stored as Date type
    satCertNumber: signedCfdi.Complement.TaxStamp.SatCertNumber,
    satSign: signedCfdi.Complement.TaxStamp.SatSign,
    payments: payments.map(({ relatedCfdis, ...rest }) => ({ ...rest, cfdisUuids: relatedCfdis.map(({ uuid }) => uuid) })),
    relatedCfdis: relatedInvoices.map(invoice => {
      const signedRelatedDocument = signedRelatedDocuments.find(({ Uuid }: { Uuid: string }) => Uuid === invoice.uuid)
      return {
        id: invoice._id,
        uuid: invoice.uuid,
        type: invoice.cfdiType,
        status: invoice.status,
        folio: invoice.folio,
        currency: signedRelatedDocument.Currency,
        exchangeRate: signedRelatedDocument.ExchangeRate,
        total: invoice.total,
        createdAt: invoice.createdAt,
        previousBalanceAmount: signedRelatedDocument.PreviousBalanceAmount,
        amountPaid: signedRelatedDocument.AmountPaid,
        partialityNumber: signedRelatedDocument.PartialityNumber,
        paymentMethod: signedRelatedDocument.PaymentMethod,
      }
    }),
    notes,
    // pdfDocumentId?: string // TODO: BUILD
    // xmlDocumentId?: string // TODO: GET
    // deliveryEmails?: [string] // TODO: REVIEW EMAIL SENDING IMPLEMENTATION
  }

  const cfdiId = await dbService.saveCfdi({ cfdi, sentCfdiId })
  await dbService.setCompanySigningCfdi(issuerId, false)

  const eventDetails = { id: cfdiId, type: cfdiType, number: cfdi.folio || null }
  await dbService.addEventLog(dbService.eventLogTypes.createCfdi, eventDetails, loggedUser)

  req.cfdiId = cfdiId
  res.json({ cfdiId })
  return next()
}

type CreateCfdiPdfRequest = NextApiRequest & { cfdiId: string }

export const generateCfdiPdf = (publicUrl: string) => async (req: CreateCfdiPdfRequest, res: NextApiResponse, next: Function) => {
  const { cfdiId } = req
  if (process.env.NODE_ENV === 'production') {
    await createPdfFromUrl(`${publicUrl}/cfdi/${cfdiId}`, `${publicUrl}/api/billing/cfdi-pdf-created`, { cfdiId })
  }
  next()
}

export default composeRoute(
  [
    methodFilter('post'),
    checkUserTokenMiddleware,
    dbConnection,
    loadUser({ isRequired: false }),
    createInvoiceOrCreditNote,
    createPaymentProof,
    generateCfdiPdf(`https://${process.env.VERCEL_URL}` as string),
  ],
  errorHandler,
  dbConnectionClose
)

// TODO: Move to i18n
//   'createCfdi.errors.issuerRequired': 'Debe especificar el emisor de la factura',
//   'createCfdi.errors.receiverRequired': 'Debe seleccionar el cliente que recibe la factura',
//   'createCfdi.errors.paymentMethodRequired': 'Seleccione un método de pago',
//   'createCfdi.errors.paymentTypeRequired': 'Seleccione una forma de pago',
//   'createCfdi.errors.creditDaysRequired': 'Seleccione las condiciones de pago (Días de crédito)',
//   'createCfdi.errors.exchangeRateInvalid': 'El valor de la tasa de cambio no es válido.',
//   'createCfdi.errors.itemsRequired': 'Debe especificar uno o más',
//   'createCfdi.errors.issuerReceiverAreEqual': 'El emisor y receptor de la factura no pueden ser iguales.',
//   'createCfdi.errors.relatedServiceNotFound': 'Error al consultar una o más de las órdenes de embarque'
//   'createCfdi.errors.invalidRelatedServiceType': 'Solo se puede crear una factura a partir de una orden, no de una cotización.',
//   'createCfdi.errors.cfdiUseRequired': 'Debe especificar un uso de CFDI',

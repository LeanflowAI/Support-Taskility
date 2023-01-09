import { getPaymentMethodName, getPaymentTypeName } from '../../../services/catalogs'

export const paymentIncludesInvoice = (payment, invoiceId) => {
  return payment?.relatedCfdis?.map(({ id }) => id).includes(invoiceId)
}

export const cfdiIncludesQuotation = (quotationId, cfdiItems = [],) =>
  Boolean(cfdiItems.find(({ service = {} }) => service.quotationId === quotationId))

export const cfdiIncludesAllServiceQuotations = (cfdiItems = [], quotations = []) => {
  const quotationsIds = quotations.map(({ id }) => id)
  if (!quotationsIds.length) return false
  return Boolean(quotationsIds.every(quotationId => cfdiIncludesQuotation(quotationId, cfdiItems)))
}

export const defaultState = {
  creatingCfdi: false,
  finished: false,
  apiError: null,
  step: 0,
  cfdi: { cfdiType: 'none' },
  stepHistory: [],
  errors: {},
  selectedAdditionalItem: null,
}

export const newCfdiReducer = (state, { type, value }) => {
  const { step, cfdi, apiError, stepHistory } = state
  switch (type) {
    case 'setStep': 
      return {...state, step: value }
    case 'nextStep':
      return { ...state, step: step + 1, stepHistory: [...stepHistory, state] }
    case 'previousStep':
      return stepHistory.length > 0 ? [...stepHistory].pop() : defaultState
    case 'setFields': {
      const newStep = value.cfdiType === 'none' ? 0 : step + 1
      const newCfdi = value.cfdiType === 'none' ? defaultState.cfdi : { ...cfdi, ...value }
      return { ...state, step: !value.cfdiType ? step : newStep, cfdi: newCfdi, errors: {} }
    }
    case 'setIssuers':
      return { ...state, issuers: value }
    case 'setReceivers':
      return { ...state, receivers: value }
    case 'setDefaultFields': {
      const fieldsToAdd = Object.entries(value)
        .filter(([key]) => !(key in cfdi))
        .reduce((prev, [key, val]) => ({ ...prev, [key]: val }), {})
      return Object.keys(fieldsToAdd).length === 0 ? state : { ...state, step, cfdi: { ...cfdi, ...fieldsToAdd } }
    }
    case 'addServiceQuotation': {
      const { serviceId, quotation } = value
      const { id, productCode, unit, quantity, unitValue, subtotal, total } = quotation
      const { haveTax, haveIvaRet, tax, ivaRet, notes } = quotation

      // Remove the item if its already added.
      if (cfdiIncludesQuotation(id, cfdi.items))
        return { ...state, cfdi: { ...cfdi, items: cfdi.items.filter(({ service = {} }) => service.quotationId !== id) } }

      const itemService = { id: serviceId, quotationId: id }
      const taxes = []
      if (haveTax) taxes.push({ name: 'iva', rate: 0.16, isRetention: false, value: tax })
      if (haveIvaRet) taxes.push({ name: 'iva', rate: 0.04, isRetention: true, value: ivaRet })
      const item = { productCode, unit, quantity, unitValue, subtotal, total, taxes, service: itemService, notes }
      return { ...state, cfdi: { ...cfdi, items: [...(cfdi.items || []), item] }, errors: {} }
    }
    case 'addAdditionalItem': {
      const { id, productCode, unit, quantity, unitValue, subtotal, haveTax, haveIvaRet, tax, ivaRet, total, notes } = value
      const taxes = []
      if (haveTax) taxes.push({ name: 'iva', rate: 0.16, isRetention: false, value: tax })
      if (haveIvaRet) taxes.push({ name: 'iva', rate: 0.04, isRetention: true, value: ivaRet })
      const newItem = { productCode, unit, quantity, unitValue, subtotal, total, taxes, notes }
      const items =
        id !== null ? cfdi.items.map((item, index) => (index !== id ? item : { ...item, ...newItem })) : [...(cfdi.items || []), newItem]
      return { ...state, cfdi: { ...cfdi, items }, errors: {} }
    }
    case 'removeAdditionalItem':
      return {
        ...state,
        cfdi: { ...cfdi, items: cfdi.items.filter((_, index) => index !== value) },
        errors: {},
        selectedAdditionalItem: null,
      }
    case 'setSelectedAdditionalItem':
      return { ...state, selectedAdditionalItem: value }
    case 'addPaymentProofPayment': {
      const { id, date, paymentForm, currency, exchangeRate, issuerAccount, receiverAccount, operationNumber } = value
      const newItem = { id, date, paymentForm, currency, exchangeRate, issuerAccount, receiverAccount, operationNumber, amount: 0 }
      const payments =
        id !== null
          ? cfdi.payments.map(item => (item.id !== id ? item : { ...item, ...newItem }))
          : [...(cfdi.payments || []), { ...newItem, id: Math.random().toString().replace('.', '') }]
      return { ...state, cfdi: { ...cfdi, payments }, errors: {} }
    }
    case 'setSelectedPayment':
      return { ...state, selectedPayment: value }
    case 'removePaymentProofPayment':
      return {
        ...state,
        cfdi: { ...cfdi, payments: cfdi.payments.filter(({ id }) => id !== value) },
        errors: {},
        selectedAdditionalItem: null,
      }
    case 'addInvoiceToPayment': {
      const { invoice, paymentId } = value
      const { _id, uuid, total, exchangeRate } = invoice
      const newInvoice = { id: _id, uuid, total, exchangeRate }

      const newPayment = cfdi.payments.find(({ id: pId }) => pId === paymentId)
      // Remove the invoice if its already added to the payment
      if (paymentIncludesInvoice(newPayment, _id)) {
        newPayment.relatedCfdis = newPayment.relatedCfdis.filter(({ id }) => id !== _id)
      } else {
        newPayment.relatedCfdis = newPayment.relatedCfdis ? [...newPayment.relatedCfdis, newInvoice] : [newInvoice]
      }
      newPayment.amount = newPayment.relatedCfdis.reduce((sum, { total: relatedCfdiTotal }) => sum + relatedCfdiTotal, 0)
      const payments = cfdi.payments.map(item => (item.id === paymentId ? newPayment : item))
      return { ...state, cfdi: { ...cfdi, payments }, errors: {} }
    }
    case 'setInvoicePayedValue': {
      const { paymentId, invoiceId, amountToPay } = value
      const payment = cfdi.payments.find(({ id }) => id === paymentId)
      const invoice = payment.relatedCfdis.find(({ id }) => id === invoiceId)
      const restInvoices = payment.relatedCfdis.filter(({ id }) => id !== invoiceId)
      const newInvoice = { ...invoice, total: Number(amountToPay) }
      const newRelatedCfdis = [...restInvoices, newInvoice]
      const newPayment = {
        ...payment,
        relatedCfdis: newRelatedCfdis,
        amount:
          Math.round(
            newRelatedCfdis.reduce(
              (sum, { total: relatedCfdiTotal, exchangeRate }) => sum + (exchangeRate ? relatedCfdiTotal / exchangeRate : relatedCfdiTotal),
              0
            ) * 100
          ) / 100,
      }
      const payments = cfdi.payments.map(item => (item.id === paymentId ? newPayment : item))

      return { ...state, cfdi: { ...cfdi, payments }, errors: {} }
    }
    case 'setInvoiceExchangeRate': {
      const { paymentId, invoiceId, paymentExchangeRate } = value
      const payment = cfdi.payments.find(({ id }) => id === paymentId)
      const invoice = payment.relatedCfdis.find(({ id }) => id === invoiceId)
      const restInvoices = payment.relatedCfdis.filter(({ id }) => id !== invoiceId)
      const newInvoice = { ...invoice, exchangeRate: Number(paymentExchangeRate) }
      const newRelatedCfdis = [...restInvoices, newInvoice]
      const newPayment = {
        ...payment,
        relatedCfdis: newRelatedCfdis,
        amount:
          Math.round(
            newRelatedCfdis.reduce(
              (sum, { total: relatedCfdiTotal, exchangeRate }) => sum + (exchangeRate ? relatedCfdiTotal / exchangeRate : relatedCfdiTotal),
              0
            ) * 100
          ) / 100,
      }
      const payments = cfdi.payments.map(item => (item.id === paymentId ? newPayment : item))

      return { ...state, cfdi: { ...cfdi, payments }, errors: {} }
    }
    case 'setCreatingCfdi':
      return { ...state, creatingCfdi: value, apiError: value ? null : apiError }
    case 'setFinished':
      return { ...state, finished: value, apiError: null }
    case 'setApiError':
      return { ...state, apiError: value.error, apiErrorDetails: value.details }
    case 'reset':
      return { ...defaultState }
    case 'addItem': {
      /* Item creado por el usuario (productCode, unit, quantity, unitValue, subtotal, total, taxes) */
      return state
    }
    case 'setErrors':
      return { ...state, errors: value }
    default:
      return state
  }
}

// TODO: Duplicated on create-cfdi
const nextPartialityNumber = invoice => {
  const count = invoice.relatedCfdis?.filter(cfdi => cfdi.type === 'paymentProof').length
  return count ? count + 1 : 1
}

export const buildCfdiToPreview = (formCfdi, issuers = [], receivers = [], services = [], attachableInvoices = []) => {
  const {
    cfdiType,
    billOfLadingType,
    issuerId,
    receiverId,
    currency,
    paymentMethod,
    paymentType,
    creditDays,
    cfdiUse,
    notes = '',
    items = [],
  } = formCfdi
  const { payments = [] } = formCfdi
  const selectedIssuer = issuerId ? issuers.find(({ _id }) => _id === issuerId) : null
  const selectedReceiver = receiverId ? receivers.find(({ _id }) => _id === receiverId) : null

  const { _id: issuerIdToRemove, ...selectedIssuerDetails } = selectedIssuer || {}
  const { _id: receiverIdToRemove, ...selectedReceiverDetails } = selectedReceiver || {}

  const relatedServices = [...new Set(items.map(i => i.service?.id).filter(Boolean))].map(serviceId => {
    const service = services.find(({ _id }) => _id === serviceId) || {}
    return {
      id: serviceId,
      reference: service.referencia || '',
      notes: service.observaciones || '',
      createdAt: service.submitted,
      clientReference: service.orderClientReference || '',
      origin: service.origin || '',
      destination: service.destination || '',
      shipmentType: service.shipmentType || '',
      pickupDate: service.pickupDate || '',
      deadline: service.deadline || '',
      milestonesList: service.milestonesList || '',
    }
  })

  return {
    cfdiType,
    billOfLadingType,
    issuer: selectedIssuer ? { id: issuerId, ...selectedIssuerDetails } : null,
    receiver: selectedReceiver ? { id: receiverId, cfdiUse, ...selectedReceiverDetails } : null,
    shortCurrency: currency,
    paymentMethod: getPaymentMethodName(paymentMethod),
    paymentTerms: getPaymentTypeName(paymentType),
    paymentConditions: (creditDays || creditDays === 0) && (creditDays !== 0 ? `${creditDays} días` : 'Contado'),
    cfdiSign: '0'.repeat(200),
    satCertNumber: '00001000000123456789',
    satSign: '0'.repeat(200),
    items: items.map((item, idx) => ({ id: idx, ...item })),
    relatedServices,
    subtotal: items.reduce((sum, { subtotal }) => sum + subtotal, 0),
    total: items.reduce((sum, { total }) => sum + total, 0),
    payments: payments.map(payment => {
      const { relatedCfdis = [], receiverAccount, issuerAccount } = payment
      const cfdisUuids = relatedCfdis.map(({ uuid }) => uuid)
      // TODO: Show bank account details: "<number> <bank name> - <currency>"
      return { ...payment, receiverAccount: receiverAccount?.number || '', issuerAccount: issuerAccount?.number || '', cfdisUuids }
    }),
    relatedCfdis: payments
      ?.flatMap(({ relatedCfdis = [] }) => relatedCfdis)
      .map(relatedInvoice => {
        const invoice = attachableInvoices.find(({ _id }) => _id === relatedInvoice.id)
        return {
          ...relatedInvoice,
          folio: invoice.folio,
          uuid: invoice.uuid,
          currency: invoice.shortCurrency,
          paymentMethod: invoice.paymentMethod,
          partialityNumber: nextPartialityNumber(invoice),
          previousBalanceAmount: invoice.pendingAmount,
          amountPaid: relatedInvoice.total,
        }
      }),
    notes,
  }
}

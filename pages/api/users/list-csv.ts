import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler, loadUser } from 'services/api/helpers/middlewares'
import { Cfdi, CfdiType, DbService, User } from 'services/model'
import { pathOr, propOr, toString, compose, pluck, join } from 'ramda'
import { dateFormat, timeFormat } from 'services/helpers/dateFormat'
import { numberFormat } from 'services/helpers/mathHelp'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; loggedUser: User }

// TODO: Move getCfdiIvaTotal, getCfdiRetentionIvaTotal to database utitilies file.
const getCfdiIvaTotal = (cfdi: Cfdi) =>
  cfdi.items
    ?.flatMap(({ taxes }) => taxes)
    .filter(tax => !tax?.isRetention)
    .reduce((total, tax) => (tax ? total + tax.value : total), 0) || 0

const getCfdiRetentionIvaTotal = (cfdi: Cfdi) =>
  cfdi.items
    ?.flatMap(({ taxes }) => taxes)
    .filter(tax => tax?.isRetention)
    .reduce((total, tax) => (tax ? total + tax.value : total), 0) || 0

const filtersByReportType: { [x: string]: Array<{ name: string; value: any }> } = {
  billing: [{ name: 'cfdiType', value: { $ne: 'paymentProof' } }],
  paymentProofs: [{ name: 'cfdiType', value: 'paymentProof' }],
  contpaq: [{ name: 'cfdiType', value: { $ne: 'paymentProof' } }],
}

const negativeValueIfIsCreditNote = (value: any, cfdi: Cfdi) => {
  if (!value || cfdi.cfdiType !== 'creditNote' || value <= 0 || Number.isNaN(Number(value))) return value
  return -value
}

const cfdiTransformByReportType: { [x: string]: (cfdis: Array<Cfdi>) => Array<Cfdi> } = {
  billing: (cfdis: Array<Cfdi>) => cfdis,
  paymentProofs: (cfdis: Array<Cfdi>) =>
    cfdis.reduce((list: Array<Cfdi>, cfdi) => [...list, ...(cfdi.payments?.map(payment => ({ ...cfdi, payments: [payment] })) || [])], []),
  contpaq: (cfdis: Array<Cfdi>) => cfdis,
}

const getFolioWithCfdiType = (cfdiType: CfdiType, folio: number) => {
  const initialByType: { [x: string]: string } = { invoice: 'F', creditNote: 'CN' }
  return `${initialByType[cfdiType] || ''}${folio}`
}

const getFormattedCfdiFolio = ({ cfdiType, folio, relatedCfdis = [] }: Cfdi) =>
  `${getFolioWithCfdiType(cfdiType, folio)} ${relatedCfdis
    .filter(({ type }) => type === 'invoice')
    .map(({ type, folio: relatedFolio }) => getFolioWithCfdiType(type, relatedFolio))
    .join(',')}`

const fieldsByReportType: { [x: string]: Array<{ label: string; path: string | Function }> } = {
  billing: [
    { label: 'Cfdi type', path: 'cfdiType' },
    { label: 'Status', path: 'status' },
    { label: 'Issuer RFC', path: 'issuer.rfc' },
    { label: 'Issuer', path: 'issuer.name' },
    { label: 'Receiver RFC', path: 'receiver.rfc' },
    { label: 'Receiver', path: 'receiver.name' },
    { label: 'Folio', path: getFormattedCfdiFolio },
    // @ts-ignore
    { label: 'Service References', path: compose(join(', '), pluck('reference'), propOr([], 'relatedServices')) },
    { label: 'UUID', path: 'uuid' },
    { label: 'Date', path: ({ cfdiSignDate }: Cfdi) => dateFormat(cfdiSignDate) },
    { label: 'Time', path: ({ cfdiSignDate }: Cfdi) => timeFormat(cfdiSignDate) },
    { label: 'IVA', path: (cfdi: Cfdi) => numberFormat(negativeValueIfIsCreditNote(getCfdiIvaTotal(cfdi), cfdi)) },
    { label: 'IVA R', path: (cfdi: Cfdi) => numberFormat(negativeValueIfIsCreditNote(getCfdiRetentionIvaTotal(cfdi), cfdi)) },
    { label: 'Subtotal', path: (cfdi: Cfdi) => negativeValueIfIsCreditNote(cfdi.subtotal, cfdi) },
    { label: 'Total', path: (cfdi: Cfdi) => negativeValueIfIsCreditNote(cfdi.total, cfdi) },
    { label: 'Currency', path: 'shortCurrency' },
    { label: 'Exchange Rate', path: ({ exchangeRate }: { exchangeRate: number }) => numberFormat(exchangeRate || 1) },
    {
      label: 'IVA * ExchangeRate',
      path: (cfdi: Cfdi) => numberFormat(negativeValueIfIsCreditNote(getCfdiIvaTotal(cfdi) * (cfdi.exchangeRate || 1), cfdi)),
    },
    {
      label: 'IVA R * ExchangeRate',
      path: (cfdi: Cfdi) => numberFormat(negativeValueIfIsCreditNote(getCfdiRetentionIvaTotal(cfdi) * (cfdi.exchangeRate || 1), cfdi)),
    },
    {
      label: 'Subtotal * Exchange Rate',
      path: (cfdi: Cfdi) =>
        numberFormat(negativeValueIfIsCreditNote((cfdi.exchangeRate || 1) * (cfdi.subtotal || 0), cfdi), { maximumFractionDigits: 2 }),
    },
    {
      label: 'Total * Exchange Rate',
      path: (cfdi: Cfdi) =>
        numberFormat(negativeValueIfIsCreditNote((cfdi.exchangeRate || 1) * (cfdi.total || 0), cfdi), { maximumFractionDigits: 2 }),
    },
  ],
  paymentProofs: [
    { label: 'Status', path: 'status' },
    { label: 'Issuer RFC', path: 'issuer.rfc' },
    { label: 'Issuer', path: 'issuer.name' },
    { label: 'Receiver RFC', path: 'receiver.rfc' },
    { label: 'Receiver', path: 'receiver.name' },
    { label: 'Folio', path: 'folio' },
    { label: 'UUID', path: 'uuid' },
    { label: 'Date', path: ({ cfdiSignDate }: { cfdiSignDate: string }) => dateFormat(cfdiSignDate) },
    { label: 'Time', path: ({ cfdiSignDate }: { cfdiSignDate: string }) => timeFormat(cfdiSignDate) },
    { label: 'Payment amount', path: ({ payments = [] }: Cfdi) => payments[0].amount },
    { label: 'Payment currency', path: ({ payments = [] }: Cfdi) => payments[0].currency },
    { label: 'Payment rate', path: ({ payments = [] }: Cfdi) => payments[0].exchangeRate },
    { label: 'Related invoices', path: ({ relatedCfdis = [] }: Cfdi) => relatedCfdis.map(({ folio }) => folio).join(', ') },
  ],
  contpaq: [
    { label: 'TIPO DE CFDI', path: 'cfdiType' },
    { label: 'RFC DE EMISOR', path: 'issuer.rfc' },
    { label: 'RAZÓN SOCIAL EMISOR', path: 'issuer.name' },
    { label: 'RFC DEL CLIENTE', path: 'receiver.rfc' },
    { label: 'Razón Social del cliente', path: 'receiver.name' },
    { label: 'Folio', path: getFormattedCfdiFolio },
    { label: 'UUID', path: 'uuid' },
    { label: 'Date', path: ({ cfdiSignDate }: Cfdi) => dateFormat(cfdiSignDate) },
    { label: 'Time', path: ({ cfdiSignDate }: Cfdi) => timeFormat(cfdiSignDate) },
    { label: 'Subtotal', path: (cfdi: Cfdi) => negativeValueIfIsCreditNote(cfdi.subtotal, cfdi) },
    { label: 'IVA', path: (cfdi: Cfdi) => numberFormat(negativeValueIfIsCreditNote(getCfdiIvaTotal(cfdi), cfdi)) },
    { label: 'IVA Retenido', path: (cfdi: Cfdi) => numberFormat(negativeValueIfIsCreditNote(getCfdiRetentionIvaTotal(cfdi), cfdi)) },
    { label: 'Total', path: (cfdi: Cfdi) => negativeValueIfIsCreditNote(cfdi.total, cfdi) },
    { label: 'Mon', path: 'shortCurrency' },
    { label: 'Tipo de cambio', path: ({ exchangeRate }: Cfdi) => numberFormat(exchangeRate || 1) },
    { label: 'Status', path: ({ status }: Cfdi) => status.toUpperCase().slice(0, 1) },
    {
      label: 'Subtotal',
      path: (cfdi: Cfdi) =>
        numberFormat(negativeValueIfIsCreditNote((cfdi.exchangeRate || 1) * (cfdi.subtotal || 0), cfdi), { maximumFractionDigits: 2 }),
    },
    {
      label: 'Subtotal',
      path: (cfdi: Cfdi) =>
        numberFormat(negativeValueIfIsCreditNote((cfdi.exchangeRate || 1) * (cfdi.subtotal || 0) - (cfdi.subtotal || 0), cfdi), {
          maximumFractionDigits: 2,
        }),
    },
    {
      label: 'Importe',
      path: (cfdi: Cfdi) =>
        numberFormat(negativeValueIfIsCreditNote((cfdi.exchangeRate || 1) * (cfdi.total || 0), cfdi), { maximumFractionDigits: 2 }),
    },
    {
      label: 'RET IVA',
      path: (cfdi: Cfdi) => numberFormat(negativeValueIfIsCreditNote(getCfdiRetentionIvaTotal(cfdi) * (cfdi.exchangeRate || 1), cfdi)),
    },
    {
      label: 'IVA',
      path: (cfdi: Cfdi) => numberFormat(negativeValueIfIsCreditNote(getCfdiIvaTotal(cfdi) * (cfdi.exchangeRate || 1), cfdi)),
    },
    {
      label: 'Total',
      path: (cfdi: Cfdi) =>
        numberFormat(negativeValueIfIsCreditNote((cfdi.exchangeRate || 1) * (cfdi.total || 0), cfdi), { maximumFractionDigits: 2 }),
    },
  ],
}

// TODO: Tests for this handler
export const routeHandler = async (req: Request, res: NextApiResponse, next: Function) => {
  const { dbService, loggedUser, query } = req
  const { from = '', to = '', reportType = 'billing', cfdiType, cfdiStatus, cfdiClients } = query

  const filters = filtersByReportType[reportType as string]
  if (!filters) throw new RequestError(404, 'invoicesList.errors.invalidReportType')

  const { cfdis, count } = await dbService.getCfdiList({
    user: loggedUser,
    from: from as string,
    to: to as string,
    filters,
    cfdiType: cfdiType as string,
    cfdiStatus: cfdiStatus as string,
    cfdiClients: cfdiClients as string,
  })

  if (count > 0) {
    const csvSeparator = ','
    const cfdiTransformFn = cfdiTransformByReportType[reportType as string]
    const fields = fieldsByReportType[reportType as string]
    const cfdiToCsvRow = (cfdi: Cfdi) =>
      `${fields
        // @ts-ignore
        .map(({ path }) => (typeof path === 'function' ? path(cfdi) : pathOr('', path.split('.'), cfdi)))
        .map(toString)
        .join(csvSeparator)}`
    const csvTitleRow = `${fields.map(pathOr('', ['label'])).join(csvSeparator)}\n`
    const csvData = `${csvTitleRow}${cfdiTransformFn(cfdis).map(cfdiToCsvRow).join('\n')}`
    res.json({ csvData, count })
  } else {
    res.json({ csvData: '', count })
  }
  return next()
}

export default composeRoute(
  [methodFilter('post'), checkUserTokenMiddleware, dbConnection, loadUser({ isRequired: true }), routeHandler],
  errorHandler,
  dbConnectionClose
)

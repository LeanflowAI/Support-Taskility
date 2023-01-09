import { NextApiRequest, NextApiResponse } from 'next'
import { composeRoute, RequestError } from 'services/api/helpers'
import { methodFilter, checkUserToken, dbConnection, dbConnectionClose, errorHandler, loadUser } from 'services/api/helpers/middlewares'
import { Cfdi, CfdiType, DbService, User } from 'services/model'
import { pathOr, propOr, toString, compose, pluck, join } from 'ramda'
import { dateFormat, timeFormat } from 'services/helpers/dateFormat'
import { numberFormat } from 'services/helpers/mathHelp'
import moment from 'moment'
import { array } from 'prop-types'

const checkUserTokenMiddleware = checkUserToken({ errorMessage: 'invoicesList.errors.invalidUser' })

type Request = NextApiRequest & { dbService: DbService; loggedUser: User }

// const dbServiceOut = Request.dbService

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
  operations: [{ name: 'cfdiType', value: { $ne: 'paymentProof' } }],
  profit: [{ name: 'cfdiType', value: 'paymentProof' }],
  contpaq: [{ name: 'cfdiType', value: { $ne: 'paymentProof' } }],
}

const negativeValueIfIsCreditNote = (value: any, cfdi: Cfdi) => {
  if (!value || cfdi.cfdiType !== 'creditNote' || value <= 0 || Number.isNaN(Number(value))) return value
  return -value
}

const getTagsValuesInString = (tags: Array<Object>, type: string) => {
  // console.log('tags', tags, 'type', type)
  let tagsString = ''
  tags.map((tag: any) => {
    if (tag.type === type) tagsString += `${tag.value}, `
    return null
  })
  return tagsString.slice(0, -2)
}

const getPedimentosInString = (goods: Array<Object>) => {
  let pedimentosString = ''
  goods.map((good: any) => {
    if (good?.pedimento) pedimentosString += `${good.pedimento}, ` || ''
    return null
  })
  return pedimentosString.slice(0, -2)
}

const calculateSubotalPrice = (cfdiDrafts: Array<any>) => {
  let subtotal: number = 0
  cfdiDrafts?.map((cfdiDraft: any) => {
    cfdiDraft?.items.map((item: any) => {
      if (typeof item.subtotal === 'undefined') return null
      subtotal += item.subtotal
      return null
    })
    return null
  })
  return subtotal
}
const calculateSubotalCost = (costs: Array<any>) => {
  let subtotal: number = 0
  costs?.map((cost: any) => {
    if (typeof cost.subtotal === 'undefined') return null
    subtotal += Number(cost?.subtotal)
    return null
  })
  return subtotal
}

const calculateMargin = (price: number, cost: number, decimals: number) => {
  if (price === 0) return -1
  const margin = (price - cost) / price
  return parseFloat(margin.toFixed(decimals))
}

const calculatePriceFromCostAndMargin = (cost: number, margin: number, decimals: number, totalPrice: number) => {
  if (totalPrice === 0) return 0
  const price = cost / (1 - margin)
  return parseFloat(price.toFixed(decimals))
}

const explodeHubDataByCost = (BoLHubs: any) => {
  const costBasedData = BoLHubs.map((BoLHub: any) => {
    const subtotalPrice = calculateSubotalPrice(BoLHub?.cfdiDrafts)
    // console.log('BoLHub', BoLHub)
    //  console.log('BoLHub._id', BoLHub?._id)
    // console.log('subtotalPrice', subtotalPrice)

    const subtotalCost = calculateSubotalCost(BoLHub?.billOfLading2?.costs)
    const hubMargin = calculateMargin(subtotalPrice, subtotalCost, 4)
    const locationsLenght = BoLHub?.billOfLading2?.locations.length || 0
    
    // console.log(BoLHub)
    // console.log('hubMargin', hubMargin)
    // console.log('BoLHub?.billOfLading2?.costs', BoLHub?.billOfLading2?.costs)
    // console.log('BoLHub?.billOfLading2?.costs.leght', BoLHub?.billOfLading2?.costs.length)
    let costBasedRows: any[] = []
    if (BoLHub?.billOfLading2?.costs && BoLHub?.billOfLading2?.costs.length > 0 && typeof BoLHub?.billOfLading2?.costs !== 'undefined') {
      costBasedRows = BoLHub?.billOfLading2?.costs?.map((cost: any) => {
        const costSubtotal = cost?.subtotal || 0
        const lastLocationIndex = locationsLenght > 0 ? locationsLenght - 1 : 0
        const rowSubtotalPrice = calculatePriceFromCostAndMargin(cost?.subtotal, hubMargin, 2, subtotalPrice)
        const rowMonetaryProfit = rowSubtotalPrice - costSubtotal
        // console.log('cost', cost)
        // console.log('lastLocationIndex', lastLocationIndex)
        // console.log('rowSubtotalPrice', rowSubtotalPrice)
        // console.log('rowMonetaryProfit', rowMonetaryProfit)

        // console.log(BoLHub?.billOfLading2?.transports[cost?.transportIndex || 0].figures)

        const costBasedRow = {
          cusomerName: BoLHub?.clientName || 'N/A',
          weekOfTheYear: moment().format('WW') || 'N/A',
          hubFolio: BoLHub?.folio || 'N/A',
          shipments: getTagsValuesInString(BoLHub?.tags, 'shipment') || 'N/A',
          purchaseOrders: getTagsValuesInString(BoLHub?.tags, 'purchaseOrder') || 'N/A',
          customerReferences: getTagsValuesInString(BoLHub?.tags, 'customerReference') || 'N/A',
          categories: getTagsValuesInString(BoLHub?.tags, 'category') || 'N/A',
          keys: getTagsValuesInString(BoLHub?.tags, 'keyword') || 'N/A',
          others: getTagsValuesInString(BoLHub?.tags, 'other') || 'N/A',
          pickupDate: BoLHub?.billOfLading2?.locations[0] ? BoLHub?.billOfLading2?.locations[0].departureArrivalDateTime?.print : 'N/A',
          pickupCompany: BoLHub?.billOfLading2?.locations[0] ? BoLHub?.billOfLading2?.locations[0].company?.name : 'N/A',
          pickupPlace: BoLHub?.billOfLading2?.locations[0] ? BoLHub?.billOfLading2?.locations[0].place?.formattedAddress : 'N/A',
          deliveryDate: BoLHub?.billOfLading2?.locations[lastLocationIndex]
            ? BoLHub?.billOfLading2?.locations[lastLocationIndex].departureArrivalDateTime?.print
            : 'N/A',
          deliveryCompany: BoLHub?.billOfLading2?.locations[lastLocationIndex]
            ? BoLHub?.billOfLading2?.locations[lastLocationIndex].company?.name
            : 'N/A',
          deliveryPlace: BoLHub?.billOfLading2?.locations[lastLocationIndex]
            ? BoLHub?.billOfLading2?.locations[lastLocationIndex].place?.formattedAddress
            : 'N/A',
          carrier: cost?.company?.comercialName || 'N/A',
          vehicleType: BoLHub?.billOfLading2?.transports[cost?.transportIndex || 0].autotransport?.vehicle?.typeOfVehicleSAT || 'N/A',
          vehicleNumber: BoLHub?.billOfLading2?.transports[cost?.transportIndex || 0].autotransport?.vehicle?.number || 'N/A',
          vehiclePlateNumber: BoLHub?.billOfLading2?.transports[cost?.transportIndex || 0].autotransport?.vehicle?.plateNumber || 'N/A',
          trailerType: BoLHub?.billOfLading2?.transports[cost?.transportIndex || 0].autotransport?.trailers?.typeOfTrailerSAT || 'N/A',
          trailerNumber: BoLHub?.billOfLading2?.transports[cost?.transportIndex || 0].autotransport?.trailers?.number || 'N/A',
          trailerPlateNumber: BoLHub?.billOfLading2?.transports[cost?.transportIndex || 0].autotransport?.trailers?.plateNumber || 'N/A',
          operatorName:
            cost?.transportIndex && BoLHub?.billOfLading2?.transports[cost?.transportIndex || 0].figures
              ? BoLHub?.billOfLading2?.transports[cost?.transportIndex || 0].figures[0].name
              : 'N/A',
          pedimentos: getPedimentosInString(BoLHub?.billOfLading2?.goods?.good) || 'N/A',
          foreignFreightCost: cost?.foreignFreight || 'N/A',
          nationalFreightCost: cost?.nationalFreight || 'N/A',
          borderCross: cost?.borderCross || 'N/A',
          fuelCost: cost?.fuel || 'N/A',
          extraCosts: cost?.extra || 'N/A',
          subtotalCosts: cost?.subtotal || 'N/A',
          costsCurrency: cost?.currency || 'N/A',
          costsExchangeRate: cost?.exchangeRate || 'N/A',
          invoiceNumber: cost?.folio || 'N/A',
          invoiceDate: cost?.date?.print ? cost?.date.print : 'N/A',
          subtotalPrice: rowSubtotalPrice || 'N/A',
          priceCurrency: BoLHub?.cfdiDrafts && BoLHub?.cfdiDrafts.length > 0 ? BoLHub?.cfdiDrafts[0].currency : 'N/A',
          priceExchangeRate: BoLHub?.cfdiDrafts && BoLHub?.cfdiDrafts.length > 0 ? BoLHub?.cfdiDrafts[0].exchangeRate : 'N/A',
          monetaryProfit: rowMonetaryProfit || 'N/A',
          percentageProfit: `${hubMargin * 100}%` || 'N/A',
        }
        // console.log('costBasedRow', costBasedRow)
        return costBasedRow
      })
    } else {
      const lastLocationIndex = locationsLenght > 0 ? locationsLenght - 1 : 0
      const rowSubtotalPrice = 'ND'
      const rowMonetaryProfit = 'ND'
      const costBasedRow = {
        cusomerName: BoLHub?.clientName || 'N/A',
        weekOfTheYear: moment().format('WW') || 'N/A',
        hubFolio: BoLHub?.folio || 'N/A',
        shipments: getTagsValuesInString(BoLHub?.tags, 'shipment') || 'N/A',
        purchaseOrders: getTagsValuesInString(BoLHub?.tags, 'purchaseOrder') || 'N/A',
        customerReferences: getTagsValuesInString(BoLHub?.tags, 'customerReference') || 'N/A',
        categories: getTagsValuesInString(BoLHub?.tags, 'category') || 'N/A',
        keys: getTagsValuesInString(BoLHub?.tags, 'keyword') || 'N/A',
        others: getTagsValuesInString(BoLHub?.tags, 'other') || 'N/A',
        pickupDate: BoLHub?.billOfLading2?.locations[0] ? BoLHub?.billOfLading2?.locations[0].departureArrivalDateTime?.print : 'N/A',
        pickupCompany: BoLHub?.billOfLading2?.locations[0] ? BoLHub?.billOfLading2?.locations[0].company?.name : 'N/A',
        pickupPlace: BoLHub?.billOfLading2?.locations[0] ? BoLHub?.billOfLading2?.locations[0].place?.formattedAddress : 'N/A',
        deliveryDate: BoLHub?.billOfLading2?.locations[lastLocationIndex]
          ? BoLHub?.billOfLading2?.locations[lastLocationIndex].departureArrivalDateTime?.print
          : 'N/A',
        deliveryCompany: BoLHub?.billOfLading2?.locations[lastLocationIndex]
          ? BoLHub?.billOfLading2?.locations[lastLocationIndex].company?.name
          : 'N/A',
        deliveryPlace: BoLHub?.billOfLading2?.locations[lastLocationIndex]
          ? BoLHub?.billOfLading2?.locations[lastLocationIndex].place?.formattedAddress
          : 'N/A',
        carrier: 'N/A',
        vehicleType: 'N/A',
        vehicleNumber: 'N/A',
        vehiclePlateNumber: 'N/A',
        trailerType: 'N/A',
        trailerNumber: 'N/A',
        trailerPlateNumber: 'N/A',
        operatorName: 'N/A',
        pedimentos: getPedimentosInString(BoLHub?.billOfLading2?.goods?.good) || 'N/A',
        foreignFreightCost: 'N/A',
        nationalFreightCost: 'N/A',
        borderCross: 'N/A',
        fuelCost: 'N/A',
        extraCosts: 'N/A',
        subtotalCosts: 'N/A',
        costsCurrency: 'N/A',
        costsExchangeRate: 'N/A',
        invoiceNumber: 'N/A',
        invoiceDate: 'N/A',
        subtotalPrice: 'N/A',
        priceCurrency: BoLHub?.cfdiDrafts && BoLHub?.cfdiDrafts.length > 0 ? BoLHub?.cfdiDrafts[0].currency : 'N/A',
        priceExchangeRate: BoLHub?.cfdiDrafts && BoLHub?.cfdiDrafts.length > 0 ? BoLHub?.cfdiDrafts[0].exchangeRate : 'N/A',
        monetaryProfit: rowMonetaryProfit || 'N/A',
        percentageProfit: `${hubMargin * 100}%` || 'N/A',
      }
      costBasedRows = [costBasedRow]
    }
    // console.log('costBasedRows', costBasedRows)
    return costBasedRows
  })
  // console.log('costBasedData', costBasedData)
  return costBasedData
}
const cfdiTransformByReportType: { [x: string]: (cfdis: Array<any>) => Array<any> } = {
  operations: (cfdis: Array<object>) => cfdis,
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

// const getClientNameById = async (clientId: string) => {
//   const client = await dbServiceOut.getClientById
//   console.log('client in getClientNameById', client)
//   return client?.name.toString()
// }

const fieldsByReportType: { [x: string]: Array<{ label: string; path: string | Function }> } = {
  operations: [
    { label: 'Hub Id', path: '_id' }, // Review if this is eliminated
    { label: 'Shipment Id', path: 'tags.0.value' }, // Refactor to search for 'shipment' type
    // eslint-disable-next-line no-return-await
    { label: 'Account', path: 'clientId' }, // Requiers search for Company Name
    { label: 'Semana', path: 'createdAt' }, // Requiers transform in week number
    { label: 'Viaje Internacional', path: 'billOfLading2.internationalTransport' },
    { label: 'Loading ETA', path: 'billOfLading2.locations.0.departureArrivalDateTime.print' },
    { label: 'Loading Company', path: 'billOfLading2.locations.0.company.name' },
    { label: 'Loading Place', path: 'billOfLading2.locations.0.place.formattedAddress' },
    { label: 'Arrival ETA', path: 'billOfLading2.locations.1.departureArrivalDateTime.print' },
    { label: 'Arrival Company', path: 'billOfLading2.locations.1.company.name' },
    { label: 'Arrival Place', path: 'billOfLading2.locations.1.place.formattedAddress' },
    { label: 'Carrier', path: 'billOfLading2.transports.0.company.name' },
    { label: 'Truck Type', path: 'billOfLading2.transports.0.autotransport.typeOfVehicleSAT' },
    { label: 'Truck Number', path: 'billOfLading2.transports.0.autotransport.vehicle.number' },
    { label: 'Truck Licence Plate', path: 'billOfLading2.transports.0.autotransport.vehicle.plateNumber' },
    { label: 'Trailer Number', path: 'billOfLading2.transports.0.autotransport.trailers.number' },
    { label: 'Trailer Licence Plate', path: 'billOfLading2.transports.0.autotransport.trailers.plateNumber' },
    { label: 'Driver', path: 'billOfLading2.transports.0.figures.0.name' },
    { label: 'Driver Licence', path: 'billOfLading2.transports.0.figures.0.document' },
  ],
  profit: [
    { label: 'Customer Name', path: 'cusomerName' },
    { label: 'Week', path: 'weekOfTheYear' },
    { label: 'Hub', path: 'hubFolio' },
    { label: 'Shipments', path: 'shipments' },
    { label: 'Purchase Orders', path: 'purchaseOrders' },
    { label: 'Customer References', path: 'customerReferences' },
    { label: 'Categories', path: 'categories' },
    { label: 'Keys', path: 'keys' },
    { label: 'Other Identifiers', path: 'others' },
    { label: 'Pickup Date', path: 'pickupDate' },
    { label: 'Pickup Company', path: 'pickupCompany' },
    { label: 'Pickup Place', path: 'pickupPlace' },
    { label: 'Delivery Date', path: 'deliveryDate' },
    { label: 'Delivery Company', path: 'deliveryCompany' },
    { label: 'Delivery Place', path: 'deliveryPlace' },
    { label: 'Carrier', path: 'carrier' },
    { label: 'Vehicle Type', path: 'vehicleType' },
    { label: 'Vehicle Number', path: 'vehicleNumber' },
    { label: 'Vehicle Plate Number', path: 'vehiclePlateNumber' },
    { label: 'Trailer Type', path: 'trailerType' },
    { label: 'Trailer Number', path: 'trailerNumber' },
    { label: 'Trailer Plate Number', path: 'trailerPlateNumber' },
    { label: 'Operator Name', path: 'operatorName' },
    { label: 'Pedimentos', path: 'pedimentos' },
    { label: 'Foreign Freight Cost', path: 'foreignFreightCost' },
    { label: 'National Freight Cost', path: 'nationalFreightCost' },
    { label: 'Border Cross Cost', path: 'borderCross' },
    { label: 'Fuel Cost', path: 'fuelCost' },
    { label: 'Extra Costs', path: 'extraCosts' },
    { label: 'Subtotal Costs', path: 'subtotalCosts' },
    { label: 'Costs Currency', path: 'costsCurrency' },
    { label: 'Costs Exchange Rate', path: 'costsExchangeRate' },
    { label: 'Invoice Number', path: 'invoiceNumber' },
    { label: 'Subtotal Price', path: 'subtotalPrice' },
    { label: 'Price Currency', path: 'priceCurrency' },
    { label: 'Price Exchange Rate', path: 'priceExchangeRate' },
    { label: 'Monetary Profit', path: 'monetaryProfit' },
    { label: 'Percentage Profit', path: 'percentageProfit' },
  ],
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
  const { from = '', to = '', reportType = 'operations', BoLHClients, BoLHUsers } = query

  // const filters = filtersByReportType[reportType as string]
  // if (!filters) throw new RequestError(404, 'invoicesList.errors.invalidReportType')

  const { BoLHubs, count } = await dbService.getBoLHList({
    user: loggedUser,
    // filters,
    from: from as string,
    to: to as string,
    BoLHClients: BoLHClients as string,
    BoLHUsers: BoLHUsers as string,
  })
  // console.log('reportType', reportType)
  // console.log('BoLHubs count', count)

  if (reportType === 'profit') {
    if (count > 0) {
      const CfdiDraftPromises = BoLHubs.map(async (BoLHub: any) => {
        const cfdiDrafts = await dbService.getCfdiDraftsByBoLHId(BoLHub?._id as string)
        return { ...BoLHub, cfdiDrafts }
      })
      const BoLHubsWithCfdiDraft = await Promise.allSettled(CfdiDraftPromises).then((results: any) => {
        const BoLHubsResults = results.map((result: any) => {
          if (result.status === 'fulfilled') return result.value
          return null
        })
        return BoLHubsResults
      })
      // console.log('BoLHubsWithCfdiDraft', BoLHubsWithCfdiDraft[BoLHubsWithCfdiDraft.length - 1])
      const csvSeparator = ','
      const costsExploded = explodeHubDataByCost(BoLHubsWithCfdiDraft)
      // console.log('costsExploded', costsExploded)
      const cfdiTransformFn = cfdiTransformByReportType[reportType as string]
      const fields = fieldsByReportType[reportType as string]
      const hubToCsvRow = (hubCosts: any) => {
        // console.log('hubToCsvRow hubCosts', hubCosts)
        const returnTextArray: string[] = []
        if (hubCosts)
          hubCosts.map((cost: any) => {
            // console.log('cost', cost)
            // eslint-disable-next-line no-unused-expressions

            returnTextArray.push(
              `${fields
                // @ts-ignore
                .map(({ path }) => (typeof path === 'function' ? path(cost) : pathOr('', path.split('.'), cost)))
                .map(toString)
                .join(csvSeparator)}`
            )
            return null
          })
        // console.log('returnTextArray', returnTextArray)
        return returnTextArray.join('\n')
        // console.log('hubToCsvRow hubCosts 2', hubCosts)
      }
      const csvTitleRow = `${fields.map(pathOr('', ['label'])).join(csvSeparator)}\n`
      const csvData = `${csvTitleRow}${costsExploded.map(hubToCsvRow).join('\n')}`
      res.json({ csvData, count })
    } else {
      res.json({ csvData: '', count })
    }
    return next()
  }

  const dataForProfitReport = explodeHubDataByCost(BoLHubs)

  // console.log('BoLHubs', BoLHubs)

  if (count > 0) {
    const csvSeparator = ','
    const cfdiTransformFn = cfdiTransformByReportType[reportType as string]
    const fields = fieldsByReportType[reportType as string]
    const cfdiToCsvRow = (BoLHubs: object) =>
      `${fields
        // @ts-ignore
        .map(({ path }) => (typeof path === 'function' ? path(BoLHubs) : pathOr('', path.split('.'), BoLHubs)))
        .map(toString)
        .join(csvSeparator)}`
    const csvTitleRow = `${fields.map(pathOr('', ['label'])).join(csvSeparator)}\n`
    const csvData = `${csvTitleRow}${cfdiTransformFn(BoLHubs).map(cfdiToCsvRow).join('\n')}`
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

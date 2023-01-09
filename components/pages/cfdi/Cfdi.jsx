/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import qrcode from 'pure-svg-code/qrcode'
import { format } from 'date-fns'
import { dateFormat } from 'services/helpers/dateFormat'
import { currencyFormat, numberFormat } from 'services/helpers/mathHelp'
import { get } from '../../../services/fetch'
import { getPaymentTypeName, getServiceName } from '../../../services/catalogs'
import { i18n } from '../../../services/i18n'

const CfdiPreviewItems = ({ cfdiItems = [], currency = '', onAdditionalItemClicked }) => {
  const subtotal = cfdiItems.reduce((sub, { total }) => sub + total, 0)
  const rowClassname = `border-b border-solid border-t-0 border-l-0 border-r-0 border-gray-300 ${
    onAdditionalItemClicked ? 'hover:bg-blue-300 cursor-pointer' : ''
  }`
  return (
    <div className="my-4">
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th>Cantidad</th>
            <th>Clave de unidad</th>
            <th>Descripción</th>
            <th className="text-right">Precio</th>
            <th className="text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          {cfdiItems.map(item => {
            const { id, quantity, unit, productCode, unitValue, total, notes } = item
            return (
              <tr key={id} className={rowClassname} onClick={() => onAdditionalItemClicked && onAdditionalItemClicked(item)}>
                <td>{quantity}</td>
                <td>{unit}</td>
                <td>
                  <div>{`${productCode} - ${getServiceName(productCode)}`}</div>
                  {notes ? <div className="text-xs text-gray-500">{notes}</div> : null}
                </td>
                <td className="text-right">{`${currency} ${currencyFormat(unitValue)}`}</td>
                <td className="text-right">{`${currency} ${currencyFormat(total)}`}</td>
              </tr>
            )
          })}
          <tr>
            <td colSpan={5} className="text-right">
              <span className="font-bold px-2">Subtotal</span>
              <span>{`${currency} ${currencyFormat(subtotal)}`}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const CfdiPreviewPaymentInvoices = ({ relatedCfdis = [] }) => {
  return relatedCfdis.map(related => {
    const { id, uuid, folio, total, exchangeRate, currency, paymentMethod, partialityNumber } = related
    const { previousBalanceAmount, amountPaid } = related
    return (
      <div key={id} className="bg-white odd:bg-gray-200">
        <strong>UUID: </strong>
        <span>{`${uuid} `}</span>
        <strong>Folio: </strong>
        <span>{`${folio} `}</span>
        <strong>Total: </strong>
        <span>{`${numberFormat(total)} `}</span>
        <strong>{exchangeRate ? 'Tasa de cambio: ' : null}</strong>
        <span>{exchangeRate ? `${exchangeRate} ` : null}</span>
        <strong>Currency: </strong>
        <span>{`${currency} `}</span>
        <strong>Forma de pago: </strong>
        <span>{`${paymentMethod} `}</span>
        <strong>Parcialidad: </strong>
        <span>{`${partialityNumber} `}</span>
        <strong>Saldo anterior: </strong>
        <span>{`${numberFormat(previousBalanceAmount)} `}</span>
        <strong>Pagado: </strong>
        <span>{`${numberFormat(amountPaid)} `}</span>
        <strong>Nuevo saldo: </strong>
        <span>{`${numberFormat(previousBalanceAmount - amountPaid)} `}</span>
      </div>
    )
  })
}

const CfdiPreviewPayments = ({ cfdiPayments = [], cfdiRelatedCfdis = [], onPaymentClicked }) => {
  const paymentClassname = `border-b border-solid border-t-0 border-l-0 border-r-0 border-gray-300 ${
    onPaymentClicked ? 'hover:bg-blue-300 cursor-pointer' : ''
  }`

  return cfdiPayments.map(payment => {
    const { id, date, paymentForm, currency, exchangeRate, issuerAccount, receiverAccount, operationNumber, cfdisUuids, amount } = payment
    const relatedCfdis = cfdiRelatedCfdis.filter(({ uuid }) => cfdisUuids.includes(uuid))
    const desc = `${getPaymentTypeName(paymentForm)} ${currency} ${amount ? numberFormat(amount) : ''} - Tasa de cambio: ${exchangeRate}`
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      <div key={id} className={paymentClassname} onClick={() => onPaymentClicked && onPaymentClicked(payment)}>
        <div>
          <span className="text-sm text-blue-500 font-bold">{`${i18n('newCfdi.paymentProofDetailsStep.date')}: ${dateFormat(date)}`}</span>
          <div className="text-xs">{desc}</div>
          <span className="text-xs">
            <span>{receiverAccount && `Transferencia: ${receiverAccount}`}</span>
            {issuerAccount && <span className="text-blue-500"> ► </span>}
            {issuerAccount && <span>{issuerAccount.number || issuerAccount}</span>}
          </span>
          {operationNumber && <span className="text-xs">{`Número de operación: ${operationNumber}`}</span>}
        </div>
        <div className="w-full h-0 shadow-xs">&nbsp;</div>

        <CfdiPreviewPaymentInvoices relatedCfdis={relatedCfdis} />
      </div>
    )
  })
}

const buildBase64QrCodeSvg = (content, width = 256, height = 256) => {
  const svgString = qrcode({ content, padding: 4, width, height })
  const base64 = btoa(unescape(encodeURIComponent(svgString)))
  return `data:image/svg+xml;base64,${base64}`
}

const getCfdiItemsByService = (cfdiItems = [], serviceId = '') =>
  cfdiItems.filter(({ service }) => (serviceId ? service?.id === serviceId : !service))

export const CfdiPreview = ({ cfdi, issuerLogoUrl, onAdditionalItemClicked, onPaymentClicked }) => {
  const allTaxes = cfdi.items ? cfdi.items.filter(({ taxes }) => Boolean(taxes)).flatMap(({ taxes }) => taxes) : []
  const ivaTotal = allTaxes.filter(({ name, isRetention }) => name === 'iva' && !isRetention).reduce((iva, { value }) => iva + value, 0)
  const ivaRetTotal = allTaxes.filter(({ name, isRetention }) => name === 'iva' && isRetention).reduce((iva, { value }) => iva + value, 0)

  const [qrCodeSvg, setQrCodeSvg] = useState('')
  useEffect(() => {
    const qrCodeUrl = 'https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx'
    setQrCodeSvg(buildBase64QrCodeSvg(`${qrCodeUrl}?id=${cfdi.uuid}&re=${cfdi.issuer?.rfc}&rr=${cfdi.receiver?.rfc}&tt=0`))
  }, [])

  // Cfdi items not related to any service
  const cfdiAdditionalItems = getCfdiItemsByService(cfdi.items)
  const isPaymentProof = cfdi.cfdiType === 'paymentProof'
  const isBillOfLading = cfdi.cfdiType === 'billOfLading'
  const isInvoice = cfdi.cfdiType === 'invoice'
  const isCreditNote = cfdi.cfdiType === 'creditNote'
  const isBillOfLadingIncome = cfdi.billOfLadingType === 'I'
  const hasBillOfLadingType = !!cfdi.billOfLadingType
  const needsTotals = () => {
    switch (cfdi.cfdiType) {
      case 'paymentProof':
        return true
      case 'billOfLading':
        if (cfdi.billOfLadingType === 'I') {
          return true
        } 
        return false
      case 'invoice':
        return true
      case 'creditNote':
        return true
      default:
        return true
    }
  }
  // console.log('cfdi')
  // console.log(cfdi)
  const rowClassname = `border-b border-solid border-t-0 border-l-0 border-r-0 border-tskyBlue ${
    onAdditionalItemClicked ? 'hover:bg-blue-300 cursor-pointer' : ''
  }`

  return (
    <div className="max-w-screen-md m-auto text-xs bg-white p-4">
      <div className="flex justify-between mt-4">
        <div className="flex-1 w-1/3">{issuerLogoUrl && <img className="w-full" src={issuerLogoUrl} alt="company logo" />}</div>
        <div className="flex-1">
          <div className="font-bold">Folio fiscal</div>
          <div>{cfdi.uuid}</div>
          <div className="font-bold">No de serie de CSD de emisor</div>
          <div>{cfdi.satCertNumber}</div>
          <div className="font-bold">Fecha y hora de certificación</div>
          <div>{cfdi.cfdiSignDate}</div>
        </div>
        <div className="flex-1">
          {isBillOfLading ? (
            <div className="font-bold">{`Carta Porte ${isBillOfLadingIncome && hasBillOfLadingType ? 'Ingreso' : 'Traslado'}`}</div>
          ) : (
            <div className="font-bold">{`${i18n(`cfdiType.${cfdi.cfdiType}`)} número`}</div>
          )}
          <div>{cfdi.folio}</div>
          <div className="font-bold">Fecha y hora de emisión</div>
          <div>{cfdi.createdAt}</div>
        </div>
      </div>

      <div className="w-full h-0 shadow-xs my-2">&nbsp;</div>

      <div className="flex justify-between ">
        <div className="flex-1 w-1/2">
          <div className="font-bold">Emisor</div>
          <div className="uppercase mb-4">{cfdi.issuer?.name}</div>

          <div className="flex justify-between flex-no-wrap w-4/5">
            <div className="flex-shrink pr-4">RFC</div>
            <div className="flex-shrink truncate ...">{cfdi.issuer?.rfc}</div>
          </div>
          <div className="flex justify-between flex-no-wrap w-4/5">
            <div className="flex-shrink pr-4">Dirección</div>
            <div className="flex-shrink truncate ...">{cfdi.issuer?.address}</div>
          </div>
          <div className="flex justify-between flex-no-wrap w-4/5">
            <div className="flex-shrink pr-4">Régimen fiscal</div>
            <div className="flex-shrink truncate ...">{cfdi.issuer?.fiscalRegime}</div>
          </div>
        </div>
        <div className="flex-1 w-1/2">
          <div className="font-bold">Receptor</div>
          <div className="uppercase mb-4">{cfdi.receiver?.name}</div>

          <div className="flex justify-between flex-no-wrap w-4/5">
            <div className="flex-shrink pr-4">RFC</div>
            <div className="flex-shrink truncate ...">{cfdi.receiver?.rfc}</div>
          </div>
          <div className="flex justify-between flex-no-wrap w-4/5">
            <div className="flex-shrink pr-4">Dirección</div>
            <div className="flex-shrink truncate ...">{cfdi.receiver?.address}</div>
          </div>
          <div className="flex justify-between flex-no-wrap w-4/5">
            <div className="flex-shrink pr-4">Uso de Cfdi</div>
            <div className="flex-shrink truncate ...">{cfdi.receiver?.cfdiUse}</div>
          </div>
        </div>
      </div>

      <div className="w-full h-0 shadow-xs my-2">&nbsp;</div>

      {!isPaymentProof ? (
        <div className="grid grid-cols-4">
          <div>
            <div className="font-bold">Forma de pago</div>
            <div>{cfdi.paymentTerms}</div>
          </div>

          <div>
            <div className="font-bold">Método de pago</div>
            <div>{cfdi.paymentMethod}</div>
          </div>

          <div>
            <div className="font-bold">Opciones de pago</div>
            <div>{cfdi.paymentConditions}</div>
          </div>

          <div>
            <div className="font-bold">Tipo de cambio</div>
            <div>{cfdi.exchangeRate}</div>
          </div>
        </div>
      ) : null}

      {cfdi.relatedServices?.length && isInvoice ? (
        <>
          <div className="w-full font-bold my-2">Embarques</div>
          {cfdi.relatedServices.map(({ id, reference, createdAt, clientReference, origin, destination, notes }) => {
            return (
              <div key={id}>
                <div>
                  <span className="text-sm text-blue-500 font-bold">{reference}</span>
                  <span className="text-xs">
                    {createdAt ? ` Creación: ${format(new Date(createdAt), 'yyyy-MM-dd')}` : null}
                    {clientReference ? ` - Referencia del cliente: ${clientReference}` : null}
                  </span>
                  <div className="text-xs">
                    <span>{origin}</span>
                    <span className="text-blue-500"> ► </span>
                    <span>{destination}</span>
                  </div>
                  {notes ? <div className="text-xs text-gray-500">{` - ${notes}`}</div> : null}
                </div>
                <div className="w-full h-0 shadow-xs">&nbsp;</div>
                {!isPaymentProof ? (
                  <CfdiPreviewItems cfdiItems={getCfdiItemsByService(cfdi.items, id)} currency={cfdi.shortCurrency} />
                ) : null}
              </div>
            )
          })}
        </>
      ) : null}
      <br />
      <div className="w-full h-0 shadow-xs">&nbsp;</div>
      {cfdi.relatedServices?.length && isBillOfLading ? (
        <>
          <div className="w-full font-bold my-2">Embarque</div>
          {cfdi.relatedServices.map(
            ({
              id,
              reference,
              createdAt,
              clientReference,
              origin,
              destination,
              notes,
              shipmentType,
              pickupDate,
              deadline,
              milestonesList,
            }) => {
              return (
                <div key={id}>
                  <div>
                    <div className="grid grid-cols-4">
                      <div>
                        <span className="text-sm text-blue-500 font-bold">{reference}</span>
                      </div>
                      <div>
                        <div className="font-bold">Creado:</div>
                        <div className="text-xs">{createdAt ? ` ${format(new Date(createdAt), 'yyyy-MM-dd')}` : null}</div>
                      </div>
                      <div>
                        <div className="font-bold">Referencia del Cliente:</div>
                        <div>{clientReference ? ` - Referencia del cliente: ${clientReference}` : null}</div>
                      </div>
                      <div>
                        <div className="font-bold">Tipo de Viaje:</div>
                        <span className="text-xs ">Importación</span>
                      </div>
                    </div>
                    <br />
                    <div className="flex justify-between ">
                      <div className="flex-1 w-1/2">
                        <div className="font-bold">Origen</div>
                        <span>{origin}</span>
                      </div>
                      <div className="flex-1 w-1/2">
                        <div className="font-bold">Destino</div>
                        <span>{destination}</span>
                      </div>
                    </div>
                    <br />
                    <div className="flex justify-between ">
                      <div className="flex-1 w-1/2">
                        <div className="font-bold">Pickup</div>
                        <span>14-Oct-2020 12:30</span>
                      </div>
                      <div className="flex-1 w-1/2">
                        <div className="font-bold">Entrega</div>
                        <span>16-Oct-2020 18:00</span>
                      </div>
                    </div>
                    <br />
                    <div className="font-bold">Carga</div>
                    <table className="table-auto w-full">
                      <thead>
                        <tr>
                          <th>Cantidad</th>
                          <th>Clave de unidad</th>
                          <th>Descripción</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr key={1} className={rowClassname}>
                          <td>{3}</td>
                          <td>Unidad</td>
                          <td>
                            <div>78223456</div>
                            <div className="text-xs text-gray-500">Computadoras PC Vostro, teclado y Monitor c/u</div>
                          </td>
                        </tr>
                        <tr key={1} className={rowClassname}>
                          <td>{2}</td>
                          <td>Unidad</td>
                          <td>
                            <div>78112768</div>
                            <div className="text-xs text-gray-500">Escritorio Murano 1.30*90m</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <br />
                    <div className="grid grid-cols-3">
                      <div>
                        <div className="font-bold">Peso</div>
                        <div className="text-xs ">310 kg</div>
                      </div>
                      <div>
                        <div className="font-bold">Volúmen</div>
                        <div className="text-xs " />
                      </div>
                      <div>
                        <div className="font-bold">Material Peligroso</div>
                        <div className="text-xs ">No</div>
                      </div>
                    </div>

                    <br />
                    <div className="grid grid-cols-3">
                      <div>
                        <div className="font-bold">Valor Declarado</div>
                        <div className="text-xs ">MXN 31,000</div>
                      </div>
                      <div>
                        <div className="font-bold">Indemnización</div>
                        <div className="text-xs ">MXN 25,000</div>
                      </div>
                      <div>
                        <div className="font-bold">Aseguradora</div>
                        <div className="text-xs ">Axa Seguros S.A. de C.V.</div>
                        <div className="text-xs ">ASE931116231</div>
                      </div>
                    </div>

                    <br />
                    <div className="grid grid-cols-4">
                      <div>
                        <div className="font-bold">Operador</div>
                        <div className="text-xs ">Jesús Martínez Chavez</div>
                        <div className="text-xs ">MACJ781119JK3</div>
                        <div className="text-xs ">
                          Miguel Hidalgo 44, El Rosario, San Miguel Totocuitlapiclo, Estado de México, México CP 52230
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">Tracto</div>
                        <div className="text-xs ">ECO-177</div>
                        <div className="text-xs ">Cascadia 2013</div>
                        <div className="text-xs ">426-EE-9</div>
                      </div>
                      <div>
                        <div className="font-bold">Remolque</div>
                        <div className="text-xs ">ECO-24113</div>
                        <div className="text-xs ">Wabash 206</div>
                        <div className="text-xs ">584-WN-6</div>
                      </div>
                      <div>
                        <div className="font-bold">Distancia</div>
                        <span className="text-xs ">4115.093 km</span>
                      </div>
                    </div>
                    <br />
                    {notes ? <div className="text-xs text-gray-500">{` - ${notes}`}</div> : null}
                  </div>
                  <br />

                  <div className="w-full h-0 shadow-xs">&nbsp;</div>
                  {isBillOfLadingIncome ? (
                    <CfdiPreviewItems cfdiItems={getCfdiItemsByService(cfdi.items, id)} currency={cfdi.shortCurrency} />
                  ) : null}
                </div>
              )
            }
          )}
        </>
      ) : null}

      {cfdiAdditionalItems.length ? (
        <>
          <div className="w-full font-bold my-2">Items adicionales</div>
          <CfdiPreviewItems
            cfdiItems={cfdiAdditionalItems}
            currency={cfdi.shortCurrency}
            onAdditionalItemClicked={onAdditionalItemClicked}
          />
        </>
      ) : null}

      {cfdi.payments?.length ? (
        <>
          <div className="w-full font-bold my-2">Pagos</div>
          <CfdiPreviewPayments cfdiPayments={cfdi.payments} cfdiRelatedCfdis={cfdi.relatedCfdis} onPaymentClicked={onPaymentClicked} />
        </>
      ) : null}

      <div className="flex justify-between mt-4">
        <div className=" w-2/3">
          <div className="font-bold">Observaciones</div>
          <div>{cfdi.notes}</div>
        </div>
        <div className="w-1/3">
          <div className="flex flex-col">
            <div className="bg-blue-500 px-4 pt-1 text-white rounded-t-md">
              <div className="float-left">Subtotal</div>
              <div className="float-right">
                {`${cfdi.shortCurrency || ''} ${needsTotals() ? currencyFormat(cfdi.subtotal) : currencyFormat(0)}`}
              </div>
            </div>
            {!isPaymentProof && (
              <div className="bg-blue-500 px-4 pt-1 text-white">
                <div className="float-left">IVA</div>
                <div className="float-right">
                  {`${cfdi.shortCurrency || ''} ${needsTotals() ? currencyFormat(ivaTotal) : currencyFormat(0)}`}
                </div>
              </div>
            )}
            {!isPaymentProof && (
              <div className="bg-blue-500 px-4 pt-1 text-white">
                <div className="float-left">IVA 4%</div>
                <div className="float-right">
                  {`${cfdi.shortCurrency || ''} ${needsTotals() ? currencyFormat(ivaRetTotal) : currencyFormat(0)}`}
                </div>
              </div>
            )}
            <div className="bg-blue-500 px-4 pt-1 text-white">
              <div className="float-left">Total</div>
              <div className="float-right">
                {`${cfdi.shortCurrency || ''} ${needsTotals() ? currencyFormat(cfdi.total) : currencyFormat(0)}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <div className=" w-4/5 text-gray-500" style={{ fontSize: '9px' }}>
          <div className="font-bold bg-gray-300 rounded-t-md px-4 my-1">Cadena original del complemento</div>
          <div className="break-words px-4 leading-none">{cfdi.cfdiSign}</div>
          <div className="font-bold bg-gray-300 rounded-t-md px-4 my-1">Sello digital del emisor</div>
          <div className="break-words px-4 leading-none">{cfdi.satCertNumber}</div>
          <div className="font-bold bg-gray-300 rounded-t-md px-4 my-1">Sello digital del SAT</div>
          <div className="break-words px-4 leading-none">{cfdi.satSign}</div>
        </div>
        <div className="w-1/5 text-center">
          <img src={qrCodeSvg} alt="QR Code" width="120" height="120" />
        </div>
      </div>

      <div className="w-full text-center">Este documento es una representacion impresa de un CFDI</div>
    </div>
  )
}

// TODO: Use SSR or generate statically to load faster. Reduce transloadit template (0e8c7751c8d74bd48f6ce06dda28ed05) delay
export const Cfdi = () => {
  const router = useRouter()
  const { id } = router.query
  const { data, error } = useSWR(`/api/billing/cfdi/${id}`, url => get(url, {}))

  // TODO: Create this state components
  if (error) return 'error' // '<CfdiPageErrorState errorMessage={error} />'
  if (!data) return 'Loading...' // '<CfdiPageLoadingState />'
  if (data.error) return 'error' // '<CfdiPageErrorState errorMessage={data.error} />'

  const { cfdi, issuerLogoUrl } = data
  return <CfdiPreview cfdi={cfdi} issuerLogoUrl={issuerLogoUrl} />
}

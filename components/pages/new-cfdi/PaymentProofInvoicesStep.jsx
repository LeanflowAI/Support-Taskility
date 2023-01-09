import { Card, Checkbox, Col, Collapse, Row, Tooltip, Form, List, Input } from 'antd'
import React from 'react'
import { dateFormat } from 'services/helpers/dateFormat'
import { paymentIncludesInvoice } from './utils'
import { numberFormat } from '../../../services/helpers/mathHelp'
import { i18n } from '../../../services/i18n'

const PaymentProofAttachableInvoices = ({
  payments = [],
  attachableInvoices = [],
  addInvoiceToPayment,
  setInvoicePayedValue,
  setInvoiceExchangeRate,
}) => {
  // Exclude invoices already selected in another payments
  const selectedAttachableInvoices = payments.flatMap(({ relatedCfdis = [] }) => relatedCfdis)
  const selectedAttachableInvoicesIds = selectedAttachableInvoices.map(({ id }) => id)
  const unselectedAttachableInvoices = attachableInvoices.filter(({ _id }) => !selectedAttachableInvoicesIds.includes(_id))
  const paymentInvoicesList = payment => [
    ...(payment?.relatedCfdis?.map(({ id }) => attachableInvoices.find(({ _id }) => _id === id)) || []),
    ...unselectedAttachableInvoices,
  ]

  const onPaymentTotalChange = (paymentId, invoiceId) => e => setInvoicePayedValue({ paymentId, invoiceId, amountToPay: e.target.value })
  const onInvoiceExchangeRateChange = (paymentId, invoiceId) => e => 
    setInvoiceExchangeRate({ paymentId, invoiceId, paymentExchangeRate: e.target.value })
 
  const totalWithExchangeRate = (paymentId, invoiceId) => {
    const {relatedCfdis} = payments.find((payment)=> payment.id === paymentId)
    const {exchangeRate} = relatedCfdis.find((invoice)=>invoice.id === invoiceId)
    const totalPayedInvoiceCurrency = relatedCfdis.find((invoice)=>invoice.id === invoiceId).total
    const totalPayedPaymentCurrency = totalPayedInvoiceCurrency/exchangeRate
   return totalPayedPaymentCurrency
  }

  return (
    <Collapse accordion bordered={false}>
      {payments.map(payment => (
        <Collapse.Panel
          key={payment.id}
          id={payment.id}
          header={`${dateFormat(payment.date)} - ${payment.currency} ${numberFormat(payment.amount)} - ${payment.exchangeRate}`}
        >
          {paymentInvoicesList(payment).length ? (
            <List size="small" bordered>
              <List.Item>
                <Row gutter={4} className="w-full justify-center flex-no-wrap max-w-full">
                  <Col flex="30px" />
                  <Col flex="auto" className="flex-shrink truncate ...">
                    {i18n('cfdiType.invoice')}
                  </Col>
                  <Col flex="120px" className="text-right flex-shrink truncate ...">
                    {i18n('newCfdi.paymentProofInvoicesStep.pendingAmount')}
                  </Col>
                </Row>
              </List.Item>
              {paymentInvoicesList(payment).map(invoice => {
                const relatedCfdi = selectedAttachableInvoices.find(({ id }) => id === invoice._id)
                return (
                  <List.Item key={invoice._id}>
                    <Card style={{ width: '100%' }}>
                      <Row gutter={[4,8]} className="w-full justify-center flex-no-wrap max-w-full">
                        <Col span={2}>
                          <Checkbox
                            onChange={() => addInvoiceToPayment({ invoice: invoice, paymentId: payment.id })}
                            checked={paymentIncludesInvoice(payment, invoice._id)}
                          />
                        </Col>
                        <Col span={4}>
                          <Tooltip placement="topLeft" title={`Total: ${invoice.shortCurrency} ${numberFormat(invoice.total)}`}>
                            {invoice.folio}
                          </Tooltip>
                        </Col>
                        <Col span={18}>
                          {relatedCfdi ? (
                            <Input
                              size="small"
                              addonBefore={invoice.shortCurrency}
                              addonAfter={`de ${numberFormat(invoice.total)}`}
                              name="total"
                              defaultValue={relatedCfdi ? relatedCfdi.total : invoice.pendingAmount}
                              onChange={onPaymentTotalChange(payment.id, invoice._id)}
                              type="number"
                            />
                          ) : (
                            `${invoice.shortCurrency} ${numberFormat(invoice.total)}`
                          )}
                        </Col>
                      </Row>
                      {relatedCfdi && invoice.shortCurrency !== payment.currency ? (
                        <Row gutter={[4,8]} className="w-full justify-center flex-no-wrap max-w-full">
                          <Col span={18} offset={6}>
                            <Input
                              size="small"
                              addonBefore={`1 ${payment.currency} = `}
                              addonAfter={invoice.shortCurrency}
                              name="exchangeRate"
                              defaultValue={0.00}
                              onChange={onInvoiceExchangeRateChange(payment.id, invoice._id)}
                              type="number"
                            />
                          </Col>
                        </Row>
                      ) : null}
                      {relatedCfdi && invoice.shortCurrency !== payment.currency ? (
                        <Row gutter={[4,8]} className="w-full justify-center flex-no-wrap max-w-full">
                          <Col span={18} offset={6}>
                            Pagado: {`${payment.currency} ${numberFormat(totalWithExchangeRate(payment.id, invoice._id))}`}
                          </Col>
                        </Row>
                      ) : null}
                    </Card>
                  </List.Item>
                )
              })}
            </List>
          ) : (
            i18n('newCfdi.paymentProofInvoicesStep.noAttachableInvoices')
          )}
        </Collapse.Panel>
      ))}
    </Collapse>
  )
}

// AGREGAR FACTURAS A LOS PAGOS CREADOS EN EL PASO ANTERIOR
// PERMITIR EN ESTE FORMULARIO LA EDICIÓN DEL CAMPO DE TOTAL DE CADA PAGO (CALCULADO A
// PARTIR DE LAS FACTURAS SELECCIONADAS PERO MODIFICABLE PARA HACER LOS AJUSTES POR LA TASA DE CAMBIO)
export const PaymentProofInvoicesStep = props => {
  const { cfdi, addInvoiceToPayment, attachableInvoices, setInvoicePayedValue, setInvoiceExchangeRate, errors } = props
  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <Form layout="vertical">
        <Form.Item
          label={i18n('newCfdi.paymentProofInvoicesStep.title')}
          // validateStatus={errors.itemsRequired && 'error'}
          // help={errors.itemsRequired && i18n(errors.itemsRequired)}
        >
          <PaymentProofAttachableInvoices
            payments={cfdi.payments}
            attachableInvoices={attachableInvoices}
            addInvoiceToPayment={addInvoiceToPayment}
            setInvoicePayedValue={setInvoicePayedValue}
            setInvoiceExchangeRate={setInvoiceExchangeRate}
          />
        </Form.Item>
      </Form>
    </Card>
  )
}

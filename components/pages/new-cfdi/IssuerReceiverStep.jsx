/* eslint-disable react/prop-types */
import React, { useEffect, useReducer, useState } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import {
  Space,
  PageHeader,
  Button,
  Layout,
  Steps,
  Popover,
  Card,
  List,
  Select,
  Row,
  Col,
  Tooltip,
  InputNumber,
  Input,
  Spin,
  Checkbox,
  Collapse,
  Alert,
  Form,
  Divider,
} from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { i18n } from '../../../services/i18n'
import { AppHeader } from '../../layout/AppHeader'
import { SideMenu } from '../../layout/SideMenu'
import { CfdiPreview } from '../cfdi/Cfdi'
import {
  labelValueCurrencies,
  labelValuePaymentMethods,
  labelValuePaymentTypes,
  labelValueCreditTerms,
  labelValueCfdiUses,
  labelValueServices,
  labelValueUnitCodes,
} from '../../../services/catalogs'
import { get, post } from '../../../services/fetch'
import { num } from '../../../services/helpers/mathHelp'
import { PaymentProofDetailsStep } from './PaymentProofDetailsStep'
import { PaymentProofInvoicesStep } from './PaymentProofInvoicesStep'
import { newCfdiReducer, defaultState, cfdiIncludesQuotation, cfdiIncludesAllServiceQuotations, buildCfdiToPreview } from './utils'

const { Option } = Select

const ReceiverSelector = ({ cfdi, setCfdiFields, errors, setReceivers }) => {
  const { data: receiversData, error: receiversError } = useSWR(
    cfdi.issuerId ? `/api/billing/new-cfdi/receivers/${cfdi.issuerId}` : null,
    url => get(url)
  )
  useEffect(() => setReceivers(receiversData?.receivers), [receiversData])

  if (!cfdi.issuerId) return null
  if (receiversError) return <div>{i18n(receiversError)}</div>
  if (!receiversData)
    return (
      <Card bordered={false} className="invoice-card w-full p-4">
        <Spin />
      </Card>
    )
  if (receiversData.error) return <div>{i18n(receiversData.error)}</div>
  const receiverOptions = (receiversData && receiversData.receivers) || []
  const selectedReceiver = receiverOptions.find(({ _id }) => _id === cfdi.receiverId)
  return (
    <>
      <Form layout="vertical">
        <Form.Item
          label={i18n('newCfdi.issuerReceiverStep.receiver')}
          validateStatus={errors.receiverId && 'error'}
          help={errors.receiverId && i18n(errors.receiverId)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.issuerReceiverStep.receiverPlaceholder')}
            value={cfdi.receiverId}
            optionFilterProp="children"
            onChange={receiverId => setCfdiFields({ receiverId })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={receiverOptions.map(({ _id, name }) => ({ value: _id, label: name }))}
          />
        </Form.Item>
      </Form>
      {selectedReceiver && (
        <Card size="small">
          <List size="small">
            <List.Item>{`Rfc: ${selectedReceiver.rfc}`}</List.Item>
            <List.Item>
              <Row gutter={4} className="w-full justify-center flex-no-wrap max-w-full">
                <Col flex="30px">Address:</Col>
                <Col flex="auto" className="flex-shrink truncate ...">
                  <Tooltip placement="topLeft" title={selectedReceiver.address}>
                    {selectedReceiver.address}
                  </Tooltip>
                </Col>
              </Row>
            </List.Item>
            <List.Item>{`Fiscal Regime: ${selectedReceiver.fiscalRegime}`}</List.Item>
          </List>
        </Card>
      )}
    </>
  )
}

export const IssuerReceiverStep = ({ cfdi, setCfdiFields, services, errors, setIssuers, setReceivers }) => {
  const { data: issuersData, error: issuersError } = useSWR('/api/billing/new-cfdi/issuers', url => get(url))
  useEffect(() => setIssuers(issuersData?.issuers), [issuersData])

  if (issuersError) return <div>{i18n(issuersError.message)}</div>
  if (!issuersData)
    return (
      <Card bordered={false} className="invoice-card w-full p-4">
        <Spin />
      </Card>
    )
  if (issuersData.error) return <div>{i18n(issuersData.error)}</div>
  const selectedIssuer = issuersData.issuers.find(({ _id }) => _id === cfdi.issuerId)

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <strong>{i18n('newCfdi.issuerReceiverStep.title')}</strong>

      <Form layout="vertical">
        <Form.Item
          label={i18n('newCfdi.issuerReceiverStep.issuer')}
          validateStatus={errors.issuerId && 'error'}
          help={errors.issuerId && i18n(errors.issuerId)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.issuerReceiverStep.issuerPlaceholder')}
            value={cfdi.issuerId}
            optionFilterProp="children"
            onChange={issuerId => setCfdiFields({ issuerId, receiverId: null })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={issuersData.issuers.map(({ _id, name }) => ({ value: _id, label: name }))}
          />
        </Form.Item>
      </Form>
      {selectedIssuer && (
        <Card size="small">
          <List size="small">
            <List.Item>{`Rfc: ${selectedIssuer.rfc}`}</List.Item>
            <List.Item>
              <Row gutter={4} className="w-full justify-center flex-no-wrap max-w-full">
                <Col flex="30px">Address:</Col>
                <Col flex="auto" className="flex-shrink truncate ...">
                  <Tooltip placement="topLeft" title={selectedIssuer.address}>
                    {selectedIssuer.address}
                  </Tooltip>
                </Col>
              </Row>
            </List.Item>
            <List.Item>{`Fiscal Regime: ${selectedIssuer.fiscalRegime}`}</List.Item>
          </List>
        </Card>
      )}

      <br />
      <ReceiverSelector cfdi={cfdi} errors={errors} setCfdiFields={setCfdiFields} setReceivers={setReceivers} />
      <br />

      {cfdi.cfdiType === 'invoice' && services && (
        <div>{`${i18n('newCfdi.issuerReceiverStep.billingPendingServices')} ${services.length}`}</div>
      )}
    </Card>
  )
}

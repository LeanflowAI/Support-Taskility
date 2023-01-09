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

const InvoiceDetailsStep = ({ cfdi, errors, setDefaultFields, setCfdiFields, relationship = {} }) => {
  const { creditDays, cfdiUse, paymentMethod, paymentType } = relationship
  useEffect(() => setDefaultFields({ creditDays, cfdiUse, paymentMethod, paymentType }), [])

  const rateUrl = cfdi.currency ? `/api/exchange-rates/get-yesterday-rate/${cfdi.currency}/MXN` : null
  const { data, error } = useSWR(rateUrl, url => get(url))
  useEffect(() => {
    if (!error && data && data.ok) setCfdiFields({ exchangeRate: data.exchangeRate })
  }, [data])

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <strong>{i18n('newCfdi.invoiceDetailsStep.title')}</strong>

      <Form layout="vertical">
        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.currency')}
          validateStatus={errors.currency && 'error'}
          help={errors.currency && i18n(errors.currency)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.currency')}
            value={cfdi.currency}
            optionFilterProp="children"
            onChange={currency => setCfdiFields({ currency })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCurrencies}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.exchangeRate')}
          validateStatus={errors.exchangeRate && 'error'}
          help={errors.exchangeRate && i18n(errors.exchangeRate)}
        >
          <InputNumber className="w-full" min={0} onChange={rate => setCfdiFields({ exchangeRate: rate })} value={cfdi.exchangeRate} />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.paymentMethod')}
          validateStatus={errors.paymentMethod && 'error'}
          help={errors.paymentMethod && i18n(errors.paymentMethod)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.paymentMethod')}
            optionFilterProp="children"
            value={cfdi.paymentMethod}
            defaultValue={paymentMethod}
            onChange={method => setCfdiFields({ paymentMethod: method })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValuePaymentMethods}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.paymentType')}
          validateStatus={errors.paymentType && 'error'}
          help={errors.paymentType && i18n(errors.paymentType)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.paymentType')}
            optionFilterProp="children"
            value={cfdi.paymentType}
            defaultValue={paymentType}
            onChange={type => setCfdiFields({ paymentType: type })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValuePaymentTypes}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.creditDays')}
          validateStatus={errors.creditDays && 'error'}
          help={errors.creditDays && i18n(errors.creditDays)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.creditDays')}
            optionFilterProp="children"
            value={cfdi.creditDays}
            defaultValue={creditDays}
            onChange={days => setCfdiFields({ creditDays: days })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCreditTerms}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.cfdiUse')}
          validateStatus={errors.cfdiUse && 'error'}
          help={errors.cfdiUse && i18n(errors.cfdiUse)}
        >
          <Select
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.invoiceDetailsStep.cfdiUse')}
            optionFilterProp="children"
            defaultValue={cfdiUse}
            value={cfdi.cfdiUse}
            onChange={use => setCfdiFields({ cfdiUse: use })}
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCfdiUses}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.invoiceDetailsStep.notes')}
          validateStatus={errors.notes && 'error'}
          help={errors.notes && i18n(errors.notes)}
        >
          <Input.TextArea rows={4} value={cfdi.notes} onChange={e => setCfdiFields({ notes: e.target.value })} />
        </Form.Item>
      </Form>
    </Card>
  )
}
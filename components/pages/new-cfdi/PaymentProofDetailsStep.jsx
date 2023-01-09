import React, { useEffect } from 'react'
import { Button, Card, DatePicker, Input, InputNumber, Select, Space, Form } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import useSWR from 'swr'
import moment from 'moment'
import { get } from '../../../services/fetch'
import { labelValueCurrencies, labelValuePaymentTypes } from '../../../services/catalogs'
import { i18n } from '../../../services/i18n'

const validatePayment = formData => {
  const errors = {}
  if (!formData.date) errors.date = 'newCfdi.errors.paymentDateRequired'
  if (!formData.paymentForm) errors.paymentForm = 'newCfdi.errors.paymentFormRequired'
  if (!formData.currency) errors.currency = 'newCfdi.errors.currencyRequired'
  if (!formData.exchangeRate) errors.exchangeRate = 'newCfdi.errors.exchangeRateRequired'
  return errors
}

const addDescToBankAccount = ({ number, bank, bankRfc, currency: curr }) => {
  return { number, bank, bankRfc, currency: curr, desc: `${number} ${bank}${curr ? ` - ${curr}` : ''}` }
}
const addDescToBankAccounts = bankAccountsList => bankAccountsList?.map(addDescToBankAccount) || []

export const PaymentProofDetailsStep = ({ cfdi, addPaymentProofPayment, selectedPayment, removePaymentProofPayment, relationship }) => {
  const defaultValues = {
    id: null,
    date: moment(),
    paymentForm: '',
    currency: null,
    exchangeRate: null,
    receiverAccount: {},
    issuerAccount: {},
    operationNumber: '',
  }
  const issuerBankAccountsUrl = cfdi.issuerId ? `/api/billing/new-cfdi/issuer-bank-accounts/${cfdi.issuerId}` : null
  const { data: issuerAccountsData, error: issuerAccountsError } = useSWR(issuerBankAccountsUrl, url => get(url))

  const resolver = values => {
    const validationErrors = validatePayment(values)
    const error = Object.keys(validationErrors).length > 0
    return { values: error ? {} : values, errors: validationErrors }
  }
  const { control, handleSubmit, errors, watch, setValue, reset } = useForm({ defaultValues, resolver })
  const { id, date, paymentForm, currency } = watch()

  const { data, error } = useSWR(currency ? `/api/exchange-rates/get-yesterday-rate/${currency}/MXN` : null, url => get(url))
  useEffect(() => {
    if (!error && data && data.ok) setValue('exchangeRate', data.exchangeRate)
  }, [data])

  useEffect(() => {
    if (selectedPayment) reset(selectedPayment)
  }, [selectedPayment])

  const onSubmit = formData => {
    addPaymentProofPayment(formData)
    reset(defaultValues)
  }

  if (issuerAccountsError) return <div>{i18n(issuerAccountsError.message)}</div>
  if (issuerAccountsData?.error) return <div>{i18n(issuerAccountsData.error)}</div>

  const issuerBankAccounts = addDescToBankAccounts(issuerAccountsData?.issuer?.bankAccountsList)
  const issuerBankAccountOptions = issuerBankAccounts.map(({ desc }) => ({ label: desc, value: desc })) || []
  const receiverBankAccounts = addDescToBankAccounts(relationship?.bankAccountsList)
  const receiverBankAccountOptions = receiverBankAccounts.map(({ desc }) => ({ label: desc, value: desc })) || []

  const onBankAccountChange = companyRole => selectedAccountDesc => {
    const accountsList = companyRole === 'issuer' ? issuerBankAccounts : receiverBankAccounts
    const { number, bankRfc } = accountsList.find(({ desc }) => desc === selectedAccountDesc) || {}
    setValue(`${companyRole}Account`, { number, bankRfc })
  }

  return (
    <Card bordered={false} className="invoice-card w-full p-4">
      <strong>{i18n('newCfdi.paymentProofDetailsStep.title')}</strong>

      {/* TODO: Disable future dates */}
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Controller name="id" control={control} />

        <Form.Item
          label={i18n('newCfdi.paymentProofDetailsStep.date')}
          validateStatus={errors.date && 'error'}
          help={errors.date && i18n(errors.date)}
        >
          <Controller name="date" as={DatePicker} control={control} className="w-full" value={date} />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.paymentProofDetailsStep.paymentForm')}
          validateStatus={errors.paymentForm && 'error'}
          help={errors.paymentForm && i18n(errors.paymentForm)}
        >
          <Controller
            name="paymentForm"
            as={Select}
            control={control}
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.paymentProofDetailsStep.paymentForm')}
            optionFilterProp="children"
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValuePaymentTypes.filter(({ value }) => value !== '99')}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.paymentProofDetailsStep.currency')}
          validateStatus={errors.currency && 'error'}
          help={errors.currency && i18n(errors.currency)}
        >
          <Controller
            name="currency"
            as={Select}
            control={control}
            showSearch
            className="w-full"
            placeholder={i18n('newCfdi.paymentProofDetailsStep.currency')}
            optionFilterProp="children"
            filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
            options={labelValueCurrencies}
          />
        </Form.Item>

        <Form.Item
          label={i18n('newCfdi.paymentProofDetailsStep.exchangeRate')}
          validateStatus={errors.exchangeRate && 'error'}
          help={errors.exchangeRate && i18n(errors.exchangeRate)}
        >
          <Controller name="exchangeRate" as={InputNumber} control={control} className="w-full" min={0} />
        </Form.Item>

        {paymentForm === '03' ? (
          <Form.Item
            label={i18n('newCfdi.paymentProofDetailsStep.receiverAccount')}
            validateStatus={errors.receiverAccount && 'error'}
            help={errors.receiverAccount && i18n(errors.receiverAccount)}
          >
            <Select
              showSearch
              className="w-full"
              placeholder={i18n('newCfdi.paymentProofDetailsStep.receiverAccount')}
              optionFilterProp="children"
              filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
              options={receiverBankAccountOptions}
              onChange={onBankAccountChange('receiver')}
            />
          </Form.Item>
        ) : null}

        {paymentForm === '03' ? (
          <Form.Item
            label={i18n('newCfdi.paymentProofDetailsStep.issuerAccount')}
            validateStatus={errors.issuerAccount && 'error'}
            help={errors.issuerAccount && i18n(errors.issuerAccount)}
          >
            <Select
              showSearch
              className="w-full"
              placeholder={i18n('newCfdi.paymentProofDetailsStep.issuerAccount')}
              optionFilterProp="children"
              filterOption={(input, { label }) => label.toLowerCase().includes(input.toLowerCase())}
              options={issuerBankAccountOptions}
              onChange={onBankAccountChange('issuer')}
            />
          </Form.Item>
        ) : null}

        {paymentForm !== '01' ? (
          <Form.Item
            label={i18n('newCfdi.paymentProofDetailsStep.operationNumber')}
            validateStatus={errors.operationNumber && 'error'}
            help={errors.operationNumber && i18n(errors.operationNumber)}
          >
            <Controller name="operationNumber" as={Input} control={control} />
          </Form.Item>
        ) : null}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {i18n(id !== null ? 'newCfdi.paymentProofDetailsStep.updatePayment' : 'newCfdi.paymentProofDetailsStep.addPayment')}
            </Button>
            {id !== null && (
              <Button
                danger
                onClick={() => {
                  removePaymentProofPayment(id)
                  reset(defaultValues)
                }}
              >
                {i18n('newCfdi.paymentProofDetailsStep.deletePayment')}
              </Button>
            )}
            {id !== null && (
              <Button onClick={() => reset(defaultValues)}>{i18n('newCfdi.paymentProofDetailsStep.cancelEditPayment')}</Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}

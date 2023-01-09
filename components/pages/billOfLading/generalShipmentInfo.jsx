import React, { useState } from 'react'
// import Image from 'next/image'
import useSWR from 'swr'
// import { useRouter } from 'next/router'
import { Select, Form, Switch } from 'antd'
import { useForm, Controller } from 'react-hook-form'
import { i18n } from '../../../services/i18n'
import { get, post } from '../../../services/fetch'
// eslint-disable-next-line
import { ISO_3166CountryCodes } from '../../../services/api/geocoding/ISO3166CountryCodes'

const { Option } = Select

export const GeneralShipmentInfo = ({ dispatch, internationalTransport, inOutGoods, countryOfOrigin, wayInOut, disabled }) => {
  const [international, setInternational] = useState(internationalTransport === 'Si')
  const [isImport, setIsImport] = useState(internationalTransport === 'Si')
  const internationalChange = () => {
    setInternational(!international)
    if (!international) {
      dispatch({ type: 'Is International', payload: 'Si' })
    } else {
      dispatch({ type: 'Is International', payload: 'No' })
    }
  }
  const isImportChange = value => {
    if (value === 'Entrada') {
      setIsImport(true)
      dispatch({ type: 'Import or Export', payload: value })
    } else {
      setIsImport(false)
      dispatch({ type: 'Import or Export', payload: value })
    }
  }
  // eslint-disable-next-line
  const createCountryOptions = ISO_3166CountryCodes.map(country => {
    // console.log(country.name, country.alpha3)
    return <Option key={country.alpha3} value={country.alpha3}>{country.name}</Option>
  })
  return (
    <div>
      <Form.Item label={i18n('newBillOfLadingHub.generalInfo.international')}>
        <Switch
          checkedChildren={i18n('newBillOfLadingHub.generalInfo.yes')}
          unCheckedChildren={i18n('newBillOfLadingHub.generalInfo.no')}
          onChange={internationalChange}
          defaultChecked={internationalTransport === 'Si'}
          checked={internationalTransport === 'Si'}
          disabled={disabled}
        />
        {/* <Select className="w-full" placeholder={i18n('newBillOfLadingHub.generalInfo.international')}>
          <Option value="Si">{i18n('newBillOfLadingHub.generalInfo.yes')}</Option>
          <Option value="No">{i18n('newBillOfLadingHub.generalInfo.no')}</Option>
        </Select> */}
      </Form.Item>
      {internationalTransport === 'Si' ? (
        <div>
          <Form.Item label={i18n('newBillOfLadingHub.generalInfo.impoExpo')}>
            <Select
              className="w-full"
              placeholder={i18n('newBillOfLadingHub.generalInfo.impoExpo')}
              onChange={isImportChange}
              defaultValue={inOutGoods}
              disabled={disabled}
            >
              <Option value="Entrada">{i18n('newBillOfLadingHub.generalInfo.import')}</Option>
              <Option value="Salida">{i18n('newBillOfLadingHub.generalInfo.export')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={
              isImport
                ? i18n('newBillOfLadingHub.generalInfo.countryOfOrigin')
                : i18n('newBillOfLadingHub.generalInfo.countryOfDestination')
            }
          >
            <Select
              className="w-full"
              placeholder={
                isImport
                  ? i18n('newBillOfLadingHub.generalInfo.countryOfOrigin')
                  : i18n('newBillOfLadingHub.generalInfo.countryOfDestination')
              }
              onChange={value => dispatch({ type: 'Country Origin or Destination', payload: value })}
              defaultValue={countryOfOrigin}
              disabled={disabled}
              showSearch
            >
              {createCountryOptions}
              {/* <Option key="USA" value="USA">{i18n('newBillOfLadingHub.generalInfo.USA')}</Option>
              <Option key="CAN" value="CAN">{i18n('newBillOfLadingHub.generalInfo.CAN')}</Option> */}
            </Select>
          </Form.Item>
          <Form.Item
            label={isImport ? i18n('newBillOfLadingHub.generalInfo.viaOfEntry') : i18n('newBillOfLadingHub.generalInfo.viaOfExit')}
          >
            <Select
              className="w-full"
              placeholder={isImport ? i18n('newBillOfLadingHub.generalInfo.viaOfEntry') : i18n('newBillOfLadingHub.generalInfo.viaOfExit')}
              onChange={value => dispatch({ type: 'Via Entry or Exit', payload: value })}
              defaultValue={wayInOut}
              disabled={disabled}
            >
              <Option value="01">{i18n('newBillOfLadingHub.generalInfo.autotransport')}</Option>
              <Option value="02">{i18n('newBillOfLadingHub.generalInfo.maritime')}</Option>
              <Option value="03">{i18n('newBillOfLadingHub.generalInfo.air')}</Option>
              <Option value="04">{i18n('newBillOfLadingHub.generalInfo.rail')}</Option>
            </Select>
          </Form.Item>
        </div>
      ) : null}
    </div>
  )
}

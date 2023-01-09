import React, { useEffect, useReducer, useState } from 'react'
// import Image from 'next/image'
import useSWR from 'swr'
// import { useRouter } from 'next/router'
import { Space, Typography, Button, Card, Select, Input, TimePicker, AutoComplete, Menu, Tabs, Drawer } from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
// import next from 'next'
import { encodeTextURL } from '../../../services/helpers/text'
import { NewVehicle } from './newVehicles'

const { Title, Text, Link } = Typography
const { RangePicker } = TimePicker
const { Meta } = Card
const { Option } = Select
const { TextArea, Search } = Input
const { SubMenu } = Menu
const { TabPane } = Tabs

export const SearchVehicles = ({ dispatch, name, disabled, vehicleCompanyId, typeOfVehicle = 'any', isEditing }) => {
  const [searchText, setSearchText] = useState(name || '')
  const [encodedText, setEncodedText] = useState('')
  const [selection, setSelection] = useState('')
  const [searchDisabled, setSearchDisabled] = useState(disabled)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const { data, error } = useSWR(
    `/api/vehicles/searchVehicles?search=${encodedText}&companyId=${vehicleCompanyId}&type=${typeOfVehicle}`,
    post,
    {
      dedupingInterval: 100,
    }
  )
  const renderSearchResultItem = (
    _id,
    number,
    plateNumber,
    type,
    companyId,
    active,
    insuranceCivilResponsibility,
    insuranceEnvironment
  ) => ({
    value: _id,
    label: (
      <div className="flex justify-between">
        <div>
          <span>
            <strong>{number}</strong>
          </span>
          <br />
          <span>{plateNumber}</span>
        </div>
        <div />
        <span>{type}</span>
      </div>
    ),
  })
  const createAutocompleteOptions = () => {
    if (!searchText || error || !data) return [{ label: i18n('newBillOfLadingHub.newLocation.noResults') }]
    // console.log(data)
    const apiResults = data
    return apiResults
      ? [
          {
            label:
              typeOfVehicle === 'any'
                ? i18n('newBillOfLadingHub.newVehicle.vehicles')
                : i18n(`newBillOfLadingHub.newVehicle.${typeOfVehicle}`),
            options: apiResults?.map(
              ({ _id, number, plateNumber, type, companyId, active, insuranceCivilResponsibility, insuranceEnvironment }) =>
                renderSearchResultItem(
                  _id,
                  number,
                  plateNumber,
                  type,
                  companyId,
                  active,
                  insuranceCivilResponsibility,
                  insuranceEnvironment
                )
            ),
          },
        ]
      : []
  }
  const onSearch = text => {
    const theEncodedText = encodeTextURL(text)
    setEncodedText(theEncodedText)
    setSearchText(text)
  }
  const onSelect = value => {
    const selected = data.find(x => x._id === value)
    setSelection(selected)
    setSearchDisabled(true)
    dispatch({ type: 'Vehicle Update', payload: selected })
  }
  return (
    <div>
      <AutoComplete
        className="w-full"
        dropdownMatchSelectWidth
        options={createAutocompleteOptions()}
        onSelect={onSelect}
        onSearch={onSearch}
        placeholder={i18n('newBillOfLadingHub.newVehicle.searchVehicles')}
        value={selection !== '' ? selection.number : searchText}
        disabled={searchDisabled}
      >
        {/* <Input.Search
          className="global-search-input"
          loading={!!searchText && !data}
          value={searchText}
          size="medium"
          enterButton
          allowClear
        /> */}
      </AutoComplete>
      <Space>
        <Button
          type="link"
          onClick={() => {
            setSelection('')
            setSearchText('')
            setEncodedText('')
            setSearchDisabled(false)
          }}
        >
          {i18n('newBillOfLadingHub.newLocation.clear')}
        </Button>
        <Button type="link" onClick={() => setIsDrawerVisible(true)}>
          {i18n('newBillOfLadingHub.newVehicle.newVehicle')}
        </Button>
      </Space>
      <Drawer
        width="80%"
        onClose={() => setIsDrawerVisible(false)}
        visible={isDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        // extra={(
        //   <Space>
        //     <Button onClick={() => setIsDrawerVisible(false)}>{i18n('buttons.cancel')}</Button>
        //     {/* <Button onClick={() => setIsDrawerVisible(false)} type="primary">
        //       {i18n('buttons.submit')}
        //     </Button> */}
        //   </Space>
        // )}
        destroyOnClose
      >
        <NewVehicle
          parentDispatch={dispatch}
          setDrawerVisible={setIsDrawerVisible}
          setSelection={setSelection}
          setSearchDisabled={setSearchDisabled}
          companyId={vehicleCompanyId}
          type={typeOfVehicle}
        />
      </Drawer>
    </div>
  )
}

import React, { useState } from 'react'
// import Image from 'next/image'
import useSWR from 'swr'
// import { useRouter } from 'next/router'
import {
  Space,
  Button,
  AutoComplete,
  Drawer,
} from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
import { encodeTextURL } from '../../../services/helpers/text'
import { NewDriver } from './newDriver'


export const SearchDrivers = ({ dispatch, driverName, disabled, driverCompanyId, isEditing }) => {
  const [searchText, setSearchText] = useState(driverName || '')
  const [encodedText, setEncodedText] = useState('')
  const [selection, setSelection] = useState('')
  const [searchDisabled, setSearchDisabled] = useState(disabled)
  const [isDrawerVisible, setIsDrawerVisible] = useState(false)
  const { data, error } = useSWR(`/api/drivers/searchDrivers?search=${encodedText}&companyId=${driverCompanyId}`, post, {
    dedupingInterval: 100,
  })
  const renderSearchResultItem = (_id, name, licenseNumber, rfc, document, email, phoneNumber, companyId) => ({
    value: _id,
    label: (
      <div className="flex justify-between">
        <div>
          <span>
            <strong>{name}</strong>
          </span>
          <br />
          <span>{licenseNumber || document}</span>
        </div>
        <div />
        <span>{rfc}</span>
      </div>
    ),
  })
  const createAutocompleteOptions = () => {
    if (!searchText || error || !data) return [{ label: i18n('newBillOfLadingHub.newLocation.noResults') }]
    const apiResults = data
    return apiResults
      ? [
          {
            label: i18n('newBillOfLadingHub.newDriver.drivers'),
            options: apiResults?.map(({ _id, name, licenseNumber, rfc, document, email, phoneNumber, companyId }) =>
              renderSearchResultItem(_id, name, licenseNumber, rfc, document, email, phoneNumber, companyId)
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
    dispatch({ type: 'Driver Update', payload: selected })
  }
  return (
    <div>
      <AutoComplete
        className="w-full"
        dropdownMatchSelectWidth
        options={createAutocompleteOptions()}
        onSelect={onSelect}
        onSearch={onSearch}
        placeholder={i18n('newBillOfLadingHub.newDriver.searchDrivers')}
        value={selection !== '' ? selection.name : searchText}
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
          {i18n('newBillOfLadingHub.newDriver.newDriver')}
        </Button>
      </Space>
      <Drawer
        width="80%"
        onClose={() => setIsDrawerVisible(false)}
        visible={isDrawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        // extra={
        //   <Space>
        //     <Button onClick={() => setIsDrawerVisible(false)}>{i18n('buttons.cancel')}</Button>
        //     {/* <Button onClick={() => setIsDrawerVisible(false)} type="primary">
        //       {i18n('buttons.submit')}
        //     </Button> */}
        //   </Space>
        // }
        destroyOnClose
      >
        <NewDriver
          parentDispatch={dispatch}
          setDrawerVisible={setIsDrawerVisible}
          setSelection={setSelection}
          setSearchDisabled={setSearchDisabled}
          companyId={driverCompanyId}
        />
      </Drawer>
    </div>
  )
}

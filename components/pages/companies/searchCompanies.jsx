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
import { NewCompany } from './newCompany'


export const SearchCompanies = ({ dispatch, companyName, disabled, isEditingLocation }) => {
  const [searchText, setSearchText] = useState(companyName || '')
  const [encodedText, setEncodedText] = useState('')
  const [selection, setSelection] = useState('')
  const [searchAddressDisabled, setSearchAddressDisabled] = useState(disabled)
  const [isCompanyVisible, setIsCompanyVisible] = useState(false)
  const { data, error } = useSWR(`/api/companies/searchCompanies?search=${encodedText}`, post, {
    dedupingInterval: 100,
  })
  const renderSearchResultItem = (_id, name, comercialName, rfc, foreignFiscalId, country) => ({
    value: _id,
    label: (
      <div className="flex justify-between">
        <div>
          <span>
            <strong>{name || comercialName}</strong>
          </span>
          <br />
          <span>{foreignFiscalId ? `${rfc} - ${foreignFiscalId}` : rfc}</span>
        </div>
        <div />
        <span>{country}</span>
      </div>
    ),
  })
  const createAutocompleteOptions = () => {
    if (!searchText || error || !data) return [{ label: i18n('newBillOfLadingHub.newLocation.noResults') }]
    const apiResults = data
    return apiResults
      ? [
          {
            label: i18n('newBillOfLadingHub.newCompany.companies'),
            options: apiResults?.map(({ _id, name, comercialName, rfc, foreignFiscalId, country }) =>
              renderSearchResultItem(_id, name, comercialName, rfc, foreignFiscalId, country)
            ),
          },
        ]
      : []
  }
  const onCompanySearch = text => {
    const theEncodedText = encodeTextURL(text)
    setEncodedText(theEncodedText)
    setSearchText(text)
  }
  const onSelect = value => {
    const selectedCompany = data.find(x => x._id === value)
    setSelection(selectedCompany)
    setSearchAddressDisabled(true)
    dispatch({ type: 'Company Update', payload: selectedCompany })
  }
  return (
    <div>
      <AutoComplete
        className="w-full"
        dropdownMatchSelectWidth
        options={createAutocompleteOptions()}
        onSelect={onSelect}
        onSearch={onCompanySearch}
        placeholder={i18n('newBillOfLadingHub.newCompany.searchCompany')}
        value={selection !== '' ? selection.name : searchText}
        disabled={searchAddressDisabled}
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
            setSearchAddressDisabled(false)
            dispatch({ type: 'Company Update', payload: undefined })
          }}
        >
          {i18n('newBillOfLadingHub.newLocation.clear')}
        </Button>
        <Button type="link" onClick={() => setIsCompanyVisible(true)}>
          {i18n('newBillOfLadingHub.newCompany.newCompany')}
        </Button>
      </Space>
      <Drawer
        width="80%"
        onClose={() => setIsCompanyVisible(false)}
        visible={isCompanyVisible}
        bodyStyle={{ paddingBottom: 80 }}
        // extra={
        //   <Space>
        //     <Button onClick={() => setIsCompanyVisible(false)}>{i18n('buttons.cancel')}</Button>
        //     {/* <Button onClick={() => setIsCompanyVisible(false)} type="primary">
        //       {i18n('buttons.submit')}
        //     </Button> */}
        //   </Space>
        // }
        destroyOnClose
      >
        <NewCompany
          parentDispatch={dispatch}
          setNewCompanyDrawerVisible={setIsCompanyVisible}
          setSelection={setSelection}
          setSearchAddressDisabled={setSearchAddressDisabled}
        />
      </Drawer>
    </div>
  )
}

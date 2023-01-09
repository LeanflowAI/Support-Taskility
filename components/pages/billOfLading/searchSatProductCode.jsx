import React, { useEffect, useReducer, useState } from 'react'
// import Image from 'next/image'
import useSWR from 'swr'
// import { useRouter } from 'next/router'
import { Space, Button, AutoComplete } from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
// import next from 'next'
import { encodeTextURL } from '../../../services/helpers/text'

export const SearchSatProductAndServicesCodes = ({ dispatch, key, disabled }) => {
  const [searchText, setSearchText] = useState(key || '')
  const [encodedText, setEncodedText] = useState('')
  const [selection, setSelection] = useState('')
  const [searchDisabled, setSearchDisabled] = useState(disabled)
  const { data, error } = useSWR(
    `/api/satCodes/searchProductAndServices?search=${encodedText}`,
    post,
    {
      dedupingInterval: 100,
    }
  )
  const renderSearchResultItem = (
    _id,
    key,
    satDescription,
    dangerousMaterial,
  ) => ({
    value: _id,
    label: (
      <div className="flex justify-between" key={key}>
        <div>
          <span>
            <strong>{satDescription}</strong>
          </span>
          <br />
          <span>{key}</span>
        </div>
        <div />
        <span 
          className={`${dangerousMaterial === '0' ? 'text-tkyGreen' : '' } ${dangerousMaterial === '0,1' ? 'text-tkyYellow' : ''} ${dangerousMaterial === '1' ? 'text-tkyRed' : ''}`}
        > 
          {dangerousMaterial === '0' ? i18n('newBillOfLadingHub.satCodes.notDangerous') : null }
          {dangerousMaterial === '1' ? i18n('newBillOfLadingHub.satCodes.dangerous') : null }
          {dangerousMaterial === '0,1' ? i18n('newBillOfLadingHub.satCodes.possibleDangerous') : null }
        </span>
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
            label: i18n('newBillOfLadingHub.satCodes.productAndServices'),
            options: apiResults?.map(
              ({ _id, key, satDescription, dangerousMaterial }) =>
                renderSearchResultItem(
                  _id,
                  key,
                  satDescription,
                  dangerousMaterial,
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
    dispatch({ type: 'SAT Product Code Update', payload: selected })
  }
  return (
    <div>
      <AutoComplete
        className="w-full"
        dropdownMatchSelectWidth
        options={createAutocompleteOptions()}
        onSelect={onSelect}
        onSearch={onSearch}
        placeholder={i18n('newBillOfLadingHub.satCodes.searchSatProductCodes')}
        value={selection !== '' ? selection.key : searchText}
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
      </Space>
    </div>
  )
}

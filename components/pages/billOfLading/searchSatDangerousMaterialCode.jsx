import React, { useState } from 'react'
// import Image from 'next/image'
import useSWR from 'swr'
// import { useRouter } from 'next/router'
import { Space, Button, AutoComplete } from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
// import next from 'next'
import { encodeTextURL } from '../../../services/helpers/text'

export const SearchSatDangerousMaterialCodes = ({ dispatch, key, disabled }) => {
  const [searchText, setSearchText] = useState(key || '')
  const [encodedText, setEncodedText] = useState('')
  const [selection, setSelection] = useState('')
  const [searchDisabled, setSearchDisabled] = useState(disabled)
  const { data, error } = useSWR(
    `/api/satCodes/searchDangerousMaterialCodes?search=${encodedText}`,
    post,
    {
      dedupingInterval: 100,
    }
  )
  const renderSearchResultItem = (
    _id,
    key,
    description,
    classOrDiv,
  ) => ({
    value: _id,
    label: (
      <div className="flex justify-between" key={key}>
        <div>
          <span>
            <strong>{key}</strong>
          </span>
          <br />
          <span>{description}</span>
        </div>
        <div />
        <span> 
          {classOrDiv}
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
            label: i18n('newBillOfLadingHub.satCodes.dangerousMaterialCodes'),
            options: apiResults?.map(
              ({ _id, key, description, classOrDiv }) =>
                renderSearchResultItem(
                  _id,
                  key,
                  description,
                  classOrDiv,
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
    dispatch({ type: 'SAT Dangerous Material Code Update', payload: selected })
  }
  return (
    <div>
      <AutoComplete
        className="w-full"
        dropdownMatchSelectWidth
        options={createAutocompleteOptions()}
        onSelect={onSelect}
        onSearch={onSearch}
        placeholder={i18n('newBillOfLadingHub.satCodes.searchDangerousMaterialCodes')}
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
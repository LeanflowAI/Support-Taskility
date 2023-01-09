import React, { useState } from 'react'
import useSWR from 'swr'
import {
  Space,
  Button,
  AutoComplete,
  Drawer,
} from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
import { encodeTextURL } from '../../../services/helpers/text'
import { NewPlace } from '../places/NewPlace'


export const SearchPlaces = ({ dispatch, placeName, disabled, isEditingLocation }) => {
  const [searchText, setSearchText] = useState(placeName || '')
  const [selection, setSelection] = useState('')
  const [encodedText, setEncodedText] = useState('')
  const [searchAddressDisabled, setSearchAddressDisabled] = useState(disabled)
  const [isPlaceVisible, setIsPlaceVisible] = useState(false)
  const { data, error } = useSWR(`/api/geocoding/searchPlaces?search=${encodedText}`, post, {
    dedupingInterval: 100,
  })
  const renderSearchResultItem = (_id, name, formattedAddress, satAddress, geolocation) => ({
    value: _id,
    label: (
      <div className="flex justify-between">
        <div>
          <span>
            <strong>{name}</strong>
          </span>
          <br />
          <span>{formattedAddress}</span>
        </div>
        <span>
          {geolocation.latitude},{geolocation.longitude}
        </span>
      </div>
    ),
  })
  const createAutocompleteOptions = () => {
    if (!searchText || error || !data) return [{ label: i18n('newBillOfLadingHub.newLocation.noResults') }]
    const apiResults = data
    return apiResults
      ? [
          {
            label: i18n('newBillOfLadingHub.newLocation.places'),
            options: apiResults?.map(({ _id, name, formattedAddress, satAddress, geolocation }) =>
              renderSearchResultItem(_id, name, formattedAddress, satAddress, geolocation)
            ),
          },
        ]
      : []
  }
  const onAddressSearch = text => {
    const theEncodedText = encodeTextURL(text)
    setSearchText(text)
    setEncodedText(theEncodedText)
  }
  const onSelect = value => {
    const selectedPlace = data.find(x => x._id === value)
    setSelection(selectedPlace)
    setSearchAddressDisabled(true)
    dispatch({ type: 'Address Update', payload: selectedPlace })
  }
  return (
    <div>
      <AutoComplete
        className="w-full"
        dropdownMatchSelectWidth
        options={createAutocompleteOptions()}
        onSelect={onSelect}
        onSearch={onAddressSearch}
        placeholder={i18n('newBillOfLadingHub.newLocation.searchPlace')}
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
          }}
        >
          {i18n('newBillOfLadingHub.newLocation.clear')}
        </Button>
        <Button type="link" onClick={() => setIsPlaceVisible(true)}>
          {i18n('newBillOfLadingHub.newLocation.newPlace')}
        </Button>
      </Space>
      <Drawer
        width="80%"
        onClose={() => setIsPlaceVisible(false)}
        visible={isPlaceVisible}
        bodyStyle={{ paddingBottom: 80 }}
        // extra={
        //   <Space>
        //     <Button onClick={() => setIsPlaceVisible(false)}>Cancel</Button>
        //     {/* <Button onClick={() => setIsPlaceVisible(false)} type="primary">
        //       {i18n('buttons.submit')}
        //     </Button> */}
        //   </Space>
        // }
        destroyOnClose
      >
        <NewPlace
          dispatch={dispatch}
          setVisible={setIsPlaceVisible}
          setSelection={setSelection}
          setSearchAddressDisabled={setSearchAddressDisabled}
        />
      </Drawer>
    </div>
  )
}

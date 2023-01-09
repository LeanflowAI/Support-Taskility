import React, { useEffect, useState } from 'react'
// import Image from 'next/image'
import useSWR from 'swr'
// import { useRouter } from 'next/router'
import { Space, Typography, Button, Select, Input, Spin, Form, AutoComplete, Tabs, Switch } from 'antd'
import { i18n } from '../../../services/i18n'
import { get, post } from '../../../services/fetch'
// import next from 'next'
import { Mapbox } from '../maps/Mapbox'
import geoLocations from '../../../services/gps/geoLocations'
import { encodeTextURL } from '../../../services/helpers/text'
// eslint-disable-next-line import/named
import { alpha2ToAlpha3CountryCodes } from '../../../services/api/geocoding/countryCodes'

const { Title } = Typography
const { Option } = Select
const { TabPane } = Tabs

// Subcomponent
const SatAddressCodes = ({
  thePostalCode,
  c = 'MEX',
  setFinalData,
  street,
  exteriorNumber,
  interiorNumber,
  suburb,
  neighborhood,
  administrativeAreaLevel2,
  locality,
  municipality,
  sublocalityLevel1,
  politicalState,
  administrativeAreaLevel1,
  country,
  postalCode,
  formattedAddress,
  
}) => {
  const satAddressCodificationMex = (pc, c) => {
    const { error, data } = useSWR(pc ? `/api/geocoding/satAddressCodification?postalCode=${pc}&countryCodeO=${c}` : null, get, {
      dedupingInterval: 100,
    })
    return data
  }

  const satAddressCodificationOther = () => {
    const suburbI = suburb || neighborhood
    const localityI = administrativeAreaLevel2 || locality || municipality || sublocalityLevel1
    const municipalityI = locality || municipality || sublocalityLevel1
    const politicalStateI = politicalState || administrativeAreaLevel1
    const countryI = country
    const data = {
      suburb: [{ key: 'G1', satCode: suburbI, satDescription: suburbI }],
      locality: [{ key: 'G2', satCode: localityI, satDescription: localityI }],
      municipality: [{ key: 'G3', satCode: municipalityI, satDescription: municipalityI }],
      state: [{ key: 'G4', satCode: politicalStateI, satDescription: politicalStateI }],
      country: [{ key: 'G5', satCode: countryI, satDescription: countryI }],
      postalCode: postalCode,
    }
    // console.log('data inside other: ', data)
    return data
  }
  // eslint-disable-next-line no-shadow

  // console.log(`c in SATAddressCodes: ${c}`)
  const dataMex = c === 'MEX' ? satAddressCodificationMex(thePostalCode, c) : null
  const [data, setdata] = useState(dataMex)
  // let data = dataMex
  useEffect(() => {
    const dataOther = c === 'MEX' ? null : satAddressCodificationOther()
    // console.log('dataOther inside useEffect', dataOther)
    const dataInsideUseEffect = c === 'MEX' ? dataMex : dataOther
    setdata(dataInsideUseEffect)
    // console.log('data insideUseEffect', data )
  }, [c])
  // console.log(`data in SATAddressCodes:`, data)

  const satElement = elementArray => {
    const satElementArray = elementArray.map(e => (
      <Option key={e.satCode || e.key} value={e.key}>
        {c === 'MEX' ? `${e.satCode} - ${e.satDescription}` : `${e.satCode}`}
      </Option>
    ))
    return satElementArray
  }
  // console.log('url: ', url)
  // console.log('data:')
  if (data) {
    // console.log(data)
    const countryOptions = satElement(data.country)
    const stateOptions = satElement(data.state)
    const localityOptions = satElement(data.locality)
    const municipalityOptions = satElement(data.municipality)
    const suburbOptions = satElement(data.suburb)
    // setFinalData(data)
    // console.log('satAdddressData: ', satAddressData)
    // console.log('countryOptions', countryOptions)

    return (
      <div>
        <Title level={4}>{formattedAddress}</Title>
        <Form.Item label={i18n(`newPlace.street`)}>
          <Input placeholder={i18n('newPlace.street')} value={street} />
        </Form.Item>
        <Form.Item
          label={i18n(`newPlace.exteriorNumber`)}
          rules={[{ required: true, message: i18n('newPlace.errorMessages.requiredExteriorNumber') }]}
        >
          <Input placeholder={i18n('newPlace.exteriorNumber')} value={exteriorNumber} />
        </Form.Item>
        <Form.Item label={i18n(`newPlace.interiorNumber`)}>
          <Input placeholder={i18n('newPlace.interiorNumber')} value={interiorNumber} />
        </Form.Item>
        <Form.Item label={i18n(`newPlace.suburb`)}>
          <Select placeholder={i18n('newPlace.suburb')} defaultValue={data.suburb[0].key}>
            {suburbOptions}
          </Select>
        </Form.Item>
        <Form.Item label={i18n(`newPlace.postalCode`)}>
          <Select placeholder={i18n('newPlace.postalCode')} defaultValue={postalCode}>
            {/* {postalCodeOptions} */}
          </Select>
        </Form.Item>
        <Form.Item label={i18n(`newPlace.municipality`)}>
          <Select placeholder={i18n('newPlace.municipality')} defaultValue={data.municipality[0].key}>
            {municipalityOptions}
          </Select>
        </Form.Item>
        <Form.Item label={i18n(`newPlace.locality`)}>
          <Select placeholder={i18n('newPlace.locality')} defaultValue={data.locality[0].key}>
            {localityOptions}
          </Select>
        </Form.Item>
        <Form.Item label={i18n(`newPlace.state`)}>
          <Select placeholder={i18n('newPlace.state')} defaultValue={data.state[0].key}>
            {stateOptions}
          </Select>
        </Form.Item>
        <Form.Item label={i18n(`newPlace.country`)} rules={[{ required: true, message: i18n('newPlace.errorMessages.requiredCountry') }]}>
          <Select placeholder={i18n('newPlace.country')} defaultValue={data.country[0].key}>
            {countryOptions}
          </Select>
        </Form.Item>
      </div>
    )
  }
  // console.log('the api returned data as undefined')
  // console.log('thePostalCode:')
  // console.log(thePostalCode)
  // console.log('c:')
  // console.log(c)
  return <Spin />
}

const GeocodeSearchInput = ({
  setSearchResult,
  setFormattedAddress,
  setGeolocationData,
  setPostalCode,
  setCountry,
  setStreet,
  setExteriorNumber,
  setSublocalityLevel1,
  setNeighborhood,
  setLocality,
  setAdministrativeAreaLevel2,
  setAdministrativeAreaLevel1,
  setOrigin,
  setDetailVisible,
}) => {
  const [searchText, setSearchText] = useState('')
  const { error, data } = useSWR(searchText ? `/api/geocoding/google?address=${searchText}` : null, get, { dedupingInterval: 100 })
  // eslint-disable-next-line
  const renderSearchResultItem = (formatted_address, geometry, place_id) => ({
    // eslint-disable-next-line
    value: place_id,
    label: (
      <div className="flex justify-between">
        <div>
          {/* eslint-disable-next-line */}
          <span>{formatted_address}</span>
        </div>
        <span>
          {geometry.location.lat},{geometry.location.lng}
        </span>
      </div>
    ),
  })

  const encodeText = text => {
    setSearchText(encodeTextURL(text))
  }

  const createAutocompleteOptions = () => {
    if (!searchText || error || !data) return []
    const apiResults = data?.results
    return apiResults
      ? [
          {
            label: i18n('newPlace.googleMapsResults'),
            // eslint-disable-next-line
            options: apiResults.map(({ formatted_address, geometry, place_id }) =>
              renderSearchResultItem(formatted_address, geometry, place_id)
            ),
          },
        ]
      : []
  }

  const onSelect = value => {
    // console.log('onSelect', value)
    const selection = data.results.find(x => x.place_id === value)
    // console.log('selection', selection)
    setSearchResult(selection)
    // eslint-disable-next-line camelcase
    const { address_components, formatted_address, geometry } = selection
    setFormattedAddress(formatted_address)
    setGeolocationData(geometry)
    // eslint-disable-next-line
    address_components.map(ac => {
      if (ac.types.find(type => type === 'postal_code')) {
        setPostalCode(ac.long_name)
      }
      if (ac.types.find(type => type === 'country')) {
        const alpha3CountryCode = alpha2ToAlpha3CountryCodes(ac.short_name)
        setCountry(alpha3CountryCode)
        // console.log('alpha3CountryCode: ', alpha3CountryCode)
      }
      if (ac.types.find(type => type === 'route')) {
        setStreet(ac.long_name)
      }
      if (ac.types.find(type => type === 'street_number')) {
        setExteriorNumber(ac.long_name)
      }
      if (ac.types.find(type => type === 'subpremise')) {
        setExteriorNumber(ac.long_name)
      }
      if (ac.types.find(type => type === 'sublocality_level_1')) {
        setSublocalityLevel1(ac.long_name)
      }
      if (ac.types.find(type => type === 'neighborhood')) {
        setNeighborhood(ac.long_name)
      }
      if (ac.types.find(type => type === 'locality')) {
        setLocality(ac.long_name)
      }
      if (ac.types.find(type => type === 'administrative_area_level_2')) {
        setAdministrativeAreaLevel2(ac.long_name)
      }
      if (ac.types.find(type => type === 'administrative_area_level_1')) {
        setAdministrativeAreaLevel1(ac.short_name)
      }
      return null
    })
    // setPostalCode(address_components ? address_components[address_components.length - 1].long_name : '')
    const geolocation = geometry
      ? {
          latitude: geometry.location.lat,
          longitude: geometry.location.lng,
        }
      : {
          latitude: 19.2671697,
          longitude: -99.60579009999999,
        }
    setOrigin(geolocation)
    setDetailVisible(true)
  }

  return (
    <AutoComplete dropdownMatchSelectWidth options={createAutocompleteOptions()} style={{ width: '100%' }} onSelect={onSelect}>
      <Input.Search
        className="global-search-input"
        placeholder={i18n('newPlace.searchAddress')}
        onSearch={encodeText}
        loading={!!searchText && !data}
        value={searchText}
        enterButton
        allowClear
      />
    </AutoComplete>
  )
}

const PlaceSpecifications = ({ 
  setPlaceType, 
  setRequiresAppointment, 
  setSafetyRequirements, 
  placeType
}) => {
  const changeTypeOfPlace = value => {
    setPlaceType(value)
  }
  const changeSwitch = checked => {
    setRequiresAppointment(checked)
  }
  // TODO: Habilitate Safety requirements for new sites
  // const changeSafetyRequirements = e => {
  //   setSafetyRequirements(e.target.value)
  // }
  return (
    <div>
      <Form.Item label={i18n(`newPlace.typeOfPlace`)}>
        <Select placeholder={i18n('newPlace.typeOfPlace')} value={placeType} onChange={changeTypeOfPlace}>
          <Option value="warehouse">{i18n('newPlace.warehouse')}</Option>
          <Option value="factory">{i18n('newPlace.factory')}</Option>
          <Option value="distributionCenter">{i18n('newPlace.distributionCenter')}</Option>
          <Option value="retailStore">{i18n('newPlace.retailStore')}</Option>
          <Option value="yard">{i18n('newPlace.yard')}</Option>
          <Option value="tollBooth">{i18n('newPlace.tollBooth')}</Option>
          <Option value="officeBuilding">{i18n('newPlace.officeBuilding')}</Option>
          <Option value="airport">{i18n('newPlace.airport')}</Option>
          <Option value="seaport">{i18n('newPlace.seaport')}</Option>
          <Option value="other">{i18n('newPlace.other')}</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Space>
          {i18n('newPlace.appointmentRequired')}
          <Switch key="ntrx" onChange={changeSwitch} />
        </Space>
      </Form.Item>
      {/* <Form.Item label={i18n('newPlace.safetyRequirements')}>
        <TextArea key="uriew" rows={5} onChange={changeSafetyRequirements} />
      </Form.Item> */}
    </div>
  )
}

export const NewPlace = ({ dispatch, setVisible, setSelection, setSearchAddressDisabled }) => {
  const [origin, setOrigin] = useState({
    latitude: 37.487846,
    longitude: -122.236115,
  })
  const [detailVisible, setDetailVisible] = useState(false)
  const [searchResult, setSearchResult] = useState()
  const [postalCode, setPostalCode] = useState()
  const [formattedAddress, setFormattedAddress] = useState()
  const [suburb, setSuburb] = useState()
  const [locality, setLocality] = useState()
  const [municipality, setMunicipality] = useState()
  const [politicalState, setPoliticalState] = useState()
  const [country, setCountry] = useState()
  const [placeName, setPlaceName] = useState(i18n('newPlace.placeName'))
  const [street, setStreet] = useState()
  const [exteriorNumber, setExteriorNumber] = useState()
  const [interiorNumber, setInteriorNumber] = useState()
  const [sublocalityLevel1, setSublocalityLevel1] = useState()
  const [neighborhood, setNeighborhood] = useState()
  const [activeTab, setActiveTab] = useState('1')
  const [geolocationData, setGeolocationData] = useState()
  const [requiresAppointment, setRequiresAppointment] = useState()
  const [safetyRequirements, setSafetyRequirements] = useState()
  const [placeType, setPlaceType] = useState()
  const [satAddressData, setSatAddressData] = useState()
  const [administrativeAreaLevel1, setAdministrativeAreaLevel1] = useState() // Estado en USA
  const [administrativeAreaLevel2, setAdministrativeAreaLevel2] = useState() // Locality en USA

  const handleSatAddress = newValue => {
    setSatAddressData(newValue)
  }
  const onOriginChange = option => {
    setOrigin(geoLocations[option - 1])
  }

  function handeTabChange(key) {
    setActiveTab(key)
  }
  const nameChange = e => {
    setPlaceName(e.target.value)
  }
  const nextTab = () => {
    setActiveTab('2')
  }
  const previousTab = () => {
    setActiveTab('1')
  }

  const savePlace = () => {
    const place = {
      name: placeName,
      type: placeType,
      foundOnGoogleApi: true,
      googleApiResult: searchResult,
      formattedAddress: formattedAddress,
      satAddress: {
        street: street,
        exteriorNumber: exteriorNumber,
        interiorNumber: interiorNumber,
        suburb: suburb || neighborhood || satAddressData?.suburb[0],
        municipality: locality || municipality || sublocalityLevel1 || satAddressData?.municipality[0],
        locality: administrativeAreaLevel2 || locality || municipality || sublocalityLevel1 || satAddressData?.locality[0],
        politicalState: politicalState || administrativeAreaLevel1 || satAddressData?.state[0],
        country: country || satAddressData?.country[0],
        postalCode: postalCode || satAddressData?.postalCode,
      },
      geolocation: {
        latitude: geolocationData.location.lat,
        longitude: geolocationData.location.lng,
        northEastCorner: geolocationData.viewport.northeast,
        southWestCorner: geolocationData.viewport.southwest,
      },
      requiresAppointment: requiresAppointment,
      safetyRequirements: safetyRequirements,
    }
    // TODO: api must return new place _id and include it in the dispatch call
    const { _id } = post('/api/geocoding/create-new-place', { body: place }).then(({ error, details }) => {
      // if (!error) setFinished('signed')
      // setApiError(error, details?.message || '')
    })
    // .catch(setApiError)
    // .finally(() => setCreatingCfdi(false))
    // console.log('place in Client:')
    // console.log(place)
    dispatch({ type: 'New Place Update', payload: { ...place, _id: _id } })
    setSelection(place)
    setSearchAddressDisabled(true)
    setVisible(false)
  }
  const onSubmit = data => {
    // console.log(data)
  }

  const [form] = Form.useForm()

  return (
    <Form layout="vertical" form={form}>
      <Title level={3}>{i18n(`newPlace.title`)}</Title>
      <Form.Item label={i18n(`newPlace.placeName`)}>
        <Input name="placeName" placeholder={i18n('newPlace.placeName')} onChange={nameChange} />
      </Form.Item>
      <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={() => handeTabChange()}>
        <TabPane tab={i18n('newPlace.address')} key="1">
          <Form.Item label={i18n(`newPlace.searchAddress`)}>
            <GeocodeSearchInput
              setSearchResult={setSearchResult}
              setFormattedAddress={setFormattedAddress}
              setGeolocationData={setGeolocationData}
              setPostalCode={setPostalCode}
              setCountry={setCountry}
              setStreet={setStreet}
              setExteriorNumber={setExteriorNumber}
              setSublocalityLevel1={setSublocalityLevel1}
              setNeighborhood={setNeighborhood}
              setLocality={setLocality}
              setAdministrativeAreaLevel2={setAdministrativeAreaLevel2}
              setAdministrativeAreaLevel1={setAdministrativeAreaLevel1}
              setOrigin={setOrigin}
              setDetailVisible={setDetailVisible}
            />
          </Form.Item>
          <Mapbox
            initialZoom={15}
            height={250}
            width="100%"
            originLatitude={origin.latitude}
            originLongitude={origin.longitude}
            centerMarker
            navigation
            styleCtrl
          />
          <br />
          {detailVisible ? (
            <SatAddressCodes
              thePostalCode={postalCode}
              c={country}
              setFinalData={handleSatAddress}
              street={street}
              exteriorNumber={exteriorNumber}
              interiorNumber={interiorNumber}
              suburb={suburb}
              neighborhood={neighborhood}
              administrativeAreaLevel2={administrativeAreaLevel2}
              locality={locality}
              municipality={municipality}
              sublocalityLevel1={sublocalityLevel1}
              politicalState={politicalState}
              administrativeAreaLevel1={administrativeAreaLevel1}
              country={country}
              postalCode={postalCode}
              formattedAddress={formattedAddress}
            />
          ) : null}
          <Button type="primary" className="float-right" onClick={nextTab}>
            {i18n('newCfdi.nextStep')}
          </Button>
        </TabPane>
        <TabPane tab={i18n('newPlace.specifications')} key="2">
          <PlaceSpecifications
            setPlaceType={setPlaceType}
            setRequiresAppointment={setRequiresAppointment}
            setSafetyRequirements={setSafetyRequirements}
            placeType={placeType}
          />
          <Space className="float-right">
            <Button type="default" onClick={previousTab}>
              {i18n('newCfdi.previousStep')}
            </Button>
            <Button type="primary" onClick={savePlace}>
              {i18n('newCfdi.saveDraft')}
            </Button>
          </Space>
        </TabPane>
      </Tabs>
    </Form>
  )
}

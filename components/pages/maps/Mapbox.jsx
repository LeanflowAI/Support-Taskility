import * as React from 'react'
import { useState, useEffect } from 'react'
import ReactMapGL, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl'
import { Radio } from 'antd'
import Image from 'next/image'

const navControlStyle = {
  right: 16,
  top: 16,
}

const geolocateControlStyle = {
  right: 16,
  top: 119,
}

// const scaleControlStyle = {
//   left: 20,
//   bottom: 100,
// }

export function Mapbox({
  width,
  height,
  originLatitude,
  originLongitude,
  initialZoom,
  styleCtrl = false,
  centerMarker = false,
  navigation = false,
  geolocation = false,
}) {
  const satellite = 'mapbox://styles/german-castro-jurado/ckn9c5g5202aw17nqcnwwq37y'
  const streetDay = 'mapbox://styles/german-castro-jurado/ckn9bcta901l017kf61ki88mm'
  const streetNight = 'mapbox://styles/german-castro-jurado/ckn9c9w3t02il17o7mimppbyj'
  const [mapStyle, setMapStyle] = useState(streetDay)
  const [selected, setSelected] = useState('d')
  const [viewport, setViewport] = useState({
    latitude: originLatitude,
    longitude: originLongitude,
    zoom: initialZoom,
  })
  const mapStyleChange = e => {
    switch (e.target.value) {
      case 'd':
        setMapStyle(streetDay)
        setSelected('d')
        break
      case 'n':
        setMapStyle(streetNight)
        setSelected('n')
        break
      case 's':
        setMapStyle(satellite)
        setSelected('s')
        break
      default:
        break
    }
  }

  // const attributionStyle = {
  //   right: 0,
  //   top: 0,
  // }

  const setNewViewPort = nextViewport => {
    setViewport(nextViewport)
  }
  useEffect(() => {
    setViewport({
      ...viewport,
      latitude: originLatitude,
      longitude: originLongitude,
    })
  }, [originLatitude, originLongitude])

  return (
    <ReactMapGL
      {...viewport}
      width={width}
      height={height}
      mapboxApiAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle={mapStyle}
      onViewportChange={setNewViewPort}
    >
      {' '}
      {styleCtrl ? (
        <Radio.Group defaultValue="d" size="small" style={{ marginTop: 16, marginLeft: 16 }} onChange={mapStyleChange}>
          <Radio.Button value="d">
            <Image src={selected === 'd' ? '/sun-blue.svg' : '/sun-grey.svg'} width={11} height={11} />
          </Radio.Button>
          <Radio.Button value="n">
            <Image src={selected === 'n' ? '/moon-blue.svg' : '/moon-grey.svg'} width={11} height={11} />
          </Radio.Button>
          <Radio.Button value="s">
            <Image src={selected === 's' ? '/satellite-blue.svg' : '/satellite-grey.svg'} width={11} height={11} />
          </Radio.Button>
        </Radio.Group>
      ) : null}
      {centerMarker ? (
        <Marker key="1" latitude={originLatitude} longitude={originLongitude}>
          <Image src="/placeholder.svg" width={24} height={24} />
        </Marker>
      ) : null}
      {navigation ? <NavigationControl style={navControlStyle} showCompass={false} /> : null}
      {geolocation ? (
        <GeolocateControl style={geolocateControlStyle} positionOptions={{ enableHighAccuracy: true }} trackUserLocation />
      ) : null}
    </ReactMapGL>
  )
}

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { createGlobalStyle } from 'styled-components'
import { Layout, Card, Space, Button, notification, message, Typography, Divider } from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
import { Mapbox } from '../maps/Mapbox'

const { Title } = Typography

export const DriversTrackingPage = () => {
  const router = useRouter()
  const { shipmentId } = router.query
  const [isTrackingPosition, setIsTrackingPosition] = useState(false)
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [heading, setHeading] = useState()
  const [speed, setSpeed] = useState()
  const [timestamp, setTimestamp] = useState()

  let geolocationWatch
  const setCurrentPosition = position => {
    // console.log('position', position)
    const date = new Date(position.timestamp).toString()
    setLatitude(position.coords.latitude)
    setLongitude(position.coords.longitude)
    setSpeed(position.coords.speed)
    setHeading(position.coords.heading)
    setTimestamp(date)
    const coordsObject = {
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed: position.coords.speed,
    }
    post(`/api/tracking/savePosition`, { body: { shipmentId: shipmentId, coords: coordsObject, timestamp: position.timestamp } })
      .then(({ ok, message, error }) => {
        if (error) notification.error({ message: 'Error', description: 'if error' })
        // if (ok) notification.info({ message: 'Info', description: i18n(message) })
      })
      .catch(error => notification.error({ message: 'Error', description: 'catch error' }))
  }

  const positionError = error => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        notification.error({ message: 'Error', description: 'User denied the request for Geolocation.' })
        break

      case error.POSITION_UNAVAILABLE:
        notification.error({ message: 'Error', description: 'Location information is unavailable.' })
        break

      case error.TIMEOUT:
        notification.error({ message: 'Error', description: 'The request to get user location timed out.' })
        break

      case error.UNKNOWN_ERROR:
        notification.error({ message: 'Error', description: 'An unknown error occurred.' })
        break
      default:
        break
    }
  }

  const startWatchingPosition = () => {
    if (!geolocationWatch) {
      if ('geolocation' in navigator && 'watchPosition' in navigator.geolocation) {
        geolocationWatch = navigator.geolocation.watchPosition(setCurrentPosition, positionError, {
          enableHighAccuracy: false,
          maximumAge: 0,
        })
        if (typeof geolocationWatch !== 'undefined') message.success(i18n('tracking.startTrackingMessage'))
        setIsTrackingPosition(true)
      }
    }
  }

  const stopWatchingPosition = () => {
    if (!geolocationWatch) {
      navigator.geolocation.clearWatch(geolocationWatch)
      geolocationWatch = undefined
      setIsTrackingPosition(false)
      message.success(i18n('tracking.stopTrackingMessage'))
    }
  }
  return (
    <Layout className="site-layout p-4" style={{ minHeight: '100vh' }}>
      <Card>
        <Title level={3}>{i18n(`tracking.title`)}</Title>
        <Title level={5}>
          {i18n(`tracking.shipmentId`)}: {shipmentId}
        </Title>
        {isTrackingPosition ? (
          <div>{i18n(`tracking.driversStopInstructions`)}</div>
        ) : (
          <div>{i18n(`tracking.driversStartInstructions`)}</div>
        )}

        <Space className="mt-4" wrap>
          {isTrackingPosition ? (
            <Button type="secondary" onClick={() => stopWatchingPosition()} disabled={false}>
              {i18n('tracking.stopTracking')}
            </Button>
          ) : (
            <Button type="primary" onClick={() => startWatchingPosition()} disabled={false}>
              {i18n('tracking.startTracking')}
            </Button>
          )}
          <Divider />
        </Space>
        {isTrackingPosition ? (
          <div className="mt-4">
            <Mapbox
              initialZoom={15}
              height={300}
              width="100%"
              originLatitude={latitude}
              originLongitude={longitude}
              centerMarker
              navigation
              styleCtrl
            />
            <Title level={5} className="mt-6">
              {i18n('tracking.lastPosition')}
            </Title>
            <div className="mt-0">
              {latitude}, {longitude}
            </div>
            <div className="my-0">{timestamp}</div>
          </div>
        ) : null}
      </Card>
    </Layout>
  )
}

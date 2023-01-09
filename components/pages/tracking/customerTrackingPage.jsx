import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { createGlobalStyle } from 'styled-components'
import { Layout, Card, Space, Button, notification, message, Typography, Divider, Spin } from 'antd'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
import { Mapbox } from '../maps/Mapbox'

const { Title } = Typography

export const CustomersTrackingPage = () => {
  const router = useRouter()
  const { shipmentId } = router.query
  const [isTrackingPosition, setIsTrackingPosition] = useState(false)
  const [latitude, setLatitude] = useState(0)
  const [longitude, setLongitude] = useState(0)
  const [heading, setHeading] = useState()
  const [speed, setSpeed] = useState()
  const [timestamp, setTimestamp] = useState()

  // Get Clients data to populate the Select Options in the Clients Filter
  const { data, error } = useSWR(`/api/tracking/getPosition?shipmentId=${shipmentId}`, url => fetch(url).then(res => res.json()), { refreshInterval: 180000 })
  // console.log(clientsData)
  // console.log('data', data)

  useEffect(() => {
    if (data) {
      const [ position ] = data
      // console.log('position', position )
      const date = new Date(position.timestamp).toString()
      setLatitude(position.coords?.latitude)
      setLongitude(position.coords?.longitude)
      setSpeed(position.coords?.speed)
      setHeading(position.coords?.heading)
      setTimestamp(date)
      setIsTrackingPosition(true)
    }
  }, [data])

  if (error) return <div>client error</div>
  if (!data)
    return (
      <Card bordered={false} className="invoice-card w-full p-4">
        <Spin />
      </Card>
    )

  return (
    <Layout className="site-layout p-4" style={{ minHeight: '100vh' }}>
      <Card>
        <Title level={3}>{i18n(`tracking.title`)}</Title>
        <Title level={5}>
          {i18n(`tracking.shipmentId`)}: {shipmentId}
        </Title>
        {isTrackingPosition ? (
          <div className="mt-4">
            <Mapbox
              initialZoom={15}
              height={400}
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

import React, { useState } from 'react'
// import Image from 'next/image'
// import { useRouter } from 'next/router'
import {
  Space,
  PageHeader,
  Progress,
  Button,
  Layout,
  Steps,
  Radio,
  Card,
  Select,
  Row,
  Col,
  Input,
  Checkbox,
  Form,
  Typography,
  DatePicker,
  TimePicker,
  Avatar,
} from 'antd'
import { IdcardOutlined, CommentOutlined, FilePdfOutlined } from '@ant-design/icons'
import { i18n } from '../../../services/i18n'
import { AppHeader } from '../../layout/AppHeader'
import { SideMenu } from '../../layout/SideMenu'
// import next from 'next'
import { Mapbox } from '../maps/Mapbox'
import geoLocations from '../../../services/gps/geoLocations'

const { Title } = Typography
const { RangePicker } = TimePicker
const { Meta } = Card
const { Option } = Select
const { TextArea } = Input

const NewQuotePageHeader = props => {
  const { cfdi, resetForm, setCfdiFields, nextStep, previousStep, currentStep, creatingCfdi, saveDraft, createCfdi, finished } = props
  // const buttonsByStep = steps.map(({ buttons }) => buttons)
  return (
    <div>
      <PageHeader ghost={false} title={i18n('newQuote.title')} subTitle={`${i18n(`newQuote.subtitle`)}`} className="text-right py-1" />
    </div>
  )
}

const RouteStep = () => {
  const [origin, setOrigin] = useState({
    latitude: 37.487846,
    longitude: -122.236115,
  })
  const [destination, setDestination] = useState({
    latitude: 25.942122,
    longitude: -80.26992,
  })

  const onOriginChange = option => {
    setOrigin(geoLocations[option - 1])
  }
  const onDestinationChange = option => {
    setDestination(geoLocations[option - 1])
  }
  return (
    <div className="w-full">
      <div className="mt-4 w-full">
        <Title level={4} className="text-center">
          {i18n(`newQuote.steps.routeQuestion`)}
        </Title>
      </div>
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={{ span: 9, offset: 3 }} md={{ span: 9, offset: 3 }} lg={{ span: 9, offset: 3 }} xl={{ span: 6, offset: 6 }}>
          <Title level={5} className="mb-3 text-center">
            {i18n(`newQuote.steps.origin`)}
          </Title>
          <Card
            cover={(
              /*
              <Image
                alt="example"
                src="/fakeMap1.png"
                width={400}
                height={200}
                layout='responsive'
              />
            */
              <Mapbox
                initialZoom={11}
                height={250}
                width="100%"
                originLatitude={origin.latitude}
                originLongitude={origin.longitude}
                centerMarker
                navigation
                styleCtrl
              />
            )}
          >
            <Form layout="vertical">
              <Form.Item label={i18n(`newQuote.steps.pickupPlace`)}>
                <Select filterOption onChange={onOriginChange}>
                  {geoLocations.map(location => {
                    return <Option value={location.id}>{location.name}</Option>
                  })}
                </Select>
                <Button type="link">{i18n(`newQuote.steps.newPlace`)}</Button>
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.pickupWindow`)}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <DatePicker style={{ width: '100%' }} />
                  <RangePicker showTime style={{ width: '100%' }} format="HH:mm" />
                  <Input placeholder={i18n('newQuote.steps.appointmentId')} />
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} sm={{ span: 9 }} md={{ span: 9 }} lg={{ span: 9 }} xl={{ span: 6 }}>
          <Title level={5} className="mb-3 text-center">
            {i18n(`newQuote.steps.destination`)}
          </Title>
          <Card
            cover={(
              <Mapbox
                initialZoom={11}
                height={250}
                width="100%"
                originLatitude={destination.latitude}
                originLongitude={destination.longitude}
                centerMarker
                navigation
                styleCtrl
              />
            )}
          >
            <Form layout="vertical">
              <Form.Item label={i18n(`newQuote.steps.deliveryPlace`)}>
                <Select filterOption onChange={onDestinationChange}>
                  {geoLocations.map(location => {
                    return <Option value={location.id}>{location.name}</Option>
                  })}
                </Select>
                <Button type="link">{i18n(`newQuote.steps.newPlace`)}</Button>
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.deliveryWindow`)}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <DatePicker style={{ width: '100%' }} />
                  <RangePicker showTime style={{ width: '100%' }} format="HH:mm" />
                  <Input placeholder={i18n('newQuote.steps.appointmentId')} />
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const LoadStep = () => {
  const weightSelector = (
    <Select defaultValue={i18n('newQuote.steps.weightUnits.tonMetric')}>
      <Option value={i18n('newQuote.steps.weightUnits.g')}>{i18n('newQuote.steps.weightUnits.g')}</Option>
      <Option value={i18n('newQuote.steps.weightUnits.kg')}>{i18n('newQuote.steps.weightUnits.kg')}</Option>
      <Option value={i18n('newQuote.steps.weightUnits.tonMetric')}>{i18n('newQuote.steps.weightUnits.tonMetric')}</Option>
      <Option value={i18n('newQuote.steps.weightUnits.lb')}>{i18n('newQuote.steps.weightUnits.lb')}</Option>
      <Option value={i18n('newQuote.steps.weightUnits.cwtUK')}>{i18n('newQuote.steps.weightUnits.cwtUK')}</Option>
      <Option value={i18n('newQuote.steps.weightUnits.cwtUS')}>{i18n('newQuote.steps.weightUnits.cwtUS')}</Option>
      <Option value={i18n('newQuote.steps.weightUnits.tonUK')}>{i18n('newQuote.steps.weightUnits.tonUK')}</Option>
      <Option value={i18n('newQuote.steps.weightUnits.tonUS')}>{i18n('newQuote.steps.weightUnits.tonUS')}</Option>
    </Select>
  )
  const dimensionSelector = (
    <Select defaultValue={i18n('newQuote.steps.dimensionUnits.m')}>
      <Option value={i18n('newQuote.steps.dimensionUnits.cm')}>{i18n('newQuote.steps.dimensionUnits.cm')}</Option>
      <Option value={i18n('newQuote.steps.dimensionUnits.m')}>{i18n('newQuote.steps.dimensionUnits.m')}</Option>
      <Option value={i18n('newQuote.steps.dimensionUnits.inches')}>{i18n('newQuote.steps.dimensionUnits.inches')}</Option>
      <Option value={i18n('newQuote.steps.dimensionUnits.ft')}>{i18n('newQuote.steps.dimensionUnits.ft')}</Option>
      <Option value={i18n('newQuote.steps.dimensionUnits.yd')}>{i18n('newQuote.steps.dimensionUnits.yd')}</Option>
    </Select>
  )
  const volumeSelector = (
    <Select defaultValue={i18n('newQuote.steps.volumeUnits.l')}>
      <Option value={i18n('newQuote.steps.volumeUnits.ml')}>{i18n('newQuote.steps.volumeUnits.ml')}</Option>
      <Option value={i18n('newQuote.steps.volumeUnits.l')}>{i18n('newQuote.steps.volumeUnits.l')}</Option>
      <Option value={i18n('newQuote.steps.volumeUnits.oz')}>{i18n('newQuote.steps.volumeUnits.oz')}</Option>
      <Option value={i18n('newQuote.steps.volumeUnits.galUK')}>{i18n('newQuote.steps.volumeUnits.galUK')}</Option>
      <Option value={i18n('newQuote.steps.volumeUnits.galUS')}>{i18n('newQuote.steps.volumeUnits.galUS')}</Option>
    </Select>
  )
  return (
    <div className="mt-4 w-full">
      <Title level={4} className="text-center">
        {i18n(`newQuote.steps.loadQuestion`)}
      </Title>
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={{ span: 9, offset: 3 }} md={{ span: 9, offset: 3 }} lg={{ span: 9, offset: 3 }} xl={{ span: 6, offset: 6 }}>
          <Title level={5} className="mb-3 text-center">
            {i18n(`newQuote.steps.loadType`)}
          </Title>
          <Card style={{ height: '93%' }}>
            <Form layout="vertical">
              <Form.Item label={i18n(`newQuote.steps.loadCategory`)}>
                <Select>
                  <Option value={i18n(`newQuote.steps.loadCategories.general`)}>{i18n(`newQuote.steps.loadCategories.general`)}</Option>
                  <Option value={i18n(`newQuote.steps.loadCategories.bulk`)}>{i18n(`newQuote.steps.loadCategories.bulk`)}</Option>
                  <Option value={i18n(`newQuote.steps.loadCategories.perishable`)}>
                    {i18n(`newQuote.steps.loadCategories.perishable`)}
                  </Option>
                  <Option value={i18n(`newQuote.steps.loadCategories.fragile`)}>{i18n(`newQuote.steps.loadCategories.fragile`)}</Option>
                  <Option value={i18n(`newQuote.steps.loadCategories.hazardous`)}>{i18n(`newQuote.steps.loadCategories.hazardous`)}</Option>
                </Select>
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.hazardousCategory`)}>
                <Select>
                  <Option value={i18n(`newQuote.steps.hazardousCategories.explosives`)}>
                    {i18n(`newQuote.steps.hazardousCategories.explosives`)}
                  </Option>
                  <Option value={i18n(`newQuote.steps.hazardousCategories.gases`)}>
                    {i18n(`newQuote.steps.hazardousCategories.gases`)}
                  </Option>
                  <Option value={i18n(`newQuote.steps.hazardousCategories.flamableLiquids`)}>
                    {i18n(`newQuote.steps.hazardousCategories.flamableLiquids`)}
                  </Option>
                  <Option value={i18n(`newQuote.steps.hazardousCategories.flamableSolids`)}>
                    {i18n(`newQuote.steps.hazardousCategories.flamableSolids`)}
                  </Option>
                  <Option value={i18n(`newQuote.steps.hazardousCategories.oxidizingSubstances`)}>
                    {i18n(`newQuote.steps.hazardousCategories.oxidizingSubstances`)}
                  </Option>
                  <Option value={i18n(`newQuote.steps.hazardousCategories.toxicAndInfectious`)}>
                    {i18n(`newQuote.steps.hazardousCategories.toxicAndInfectious`)}
                  </Option>
                  <Option value={i18n(`newQuote.steps.hazardousCategories.radioactiveMaterial`)}>
                    {i18n(`newQuote.steps.hazardousCategories.radioactiveMaterial`)}
                  </Option>
                  <Option value={i18n(`newQuote.steps.hazardousCategories.corrosiveSubstances`)}>
                    {i18n(`newQuote.steps.hazardousCategories.corrosiveSubstances`)}
                  </Option>
                  <Option value={i18n(`newQuote.steps.hazardousCategories.otherDangerousObjects`)}>
                    {i18n(`newQuote.steps.hazardousCategories.otherDangerousObjects`)}
                  </Option>
                </Select>
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.loadDescription`)}>
                <TextArea style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} sm={{ span: 9 }} md={{ span: 9 }} lg={{ span: 9 }} xl={{ span: 6 }}>
          <Title level={5} className="mb-3 text-center">
            {i18n(`newQuote.steps.loadDimensions`)}
          </Title>
          <Card>
            <Form layout="vertical">
              <Form.Item label={i18n(`newQuote.steps.weight`)}>
                <Input type="number" addonAfter={weightSelector} />
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.height`)}>
                <Input type="number" addonAfter={dimensionSelector} />
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.width`)}>
                <Input type="number" addonAfter={dimensionSelector} />
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.lenght`)}>
                <Input type="number" addonAfter={dimensionSelector} />
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.volume`)}>
                <Input type="number" addonAfter={volumeSelector} />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const DetailsStep = () => {
  const recurrenceSelector = (
    <Select defaultValue={i18n('newQuote.steps.recurrenceUnits.perMonth')}>
      <Option value={i18n('newQuote.steps.recurrenceUnits.perDay')}>{i18n('newQuote.steps.recurrenceUnits.perDay')}</Option>
      <Option value={i18n('newQuote.steps.recurrenceUnits.perWeek')}>{i18n('newQuote.steps.recurrenceUnits.perWeek')}</Option>
      <Option value={i18n('newQuote.steps.recurrenceUnits.perMonth')}>{i18n('newQuote.steps.recurrenceUnits.perMonth')}</Option>
      <Option value={i18n('newQuote.steps.recurrenceUnits.perQuarter')}>{i18n('newQuote.steps.recurrenceUnits.perQuarter')}</Option>
      <Option value={i18n('newQuote.steps.recurrenceUnits.perYear')}>{i18n('newQuote.steps.recurrenceUnits.perYear')}</Option>
    </Select>
  )
  return (
    <div className="mt-4 w-full">
      <Title level={4} className="text-center">
        {i18n(`newQuote.steps.detailsTitle`)}
      </Title>
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={{ span: 12, offset: 6 }} md={{ span: 12, offset: 6 }} lg={{ span: 12, offset: 6 }} xl={{ span: 12, offset: 6 }}>
          <Card>
            <Form layout="vertical" className="text-left">
              <Form.Item label={i18n(`newQuote.steps.typeOfService`)}>
                <Select>
                  <Option value={i18n(`newQuote.steps.export`)}>{i18n(`newQuote.steps.export`)}</Option>
                  <Option value={i18n(`newQuote.steps.import`)}>{i18n(`newQuote.steps.import`)}</Option>
                  <Option value={i18n(`newQuote.steps.national`)}>{i18n(`newQuote.steps.national`)}</Option>
                  <Option value={i18n(`newQuote.steps.regional`)}>{i18n(`newQuote.steps.regional`)}</Option>
                  <Option value={i18n(`newQuote.steps.local`)}>{i18n(`newQuote.steps.local`)}</Option>
                </Select>
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.typeOfTrip`)}>
                <Select>
                  <Option value={i18n(`newQuote.steps.oneWay`)}>{i18n(`newQuote.steps.oneWay`)}</Option>
                  <Option value={i18n(`newQuote.steps.roundTrip`)}>{i18n(`newQuote.steps.roundTrip`)}</Option>
                </Select>
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.urgency`)}>
                <Select>
                  <Option value={i18n(`newQuote.steps.normal`)}>{i18n(`newQuote.steps.normal`)}</Option>
                  <Option value={i18n(`newQuote.steps.expedited`)}>{i18n(`newQuote.steps.expedited`)}</Option>
                </Select>
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.recurrence`)}>
                <Select>
                  <Option value={i18n(`newQuote.steps.spot`)}>{i18n(`newQuote.steps.spot`)}</Option>
                  <Option value={i18n(`newQuote.steps.project`)}>{i18n(`newQuote.steps.project`)}</Option>
                </Select>
              </Form.Item>
              <Form.Item label={i18n(`newQuote.steps.numberOfShipments`)}>
                <Input type="number" addonAfter={recurrenceSelector} />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const ModeStep = () => {
  const [mode, setMode] = useState('land')
  const onChangeMode = e => {
    setMode(e.target.value)
  }

  return (
    <div className="mt-4 w-full">
      <Title level={4} className="text-center">
        {i18n(`newQuote.steps.modeOfTransport`)}
      </Title>
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={{ span: 12, offset: 6 }} md={{ span: 12, offset: 6 }} lg={{ span: 12, offset: 6 }} xl={{ span: 12, offset: 6 }}>
          <Card cover={<img alt="example" src={i18n(`newQuote.steps.modeImages.${mode}`)} className="scale-50" />}>
            <Form layout="vertical" className="text-left">
              <Form.Item className="text-center">
                <Radio.Group defaultValue="land" buttonStyle="solid">
                  <Radio.Button value="land" onChange={onChangeMode}>
                    {i18n(`newQuote.steps.land`)}
                  </Radio.Button>
                  <Radio.Button value="sea" onChange={onChangeMode}>
                    {i18n(`newQuote.steps.sea`)}
                  </Radio.Button>
                  <Radio.Button value="air" onChange={onChangeMode}>
                    {i18n(`newQuote.steps.air`)}
                  </Radio.Button>
                  <Radio.Button value="train" onChange={onChangeMode}>
                    {i18n(`newQuote.steps.train`)}
                  </Radio.Button>
                  <Radio.Button value="multi" onChange={onChangeMode}>
                    {i18n(`newQuote.steps.multi`)}
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              {mode === 'land' || mode === 'multi' ? (
                <Form.Item label={i18n(`newQuote.steps.landContainer`)}>
                  <Select defaultValue={i18n(`newQuote.steps.suggestMe`)}>
                    <Option value={i18n(`newQuote.steps.suggestMe`)}>{i18n(`newQuote.steps.suggestMe`)}</Option>
                    <Option value={i18n(`newQuote.steps.landContainers.threeAndHalf`)}>
                      {i18n(`newQuote.steps.landContainers.threeAndHalf`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.landContainers.oneAxis`)}>{i18n(`newQuote.steps.landContainers.oneAxis`)}</Option>
                    <Option value={i18n(`newQuote.steps.landContainers.twoAxis`)}>{i18n(`newQuote.steps.landContainers.twoAxis`)}</Option>
                    <Option value={i18n(`newQuote.steps.landContainers.dryTrailer48`)}>
                      {i18n(`newQuote.steps.landContainers.dryTrailer48`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.landContainers.dryTrailer53`)}>
                      {i18n(`newQuote.steps.landContainers.dryTrailer53`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.landContainers.double`)}>{i18n(`newQuote.steps.landContainers.double`)}</Option>
                    <Option value={i18n(`newQuote.steps.landContainers.refrigerated`)}>
                      {i18n(`newQuote.steps.landContainers.refrigerated`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.landContainers.tank`)}>{i18n(`newQuote.steps.landContainers.tank`)}</Option>
                    <Option value={i18n(`newQuote.steps.landContainers.gondola`)}>{i18n(`newQuote.steps.landContainers.gondola`)}</Option>
                    <Option value={i18n(`newQuote.steps.landContainers.cattleCage`)}>
                      {i18n(`newQuote.steps.landContainers.cattleCage`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.landContainers.linedCage`)}>
                      {i18n(`newQuote.steps.landContainers.linedCage`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.landContainers.platform`)}>{i18n(`newQuote.steps.landContainers.platform`)}</Option>
                    <Option value={i18n(`newQuote.steps.landContainers.lowBoy`)}>{i18n(`newQuote.steps.landContainers.lowBoy`)}</Option>
                    <Option value={i18n(`newQuote.steps.landContainers.hopper`)}>{i18n(`newQuote.steps.landContainers.hopper`)}</Option>
                    <Option value={i18n(`newQuote.steps.landContainers.singleCarCarrier`)}>
                      {i18n(`newQuote.steps.landContainers.singleCarCarrier`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.landContainers.multiCarCarrier`)}>
                      {i18n(`newQuote.steps.landContainers.multiCarCarrier`)}
                    </Option>
                  </Select>
                </Form.Item>
              ) : null}

              {mode === 'sea' || mode === 'multi' ? (
                <Form.Item label={i18n(`newQuote.steps.seaContainer`)}>
                  <Select defaultValue={i18n(`newQuote.steps.suggestMe`)}>
                    <Option value={i18n(`newQuote.steps.suggestMe`)}>{i18n(`newQuote.steps.suggestMe`)}</Option>
                    <Option value={i18n(`newQuote.steps.seaContainers.dryVan`)}>{i18n(`newQuote.steps.seaContainers.dryVan`)}</Option>
                    <Option value={i18n(`newQuote.steps.seaContainers.highCube`)}>{i18n(`newQuote.steps.seaContainers.highCube`)}</Option>
                    <Option value={i18n(`newQuote.steps.seaContainers.openTop`)}>{i18n(`newQuote.steps.seaContainers.openTop`)}</Option>
                    <Option value={i18n(`newQuote.steps.seaContainers.openSide`)}>{i18n(`newQuote.steps.seaContainers.openSide`)}</Option>
                    <Option value={i18n(`newQuote.steps.seaContainers.flatRack`)}>{i18n(`newQuote.steps.seaContainers.flatRack`)}</Option>
                    <Option value={i18n(`newQuote.steps.seaContainers.tank`)}>{i18n(`newQuote.steps.seaContainers.tank`)}</Option>
                    <Option value={i18n(`newQuote.steps.seaContainers.refrigerated`)}>
                      {i18n(`newQuote.steps.seaContainers.refrigerated`)}
                    </Option>
                  </Select>
                </Form.Item>
              ) : null}

              {mode === 'sea' || mode === 'multi' ? (
                <Form.Item>
                  <Select defaultValue={i18n(`newQuote.steps.suggestMe`)}>
                    <Option value={i18n(`newQuote.steps.suggestMe`)}>{i18n(`newQuote.steps.suggestMe`)}</Option>
                    <Option value={i18n(`newQuote.steps.seaContainersSize.ten`)}>{i18n(`newQuote.steps.seaContainersSize.ten`)}</Option>
                    <Option value={i18n(`newQuote.steps.seaContainersSize.twenty`)}>
                      {i18n(`newQuote.steps.seaContainersSize.twenty`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.seaContainersSize.thirty`)}>
                      {i18n(`newQuote.steps.seaContainersSize.thirty`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.seaContainersSize.fourty`)}>
                      {i18n(`newQuote.steps.seaContainersSize.fourty`)}
                    </Option>
                  </Select>
                </Form.Item>
              ) : null}

              {mode === 'air' || mode === 'multi' ? (
                <Form.Item label={i18n(`newQuote.steps.airContainer`)}>
                  <Select defaultValue={i18n(`newQuote.steps.suggestMe`)}>
                    <Option value={i18n(`newQuote.steps.suggestMe`)}>{i18n(`newQuote.steps.suggestMe`)}</Option>
                    <Option value={i18n(`newQuote.steps.airContainers.palletPIPoPAG`)}>
                      {i18n(`newQuote.steps.airContainers.palletPIPoPAG`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.airContainers.palletPGPoPMC`)}>
                      {i18n(`newQuote.steps.airContainers.palletPGPoPMC`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.airContainers.palletPGA`)}>{i18n(`newQuote.steps.airContainers.palletPGA`)}</Option>
                    <Option value={i18n(`newQuote.steps.airContainers.containerLD3oAKEoAVE`)}>
                      {i18n(`newQuote.steps.airContainers.containerLD3oAKEoAVE`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.airContainers.containerLD9oAAP`)}>
                      {i18n(`newQuote.steps.airContainers.containerLD9oAAP`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.airContainers.containerM1oAMA`)}>
                      {i18n(`newQuote.steps.airContainers.containerM1oAMA`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.airContainers.containerM6oACA`)}>
                      {i18n(`newQuote.steps.airContainers.containerM6oACA`)}
                    </Option>
                  </Select>
                </Form.Item>
              ) : null}

              {mode === 'train' || mode === 'multi' ? (
                <Form.Item label={i18n(`newQuote.steps.trainContainer`)}>
                  <Select defaultValue={i18n(`newQuote.steps.suggestMe`)}>
                    <Option value={i18n(`newQuote.steps.suggestMe`)}>{i18n(`newQuote.steps.suggestMe`)}</Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.autorack`)}>
                      {i18n(`newQuote.steps.trainContainers.autorack`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.boxcar`)}>{i18n(`newQuote.steps.trainContainers.boxcar`)}</Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.centerbeam`)}>
                      {i18n(`newQuote.steps.trainContainers.centerbeam`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.coveredHopper`)}>
                      {i18n(`newQuote.steps.trainContainers.coveredHopper`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.coilCar`)}>{i18n(`newQuote.steps.trainContainers.coilCar`)}</Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.flatCar`)}>{i18n(`newQuote.steps.trainContainers.flatCar`)}</Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.gondola`)}>{i18n(`newQuote.steps.trainContainers.gondola`)}</Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.intermodal`)}>
                      {i18n(`newQuote.steps.trainContainers.intermodal`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.refrigeratedBoxcar`)}>
                      {i18n(`newQuote.steps.trainContainers.refrigeratedBoxcar`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.open-topHopper`)}>
                      {i18n(`newQuote.steps.trainContainers.open-topHopper`)}
                    </Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.tankCar`)}>{i18n(`newQuote.steps.trainContainers.tankCar`)}</Option>
                    <Option value={i18n(`newQuote.steps.trainContainers.wellCar`)}>{i18n(`newQuote.steps.trainContainers.wellCar`)}</Option>
                  </Select>
                </Form.Item>
              ) : null}
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const AdditionalsStep = () => {
  return (
    <div className="mt-4 w-full">
      <Title level={4} className="text-center">
        {i18n(`newQuote.steps.additionalServices`)}
      </Title>
      <Row gutter={[16, 8]} className="text-center">
        <Col xs={24} sm={{ span: 12, offset: 6 }} md={{ span: 12, offset: 6 }} lg={{ span: 12, offset: 6 }} xl={{ span: 12, offset: 6 }}>
          <Card>
            <Form layout="vertical">
              <Checkbox.Group className="text-left">
                <Form.Item>
                  <Checkbox value="{i18n(`newQuote.steps.customs`)}">{i18n(`newQuote.steps.customs`)}</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Checkbox value="{i18n(`newQuote.steps.inspection`)}">{i18n(`newQuote.steps.inspection`)}</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Checkbox value="{i18n(`newQuote.steps.warehouse`)}">{i18n(`newQuote.steps.warehouse`)}</Checkbox>
                </Form.Item>
                <Form.Item>
                  <Checkbox value="{i18n(`newQuote.steps.insurance`)}">{i18n(`newQuote.steps.insurance`)}</Checkbox>
                </Form.Item>
              </Checkbox.Group>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const ContactStep = () => {
  return (
    <div className="mt-4 w-full">
      <Title level={4} className="text-center">
        {i18n(`newQuote.steps.contactInfo`)}
      </Title>
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={{ span: 12, offset: 6 }} md={{ span: 12, offset: 6 }} lg={{ span: 12, offset: 6 }} xl={{ span: 12, offset: 6 }}>
          <Card>
            <Form layout="vertical">
              {' '}
              <Form.Item label={i18n('newQuote.steps.name')}>
                <Input style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label={i18n('newQuote.steps.lastName')}>
                <Input style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label={i18n('newQuote.steps.email')}>
                <Input style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label={i18n('newQuote.steps.phoneNumber')}>
                <Input style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label={i18n('newQuote.steps.companyName')}>
                <Input style={{ width: '100%' }} />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const ThanksStep = () => {
  return (
    <div className="mt-4 w-full">
      <Row gutter={[16, 8]}>
        <Col xs={24} sm={{ span: 12, offset: 6 }} md={{ span: 12, offset: 6 }} lg={{ span: 12, offset: 6 }} xl={{ span: 12, offset: 6 }}>
          <Card
            cover={(
              <div className="flex flex-wrap place-content-center">
                <img alt="example" src={i18n(`newQuote.steps.thanksImage`)} style={{ width: '100%', height: '100%' }} />
              </div>
            )}
            actions={[<IdcardOutlined key="setting" />, <CommentOutlined key="edit" />, <FilePdfOutlined key="pdf" />]}
          >
            <Title level={5} className="text-center">
              RFQ 4577
            </Title>
            <Meta
              avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
              title="Enrique Vargas"
              description={i18n(`newQuote.steps.assignMessage`)}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const ButtonSteps = ({ backStep, nextStep, resetSteps, currentStep }) => {
  return (
    <div>
      {currentStep === 6 ? (
        <Row gutter={[16, 8]} className="mt-3">
          <Col xs={{ span: 24 }} sm={{ span: 12, offset: 6 }}>
            <Button style={{ width: '100%' }} type="primary" onClick={resetSteps}>
              {i18n(`newQuote.steps.end`)}
            </Button>
          </Col>
        </Row>
      ) : (
        <Row gutter={[16, 8]} className="mt-3">
          {!currentStep === 0 ? (
            <Col xs={{ span: 12 }} sm={{ span: 6, offset: 12 }}>
              <Button style={{ width: '100%' }} onClick={backStep}>
                {i18n(`newQuote.steps.back`)}
              </Button>
            </Col>
          ) : null}
          <Col
            xs={!currentStep === 0 ? { span: 12 } : { span: 12, offset: 12 }}
            sm={!currentStep === 0 ? { span: 6 } : { span: 6, offset: 18 }}
          >
            <Button style={{ width: '100%' }} type="primary" onClick={nextStep}>
              {i18n(`newQuote.steps.next`)}
            </Button>
          </Col>
        </Row>
      )}
    </div>
  )
}

const content = [<RouteStep />, <LoadStep />, <DetailsStep />, <ModeStep />, <AdditionalsStep />, <ContactStep />, <ThanksStep />]

const NewQuote = ({ nextStep, backStep, resetSteps, currentStep }) => {
  const { Step } = Steps
  return (
    <div>
      <NewQuotePageHeader />

      <div className="-mt-2 pt-0 md:w-full lg:w-full mx-auto">
        <Progress percent={Math.floor((currentStep * 100) / 6, 1)} showInfo={false} />
      </div>
      <div className="mt-3 w-full">
        {content[currentStep]}
        <ButtonSteps nextStep={nextStep} backStep={backStep} resetSteps={resetSteps} currentStep={currentStep} />
      </div>
    </div>
  )
}

export const NewQuotePage = () => {
  const [collapsedMenu, setCollapsedMenu] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const toggleMenu = () => {
    setCollapsedMenu(!collapsedMenu)
  }
  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }
  const backStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetSteps = () => {
    setCurrentStep(0)
  }
  const [page, setPage] = useState('new-quote')
  return (
    <Layout className="min-h-screen" hasSider>
      <Layout>
        <AppHeader toggleMenu={toggleMenu} collapsed={collapsedMenu} />
        <Layout.Content className="p-4">
          <NewQuote nextStep={nextStep} backStep={backStep} resetSteps={resetSteps} currentStep={currentStep} />
        </Layout.Content>
      </Layout>
      <SideMenu collapsed={collapsedMenu} page={page} />
    </Layout>
  )
}

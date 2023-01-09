import React, { useEffect, useReducer, useState, useRef, useCallback } from 'react'
import useSWR from 'swr'
import {
  Space,
  Typography,
  Button,
  Layout,
  Card,
  Alert,
  Form,
  Divider,
  Drawer,
  notification,
  message,
  Tag,
  Table,
  Radio,
  Collapse,
  Statistic,
  Row,
  Col,
} from 'antd'
import { EditOutlined, CheckOutlined, SettingOutlined, PlusOutlined } from '@ant-design/icons'
import { useForm, Controller } from 'react-hook-form'
import Router, { useRouter } from 'next/router'
import useEffectExceptOnMount from '../../hooks/useEffectExceptOnMount.ts'
import { i18n } from '../../../services/i18n'
import { post } from '../../../services/fetch'
import { ShareWithTeam } from './shareWithTeam'
import { NewLocation } from './newLocation'
import { RouteTimeline } from './routeTimeline'
import { GeneralShipmentInfo } from './generalShipmentInfo'
import { numberFormat } from '../../../services/helpers/mathHelp'
import { validateBoLHub } from '../../../services/sat/validateBoLHub'
import { GoodsList } from './goodsList'
import { LandTransport } from './landTransport'
import { TransportDetail } from './transportDetail'
import { NewTransport } from './newTransport'
import { NewTag } from './newTag'
import { NewItem } from '../products/newItem'
import { BoLHBenefits } from './marketingMessages'
import { generateCartaPorte2ToStamp } from '../../../services/sat/generateCartaPorte2JsonToStamp'
import { filterUsersByViewPermission, filterUsersByViewPermissionOnlyMail } from '../users/filterUsersByPermission'
import { extractGoodsFromXml } from './xmlParser'

const { Title, Text, Paragraph } = Typography
const { Header, Content, Footer, Sider } = Layout
const { Panel } = Collapse

export const BillOfLadingHub = () => {
  const router = useRouter()
  const emailInputRef = useRef(null)
  const { id } = router.query
  const { data, error } = useSWR(`/api/bill-of-lading-hub/get-bill-of-lading-hub-data?id=${id}`, post, {
    dedupingInterval: 100,
  })

  const [BoLId, setBoLId] = useState(id)
  const { control, handleSubmit, errors, watch } = useForm()
  const [isShareVisible, setIsShareVisible] = useState(false)
  const [isTagVisible, setIsTagVisible] = useState(false)
  const [isSettingsVisible, setIsSettingsVisible] = useState(false)
  const [isLocationVisible, setIsLocationVisible] = useState(false)
  const [isRouteComplete, setIsRouteComplete] = useState(false)
  const [isLoadComplete, setIsLoadComplete] = useState(false)
  const [isCustomsComplete, setIsCustomsComplete] = useState(false)
  const [isFreightPriceComplete, setIsFreightPriceComplete] = useState(false)
  const [isDocumentsComplete, setIsDocumentsComplete] = useState(false)
  const [isTransferBoL, setIsTransferBoL] = useState(false)
  const [isInternational, setIsInternational] = useState(false)
  const [locationIndex, setLocationIndex] = useState(undefined)
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [isDisabledSearchPlaces, setIsDisabledSearchPlaces] = useState(false)
  const [isTransportVisible, setIsTransportVisible] = useState(false)
  const [transportIndex, setTransportIndex] = useState(undefined)
  const [isEditingTransport, setIsEditingTransport] = useState(false)
  const [isItemVisible, setIsItemVisible] = useState(false)
  const [itemIndex, setItemIndex] = useState(undefined)
  const [isEditingItem, setIsEditingItem] = useState(false)
  const [tagIndex, setTagIndex] = useState(undefined)
  const [isEditingTag, setIsEditingTag] = useState(false)
  const [isDeletingTag, setIsDeletingTag] = useState(false)
  const [isDisabledSearchItems, setIsDisabledSearchItems] = useState(false)
  const [isBoLHAuthorized, setIsBoLHAuthorized] = useState(false)
  const [loggedEmail, setLoggedEmail] = useState()
  const [companyProfile, setCompanyProfile] = useState()
  const [loggedUserProfile, setLoggedUserProfile] = useState()
  const [hubErrors, setHubErrors] = useState([])
  const [isReadyToAction, setIsReadyToAction] = useState(data?.status?.isReadyToAction)
  const [creatingCfdi, setCreatingCfdi] = useState(false)
  const [finishedCfdi, setFinishedCfdi] = useState(false)
  const [apiError, setApiError] = useState()
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [totalMargin, setTotalMargin] = useState(0)

  useEffect(() => {
    setIsReadyToAction(data?.status?.isReadyToAction)
  }, [data])
  useEffect(() => {}, [isBoLHAuthorized, loggedEmail])

  //   useEffect(() => {
  //     window.onbeforeunload = function() {
  //         return true;
  //     };

  //     return () => {
  //         window.onbeforeunload = null;
  //     };
  // }, []);

  useEffect(() => {
    post('/api/logged-user/get-authorizations')
      .then(({ ok, loggedUserLicenses, loggedUserEmail, error, companyProfile, loggedUserProfile }) => {
        if (loggedUserLicenses) {
          // console.log('loggedUserLicences', loggedUserLicenses)
          loggedUserLicenses.map(license => {
            if (license.licenseName === 'BoLHub') {
              // console.log('licenseName', license.licenseName, 'license.active', license.active)
              setIsBoLHAuthorized(license.active)
              // console.log('isBoLHAuthorized', isBoLHAuthorized)
            }
            if (companyProfile) setCompanyProfile(companyProfile)
            if (loggedUserProfile) setLoggedUserProfile(loggedUserProfile)
            return null
          })
        }
        if (loggedUserEmail) setLoggedEmail(loggedUserEmail)
        // if (!error) setFinished('signed')
        // setApiError(error, details?.message || '')
      })
      // eslint-disable-next-line no-console
      .catch(error => console.log(error))
  }, [])
  const BoLHInitialState = {
    status: {
      generalInfoComplete: false,
      loadComplete: false,
      goodsComplete: false,
      customsComplete: false,
      transportsComplete: false,
      pricesComplete: false,
      documentsComplete: false,
    },
    billOfLading2: {
      internationalTransport: 'No',
      locations: [],
      goods: {
        totalWeight: 0, // Peso Bruto total en KG del total de itemancías
        weightUnit: 'KGM',
        totalGoods: 0, // El valor de este campo debe ser igual al número de secciones good que se registren en el complemento.
        good: [],
      },
      transports: [],
    },
    share: {
      userToSendInvitation: {
        preferedLanguage: 'es',
      },
    },
  }

  const isBoLComplete = () => {
    if (isRouteComplete && isLoadComplete && isCustomsComplete && isFreightPriceComplete && isDocumentsComplete) {
      return true
    }
    return false
  }

  const saveChangeInDB = (id, action, fields) => {
    // console.log('saveChangeInDB id', id, 'action', action, 'fields', fields)
    post(`/api/bill-of-lading-hub/update-field`, { body: { id: id, action: action, fields: fields } })
      .then(({ ok, message, error }) => {
        if (error) notification.error({ message: 'Error', description: i18n(error) })
        // if (ok) notification.info({ message: 'Info', description: i18n(message) })
      })
      .catch(error => notification.error({ message: 'Error', description: i18n(error.message) }))
  }

  const selectARandomBenefit = () => {
    const randomBenefit = BoLHBenefits[Math.floor(Math.random() * BoLHBenefits.length)]
    return randomBenefit
  }

  const sendEmailInvitation = (userToInvite, initialState) => {
    const adminUser = initialState.share.users.find(user => user.hubManager === true)
    const benefit = selectARandomBenefit()
    const currentTime = new Date()
    const templateModel = {
      emailSubject: `${initialState.folio} | ${initialState.name}`,
      receiverName: userToInvite?.name ? userToInvite.name : '',
      BoLHName: initialState.name,
      BoLHLink: `https://app.taskility.com/bill-of-lading-hub/${initialState._id}`,
      BoLHFolio: initialState.folio,
      benefitTitle: benefit?.title,
      benefitDescription: benefit?.description,
      benefitLinkUrl: benefit?.linkUrl,
      benefitLinkText: benefit?.linkText,
      createUserLink: 'https://app.taskility.com/signup',
      adminUserEmail: adminUser?.email,
      adminUserName: `${adminUser?.name} ${adminUser?.lastName}`,
      year: currentTime.getFullYear(),
      headText: 'headText_Value',
      linkText: 'linkText_Value',
    }
    post('/api/bill-of-lading-hub/send-invitation', {
      body: { templateModel: templateModel, preferedLanguage: userToInvite.preferedLanguage, emailToSend: userToInvite.email },
    })
      .then(({ error }) => {
        if (error) {
          // dispatch(userLoginError(error))
        } else {
          // dispatch(userLoginSuccess(userDetails))
          // Cookie expiration must match the token expiration.
          // Router.push('/billing') // TODO: Redirect to a user selected initial page.
        }
      })
      .catch(error => {
        // log('error', error.message)
        // dispatch(userLoginError('login.errors.unexpected'))
      })
  }
  const calculateHubsCompletitionPercentage = (action, initialState) => {
    // Caluclate Hub's current % of completition
    const generalInfoValue = initialState?.status?.generalInfoComplete ? 1 : 0
    const locationsValue = initialState?.status?.locationsComplete ? 1 : 0
    const goodsValue = initialState?.status?.goodsComplete ? 1 : 0
    const transportsValue = initialState?.status?.transportsComplete ? 1 : 0
    const pricesValue = initialState?.status?.pricesComplete ? 1 : 0
    let BoLHStatus = (100 * (generalInfoValue + locationsValue + goodsValue + transportsValue + pricesValue)) / 5
    if (action === 'completed') BoLHStatus += 20
    if (action === 'opened to edit') BoLHStatus -= 20
    return BoLHStatus
  }

  const sendEmailUpdate = (action, section, initialState) => {
    const adminUser = initialState.share.users.find(user => user.hubManager === true)
    const benefit = selectARandomBenefit()
    const currentTime = new Date()

    const BoLHStatus = calculateHubsCompletitionPercentage(action, initialState)

    const templateModel = {
      emailSubject: `${initialState.folio} | ${initialState.name}`,
      action: action,
      section: section,
      BoLHName: initialState.name,
      BoLHLink: `https://app.taskility.com/bill-of-lading-hub/${initialState._id}`,
      BoLHFolio: initialState.folio,
      status: BoLHStatus,
      benefitTitle: benefit?.title,
      benefitDescription: benefit?.description,
      benefitLinkUrl: benefit?.linkUrl,
      benefitLinkText: benefit?.linkText,
      createUserLink: 'https://app.taskility.com/signup',
      adminUserEmail: adminUser?.email,
      adminUserName: `${adminUser?.name} ${adminUser?.lastName}`,
      year: currentTime.getFullYear(),
      headText: 'headText_Value',
      linkText: 'linkText_Value',
    }
    post('/api/bill-of-lading-hub/send-update-notification', { body: { templateModel: templateModel, initialState: initialState } })
      .then(({ error }) => {
        if (error) {
          // dispatch(userLoginError(error))
        } else {
          // dispatch(userLoginSuccess(userDetails))
          // Cookie expiration must match the token expiration.
          // Router.push('/billing') // TODO: Redirect to a user selected initial page.
        }
      })
      .catch(error => {
        // log('error', error.message)
        // dispatch(userLoginError('login.errors.unexpected'))
      })
  }

  const sendHubDataByEmail = hubState => {
    const adminUser = hubState.share.users.find(user => user.hubManager === true)
    const benefit = selectARandomBenefit()
    const currentTime = new Date()

    const templateModel = {
      emailSubject: `${hubState.folio} | ${hubState.name}`,
      BoLHName: hubState.name,
      BoLHLink: `https://app.taskility.com/bill-of-lading-hub/${hubState._id}`,
      BoLHFolio: hubState.folio,
      benefitTitle: benefit?.title,
      benefitDescription: benefit?.description,
      benefitLinkUrl: benefit?.linkUrl,
      benefitLinkText: benefit?.linkText,
      createUserLink: 'https://app.taskility.com/signup',
      adminUserEmail: adminUser?.email,
      adminUserName: `${adminUser?.name} ${adminUser?.lastName}`,
      year: currentTime.getFullYear(),
      headText: 'headText_Value',
      linkText: 'linkText_Value',
      hubData: hubState.billOfLading2,
    }
    console.log('templateModel.hubData', templateModel.hubData)
    post('/api/bill-of-lading-hub/send-hub-data', { body: { templateModel: templateModel, hubState: hubState } })
      .then(({ error }) => {
        if (error) {
          // dispatch(userLoginError(error))
        } else {
          // dispatch(userLoginSuccess(userDetails))
          // Cookie expiration must match the token expiration.
          // Router.push('/billing') // TODO: Redirect to a user selected initial page.
        }
      })
      .catch(error => {
        // log('error', error.message)
        // dispatch(userLoginError('login.errors.unexpected'))
      })
  }

  const getCfdiFields = (BoLHState, BoLHSection = 'Main') => {
    Router.push({
      pathname: '/new-cfdi',
      query: {
        issuerId: BoLHState.companyId,
        receiverId: BoLHState.clientId,
        BoLHId: BoLHState._id,
        requestedFrom: 'BillOfLadingHub',
        BoLHSection: BoLHSection,
      },
    })
  }

  const createCfdiWithComplementBoLH2 = state => {
    let cfdi = {}
    if (state?.cfdiDrafts[0] && state?.billOfLading2) {
      cfdi = { ...state.cfdiDrafts[0], BoLHState: state }
      // eslint-disable-next-line no-console
      console.log('cfdi to send to API: ', cfdi)
    }
    setCreatingCfdi('signed')
    post('/api/billing/create-cfdi', { body: cfdi })
      .then(({ error, details }) => {
        if (!error) setFinishedCfdi('signed')
        // eslint-disable-next-line no-console
        console.log({ error, details: details?.message || 'unknown error in /api/billing/create-cfdi' })
        setApiError({ error, details: details?.message || 'unknown error in /api/billing/create-cfdi' })
      })
      .catch(setApiError)
      .finally(() => setCreatingCfdi(false))
  }
  // console.log(cfdi)
  const finishMessages = { draft: 'newCfdi.messages.cfdiDraftCreated', signed: 'newCfdi.messages.cfdiCreated' }

  const shouldTaskilityTakeAnAction = (section, hubCompletitionPercentage, taskilityBoLHObjective, status) => {
    switch (taskilityBoLHObjective) {
      case 'Stamp BoL': {
        if (hubCompletitionPercentage === 100) return true
        return false
      }
      case 'Send BoL Data': {
        if (section === 'prices') return false
        if (section === 'transports') return false
        if (section === 'customs') return false
        const sectionGeneralInfo = section === 'generalInfo'
        const sectionLocations = section === 'locations'
        const sectionGoods = section === 'goods'
        const isReady =
          (status?.generalInfoComplete || sectionGeneralInfo) &&
          (status?.locationsComplete || sectionLocations) &&
          (status?.goodsComplete || sectionGoods)
        console.log('shouldTaskilityTakeAnAction.SendHubData', isReady)
        return isReady
      }
      default:
        return false
    }
  }

  const taskilityHubAction = state => {
    const objective = state?.taskilityBoLHObjective
    if (objective === 'Stamp BoL') {
      // eslint-disable-next-line no-console
      console.log('taskility Hub Action Stamp BoL')
      createCfdiWithComplementBoLH2(state)
    }
    if (objective === 'Send BoL Data') {
      // eslint-disable-next-line no-console
      console.log('taskility Hub Action Send BoL Data')
      sendHubDataByEmail(state)
    }
  }

  // eslint-disable-next-line consistent-return
  const BoLHReducer = (state, action) => {
    // eslint-disable-next-line default-case
    switch (action.type) {
      case 'Initialize State':
        return { ...data }
      case 'Update Hub Name':
        saveChangeInDB(state._id, 'Update', { name: action.payload })
        return { ...state, name: action.payload }
      case 'General Info Complete': {
        saveChangeInDB(state._id, 'Update', { 'status.generalInfoComplete': true })
        // sendEmailUpdate('completed', i18n('newBillOfLadingHub.generalInfo.title'), state)
        // Validate the Hub information
        const { isValid, BoLHErrors } = validateBoLHub(state)
        setHubErrors(BoLHErrors)
        // Check State Status and Validation to proceed to Taskility's Hub Action
        const BoLHStatusPercentage = calculateHubsCompletitionPercentage('completed', state)
        if (
          shouldTaskilityTakeAnAction('generalInfo', BoLHStatusPercentage, state.taskilityBoLHObjective, state.status) &&
          isValid &&
          isReadyToAction
        ) {
          taskilityHubAction(state)
        }
        setIsReadyToAction(false)
        return { ...state, status: { ...state.status, generalInfoComplete: true } }
      }
      case 'General Info Edit': {
        saveChangeInDB(state._id, 'Update', { 'status.generalInfoComplete': false })
        // sendEmailUpdate('opened to edit', i18n('newBillOfLadingHub.generalInfo.title'), state)
        setIsReadyToAction(true)
        return { ...state, status: { ...state.status, generalInfoComplete: false } }
      }
      case 'Locations Complete': {
        saveChangeInDB(state._id, 'Update', { 'status.locationsComplete': true })
        // sendEmailUpdate('completed', i18n('newBillOfLadingHub.locations.title'), state)
        // Validate the Hub information
        const { isValid, BoLHErrors } = validateBoLHub(state)
        setHubErrors(BoLHErrors)
        // Check State Status and Validation to proceed to Taskility's Hub Action
        const BoLHStatusPercentage = calculateHubsCompletitionPercentage('completed', state)
        if (
          shouldTaskilityTakeAnAction('locations', BoLHStatusPercentage, state.taskilityBoLHObjective, state.status) &&
          isValid &&
          isReadyToAction
        ) {
          taskilityHubAction(state)
        }
        setIsReadyToAction(false)
        return { ...state, status: { ...state.status, locationsComplete: true } }
      }
      case 'Locations Edit': {
        saveChangeInDB(state._id, 'Update', { 'status.locationsComplete': false })
        // sendEmailUpdate('opened to edit', i18n('newBillOfLadingHub.locations.title'), state)
        setIsReadyToAction(true)
        return { ...state, status: { ...state.status, locationsComplete: false } }
      }
      case 'Goods Complete': {
        saveChangeInDB(state._id, 'Update', { 'status.goodsComplete': true })
        // sendEmailUpdate('completed', i18n('newBillOfLadingHub.goods.title'), state)
        // Validate the Hub information
        const { isValid, BoLHErrors } = validateBoLHub(state)
        setHubErrors(BoLHErrors)
        // Check State Status and Validation to proceed to Taskility's Hub Action
        const BoLHStatusPercentage = calculateHubsCompletitionPercentage('completed', state)
        if (
          shouldTaskilityTakeAnAction('goods', BoLHStatusPercentage, state.taskilityBoLHObjective, state.status) &&
          isValid &&
          isReadyToAction
        ) {
          taskilityHubAction(state)
        }
        setIsReadyToAction(false)
        return { ...state, status: { ...state.status, goodsComplete: true } }
      }
      case 'Goods Edit': {
        saveChangeInDB(state._id, 'Update', { 'status.goodsComplete': false })
        // sendEmailUpdate('opened to edit', i18n('newBillOfLadingHub.goods.title'), state)
        setIsReadyToAction(true)
        return { ...state, status: { ...state.status, goodsComplete: false } }
      }
      case 'Customs Complete': {
        saveChangeInDB(state._id, 'Update', { 'status.customsComplete': true })
        // sendEmailUpdate('completed', i18n('newBillOfLadingHub.customs.title'), state)
        // Validate the Hub information
        const { isValid, BoLHErrors } = validateBoLHub(state)
        setHubErrors(BoLHErrors)
        // Check State Status and Validation to proceed to Taskility's Hub Action
        const BoLHStatusPercentage = calculateHubsCompletitionPercentage('completed', state)
        if (
          shouldTaskilityTakeAnAction('customs', BoLHStatusPercentage, state.taskilityBoLHObjective, state.status) &&
          isValid &&
          isReadyToAction
        ) {
          taskilityHubAction(state)
        }
        setIsReadyToAction(false)
        return { ...state, status: { ...state.status, customsComplete: true } }
      }
      case 'Customs Edit': {
        saveChangeInDB(state._id, 'Update', { 'status.customsComplete': false })
        // sendEmailUpdate('opened to edit', i18n('newBillOfLadingHub.customs.title'), state
        setIsReadyToAction(true)
        return { ...state, status: { ...state.status, customsComplete: false } }
      }
      case 'Transports Complete': {
        saveChangeInDB(state._id, 'Update', { 'status.transportsComplete': true })
        // sendEmailUpdate('completed', i18n('newBillOfLadingHub.transport.title'), state)
        // Validate the Hub information
        const { isValid, BoLHErrors } = validateBoLHub(state)
        setHubErrors(BoLHErrors)
        // Check State Status and Validation to proceed to Taskility's Hub Action
        const BoLHStatusPercentage = calculateHubsCompletitionPercentage('completed', state)
        if (
          shouldTaskilityTakeAnAction('transports', BoLHStatusPercentage, state.taskilityBoLHObjective, state.status) &&
          isValid &&
          isReadyToAction
        ) {
          taskilityHubAction(state)
        }
        setIsReadyToAction(false)
        return { ...state, status: { ...state.status, transportsComplete: true } }
      }
      case 'Transports Edit': {
        saveChangeInDB(state._id, 'Update', { 'status.transportsComplete': false })
        // sendEmailUpdate('opened to edit', i18n('newBillOfLadingHub.transport.title'), state)
        setIsReadyToAction(true)
        return { ...state, status: { ...state.status, transportsComplete: false } }
      }
      case 'Prices Complete': {
        // console.log('priceCompleteStarts')
        saveChangeInDB(state._id, 'Update', { 'status.pricesComplete': true, 'status.isReadyToAction': false })
        // sendEmailUpdate('completed', i18n('newBillOfLadingHub.prices.title'), state)
        // Validate the Hub information
        const { isValid, BoLHErrors } = validateBoLHub(state)
        setHubErrors(BoLHErrors)
        // Check State Status and Validation to proceed to Taskility's Hub Action
        const BoLHStatusPercentage = calculateHubsCompletitionPercentage('completed', state)
        // console.log(BoLHStatusPercentage, isValid, isReadyToAction)
        if (
          shouldTaskilityTakeAnAction('prices', BoLHStatusPercentage, state.taskilityBoLHObjective, state.status) &&
          isValid &&
          isReadyToAction
        ) {
          taskilityHubAction(state)
        }
        setIsReadyToAction(false)
        // console.log('priceCompleteEnds', isReadyToAction)
        return { ...state, status: { ...state.status, pricesComplete: true, isReadyToAction: false } }
      }
      case 'Prices Edit': {
        saveChangeInDB(state._id, 'Update', { 'status.pricesComplete': false, 'status.isReadyToAction': true })
        // sendEmailUpdate('opened to edit', i18n('newBillOfLadingHub.prices.title'), state)
        setIsReadyToAction(true)
        // console.log(isReadyToAction)
        return { ...state, status: { ...state.status, pricesComplete: false, isReadyToAction: true } }
      }
      case 'Documents Complete':
        return { ...state, status: { ...state.status, documentsComplete: true } }
      case 'Documents Edit':
        return { ...state, status: { ...state.status, documentsComplete: false } }
      case 'Is International':
        // console.log(state)
        if (action.payload === 'Si') {
          saveChangeInDB(state._id, 'Update', { 'billOfLading2.internationalTransport': action.payload })
          return {
            ...state,
            billOfLading2: { ...state.billOfLading2, internationalTransport: action.payload },
          }
        }
        // eslint-disable-next-line no-param-reassign
        delete state.billOfLading2.inOutGoods
        // eslint-disable-next-line no-param-reassign
        delete state.billOfLading2.countryOfOrigin
        // eslint-disable-next-line no-param-reassign
        delete state.billOfLading2.wayInOut
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.internationalTransport': action.payload })
        saveChangeInDB(state._id, 'Delete', {
          'billOfLading2.inOutGoods': '',
          'billOfLading2.countryOfOrigin': '',
          'billOfLading2.wayInOut': '',
        })
        return {
          ...state,
          billOfLading2: {
            ...state.billOfLading2,
            internationalTransport: action.payload,
          },
        }
      case 'Import or Export':
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.inOutGoods': action.payload })
        return {
          ...state,
          billOfLading2: { ...state.billOfLading2, inOutGoods: action.payload },
        }
      case 'Country Origin or Destination':
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.countryOfOrigin': action.payload })
        return {
          ...state,
          billOfLading2: { ...state.billOfLading2, countryOfOrigin: action.payload },
        }
      case 'Via Entry or Exit':
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.wayInOut': action.payload })
        return {
          ...state,
          billOfLading2: { ...state.billOfLading2, wayInOut: action.payload },
        }
      case 'Add a Location':
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.locations': [...state.billOfLading2.locations, action.payload] })
        return {
          ...state,
          billOfLading2: {
            ...state.billOfLading2,
            locations: [...state.billOfLading2.locations, action.payload],
          },
        }
      case 'Update a Location':
        state.billOfLading2.locations.splice(action.payload.index, 1, action.payload.location)
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.locations': [...state.billOfLading2.locations] })
        return { ...state }
      case 'Edit Location':
        // console.log('edit location', state.billOfLading2.locations[action.payload.index])
        setLocationIndex(action.payload.index)
        setIsEditingLocation(true)
        setIsDisabledSearchPlaces(true)
        setIsLocationVisible(true)
        // console.log('isEditingLocation', isEditingLocation)
        // console.log('isDisabledSearchPlaces', isDisabledSearchPlaces)
        return {
          ...state,
        }
      case 'Delete Location':
        // console.log('index:', action.payload.index)
        // console.log('size', action.payload.size)
        // console.log('deleted element:', state.billOfLading2.locations[action.payload.index])
        if (action.payload.size === state.billOfLading2.locations.length) {
          const locationsUpdated = state.billOfLading2.locations
          // console.log('locationsUpdated before:', locationsUpdated)
          locationsUpdated.splice(action.payload.index, 1)
          // console.log('locationsUpdated after:', locationsUpdated)
          saveChangeInDB(state._id, 'Update', { 'billOfLading2.locations': locationsUpdated })
          return {
            ...state,
            billOfLading2: {
              ...state.billOfLading2,
              locations: locationsUpdated,
            },
          }
        }
        return {
          ...state,
        }
      case 'Add an Item': {
        const { good } = state.billOfLading2.goods
        // console.log('good in Add Item: ', good)
        // console.log('good.length in Add Item: ', good.length)
        const totalWeight =
          good.length !== 0
            ? good.map(item => (item.weightInKg !== undefined ? item.weightInKg : null)).reduce((a, b) => a + b) + action.payload.weightInKg
            : action.payload.weightInKg
        const arrayOfSatProductCodes = good.length !== 0 ? state.billOfLading2.goods.good.map(item => item.satProductCode) : []
        arrayOfSatProductCodes.push(action.payload.satProductCode)
        const numberOfUniqueSatProductCodes = [...new Set(arrayOfSatProductCodes)].length

        saveChangeInDB(state._id, 'Update', {
          'billOfLading2.goods.totalWeight': totalWeight,
          'billOfLading2.goods.totalGoods': numberOfUniqueSatProductCodes,
          'billOfLading2.goods.good': [...state.billOfLading2.goods.good, action.payload],
        })
        return {
          ...state,
          billOfLading2: {
            ...state.billOfLading2,
            goods: {
              ...state.billOfLading2.goods,
              totalWeight: totalWeight,
              totalGoods: numberOfUniqueSatProductCodes,
              good: [...state.billOfLading2.goods.good, action.payload],
            },
          },
        }
      }
      case 'Add Item from XML': {
        const { good } = state.billOfLading2.goods
        // console.log('good in Add Item: ', good)
        // console.log('good.length in Add Item: ', good.length)
        // const totalWeight =
        //   good.length !== 0
        //     ? good.map(item => (item.weightInKg !== undefined ? item.weightInKg : null)).reduce((a, b) => a + b) + action.payload.weightInKg
        //     : action.payload.weightInKg
        const arrayOfSatProductCodes = good.length !== 0 ? state.billOfLading2.goods.good.map(item => item.satProductCode) : []
        arrayOfSatProductCodes.push(action.payload.satProductCodeArray)
        const numberOfUniqueSatProductCodes = [...new Set(arrayOfSatProductCodes)].length
        saveChangeInDB(state._id, 'Update', {
          // 'billOfLading2.goods.totalWeight': totalWeight,
          'billOfLading2.goods.totalGoods': numberOfUniqueSatProductCodes,
          'billOfLading2.goods.good': [...state.billOfLading2.goods.good, ...action.payload.goodsArray],
        })
        return {
          ...state,
          billOfLading2: {
            ...state.billOfLading2,
            goods: {
              ...state.billOfLading2.goods,
              // totalWeight: totalWeight,
              totalGoods: numberOfUniqueSatProductCodes,
              good: [...state.billOfLading2.goods.good, ...action.payload.goodsArray],
            },
          },
        }
      }
      case 'Update an Item': {
        state.billOfLading2.goods.good.splice(action.payload.index, 1, action.payload.item)
        const { good } = state.billOfLading2.goods
        const totalWeight = good.map(item => item.weightInKg).reduce((a, b) => a + b)
        const arrayOfSatProductCodes = state.billOfLading2.goods.good.map(item => item.satProductCode)
        const numberOfUniqueSatProductCodes = [...new Set(arrayOfSatProductCodes)].length
        saveChangeInDB(state._id, 'Update', {
          'billOfLading2.goods.totalWeight': totalWeight,
          'billOfLading2.goods.totalGoods': numberOfUniqueSatProductCodes,
          'billOfLading2.goods.good': [...state.billOfLading2.goods.good],
        })
        return {
          ...state,
          billOfLading2: {
            ...state.billOfLading2,
            goods: {
              ...state.billOfLading2.goods,
              totalWeight: totalWeight,
              totalGoods: numberOfUniqueSatProductCodes,
            },
          },
        }
      }
      case 'Update Item Authorization': {
        const goodEdited = { ...state?.billOfLading2?.goods?.good[action.payload.itemIndex], authorizedUsers: action.payload.usersEmails }
        const goodArray = state?.billOfLading2?.goods?.good
        state?.billOfLading2?.goods?.good.splice(action.payload.itemIndex, 1, goodEdited)
        saveChangeInDB(state._id, 'Update', {
          'billOfLading2.goods.good': [...state.billOfLading2.goods.good],
        })
        return {
          ...state,
        }
      }
      case 'Update Transport Authorization': {
        const transportEdited = {
          ...state?.billOfLading2?.transports[action.payload.itemIndex],
          authorizedUsers: action.payload.usersEmails,
        }
        const transportsArray = state?.billOfLading2?.transports
        state?.billOfLading2?.transports.splice(action.payload.itemIndex, 1, transportEdited)
        saveChangeInDB(state._id, 'Update', {
          'billOfLading2.transports': [...state.billOfLading2.transports],
        })
        return {
          ...state,
        }
      }
      case 'Update Location Authorization': {
        const locationEdited = { ...state?.billOfLading2?.locations[action.payload.itemIndex], authorizedUsers: action.payload.usersEmails }
        const locationsArray = state?.billOfLading2?.locations
        state?.billOfLading2?.locations.splice(action.payload.itemIndex, 1, locationEdited)
        saveChangeInDB(state._id, 'Update', {
          'billOfLading2.locations': [...state.billOfLading2.locations],
        })
        return {
          ...state,
        }
      }
      case 'Edit Item': {
        // console.log('edit item', state.billOfLading2.goods.good[action.payload.index])
        setItemIndex(action.payload.index)
        setIsEditingItem(true)
        setIsItemVisible(true)
        // console.log('isEditingItem', isEditingItem)
        // console.log('isDisabledSearchPlaces', isDisabledSearchPlaces)

        return {
          ...state,
        }
      }
      case 'Delete Item': {
        // console.log('good', state.billOfLading2.goods.good)
        console.log('index:', action.payload.index)
        console.log('size', action.payload.size)
        console.log('deleted element:', state.billOfLading2.goods.good[action.payload.index])
        if (action.payload.size === state.billOfLading2.goods.good.length) {
          const goodsUpdated = state.billOfLading2.goods.good
          // console.log('locationsUpdated before:', locationsUpdated)
          goodsUpdated.splice(action.payload.index, 1)
          // console.log('goodsUpdated after:', goodsUpdated)
          // console.log('goodsUpdated length:', goodsUpdated.length)

          const totalWeight = goodsUpdated.length !== 0 ? goodsUpdated.map(item => item.weightInKg).reduce((a, b) => a + b) : 0
          const arrayOfSatProductCodes = goodsUpdated.length !== 0 ? goodsUpdated.map(item => item.satProductCode) : []
          const numberOfUniqueSatProductCodes = [...new Set(arrayOfSatProductCodes)].length
          // console.log('totalWeight in Delete Item:', totalWeight)
          // console.log('numberOfUniqueSatProductCodes in Delete Item:', numberOfUniqueSatProductCodes)

          saveChangeInDB(state._id, 'Update', {
            'billOfLading2.goods.totalWeight': totalWeight,
            'billOfLading2.goods.totalGoods': numberOfUniqueSatProductCodes,
            'billOfLading2.goods.good': goodsUpdated,
          })
          return {
            ...state,
            billOfLading2: {
              ...state.billOfLading2,
              goods: {
                ...state.billOfLading2.goods,
                totalWeight: totalWeight,
                totalGoods: numberOfUniqueSatProductCodes,
                good: goodsUpdated,
              },
            },
          }
        }
        return {
          ...state,
        }
      }
      case 'Add a Transport':
        // TODO: Trabajar para agregar a un array
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.transports': [...state.billOfLading2.transports, action.payload] })
        return {
          ...state,
          billOfLading2: {
            ...state.billOfLading2,
            transports: [...state.billOfLading2.transports, action.payload],
          },
        }
      case 'Edit a Transport': {
        // console.log('edit transport', state.billOfLading2.transports[action.payload.index])
        setTransportIndex(action.payload.index)
        setIsEditingTransport(true)
        setIsTransportVisible(true)
        // console.log('isEditingTransport', isEditingTransport)
        return {
          ...state,
        }
      }
      case 'Delete a Transport': {
        state.billOfLading2.transports.splice(action.payload.index, 1)
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.transports': [...state.billOfLading2.transports] })
        return { ...state }
      }
      case 'Update a Transport': {
        // TODO: Trabajar para agregar index a un array
        state.billOfLading2.transports.splice(action.payload.index, 1, action.payload.transport)
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.transports': [...state.billOfLading2.transports] })
        return { ...state }
      }
      // Share actions
      case 'Add a Tag':
        // TODO: Trabajar para agregar a un array
        saveChangeInDB(state._id, 'Update', { tags: [...state.tags, action.payload] })
        return {
          ...state,
          tags: [...state.tags, action.payload],
        }
      case 'Edit a Tag': {
        // console.log('edit transport', state.billOfLading2.transports[action.payload.index])
        setTagIndex(action.payload.index)
        setIsEditingTag(true)
        setIsTagVisible(true)
        // console.log('isEditingTransport', isEditingTransport)
        return {
          ...state,
        }
      }
      case 'Delete a Tag': {
        state.tags.splice(action.payload, 1)
        saveChangeInDB(state._id, 'Update', { tags: [...state.tags] })
        setIsDeletingTag(false)
        return { ...state }
      }
      case 'Update a Tag':
        // TODO: Trabajar para agregar index a un array
        state.tags.splice(action.payload.index, 1, action.payload.tag)
        saveChangeInDB(state._id, 'Update', { tags: [...state.tags] })
        return { ...state }
      // Share actions
      case 'Change Type of Access':
        // console.log('Change Type of Access', action.payload)
        saveChangeInDB(state._id, 'Update', { 'share.typeOfAccess': action.payload })
        return {
          ...state,
          share: {
            ...state.share,
            typeOfAccess: action.payload,
          },
        }
      case 'Email Update': {
        const initials = typeof action.payload === 'string' ? action.payload.substring(0, 2).toUpperCase() : ''
        return {
          ...state,
          share: {
            ...state.share,
            userToSendInvitation: {
              ...state.share.userToSendInvitation,
              userId: '',
              name: '',
              lastName: '',
              initials: initials || '',
              notify: true,
              preferedLanguage: 'es',
              writePermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports'],
              viewPermissions: ['share', 'generalInfo', 'locations', 'goods', 'transports'],
              email: action.payload,
              mobile: '',
              companyId: '',
              companyName: '',
              telegramAutenticationToken: '',
              telegramChatId: '',
              hubManager: false,
            },
          },
        }
      }
      case 'Update Prefered Language UserToSendInvitation': {
        return {
          ...state,
          share: {
            ...state.share,
            userToSendInvitation: {
              ...state.share.userToSendInvitation,
              preferedLanguage: action.payload,
            },
          },
        }
      }
      case 'Send Invitation': {
        sendEmailInvitation(state.share.userToSendInvitation, state)
        // console.log('state en sendEmalInvitaiton', state)
        const newUser = state.share.userToSendInvitation
        // console.log('emailInputRef value: ', emailInputRef.current)
        saveChangeInDB(state._id, 'Update', { 'share.users': [...state.share.users, newUser] })
        emailInputRef.current.value = ''
        emailInputRef.current.input.value = ''
        emailInputRef.current.state.value = ''
        return { ...state, share: { ...state.share, userToSendInvitation: {}, users: [...state.share.users, newUser] } }
      }
      case 'Update Notify User': {
        const usersUpdated = state.share.users
        // const userToUpdate = state.share.users[action.payload.index]
        // userToUpdate.notify = action.payload.value
        // usersUpdated.splice(action.payload.index, 1, userToUpdate)
        usersUpdated[action.payload.index].notify = action.payload.value
        saveChangeInDB(state._id, 'Update', { 'share.users': usersUpdated })
        return { ...state, share: { ...state.share, users: usersUpdated } }
      }
      case 'Update Write Permissions User': {
        const usersUpdated = state.share.users
        // const userToUpdate = state.share.users[action.payload.index]
        // userToUpdate.notify = action.payload.value
        // usersUpdated.splice(action.payload.index, 1, userToUpdate)
        usersUpdated[action.payload.index].writePermissions = action.payload.value
        saveChangeInDB(state._id, 'Update', { 'share.users': usersUpdated })
        return { ...state, share: { ...state.share, users: usersUpdated } }
      }
      case 'Update View Permissions User': {
        const usersUpdated = state.share.users
        // const userToUpdate = state.share.users[action.payload.index]
        // userToUpdate.notify = action.payload.value
        // usersUpdated.splice(action.payload.index, 1, userToUpdate)
        usersUpdated[action.payload.index].viewPermissions = action.payload.value
        saveChangeInDB(state._id, 'Update', { 'share.users': usersUpdated })
        return { ...state, share: { ...state.share, users: usersUpdated } }
      }
      case 'Delete User': {
        const usersUpdated = state.share.users
        usersUpdated.splice(action.payload, 1)
        saveChangeInDB(state._id, 'Update', { 'share.users': usersUpdated })
        return { ...state, share: { ...state.share, users: usersUpdated } }
      }
      case 'Update Prefered Language User': {
        const usersUpdated = state.share.users
        usersUpdated[action.payload.index].preferedLanguage = action.payload.value
        saveChangeInDB(state._id, 'Update', { 'share.users': usersUpdated })
        return { ...state, share: { ...state.share, users: usersUpdated } }
      }
      case 'Stamp': {
        const testBillingState = {
          currency: 'MXN',
          exchangeRate: 1,
          subTotal: 1.0, // Not in 'T'
          total: 1.12,
          paymentForm: '99', // Not in 'T'
          paymentMethod: 'PPD', // Not in 'T'
          cfdiType: 'I',
          expeditionPlace: '78000',
          issuer: {
            rfc: 'ALO110913N98',
            fiscalRegime: '601',
            name: 'A1A Logistics S de RL de CV',
          },
          receiver: {
            rfc: 'SME751021B90',
            cfdiUse: 'G03',
            name: 'FREUDENBERG-NOK SEALING TECHNOLOGIES DE MEXICO SA DE CV',
            foreignFiscalID: '',
            countryOfResidence: '',
          },
          items: [
            {
              satProductCode: '78101802',
              // "NoIdentificacion": "01",
              quantity: 1,
              satUnitCode: 'E48',
              satUnitCodeDescription: 'SERVICIO',
              description: 'Flete',
              unitPrice: 1.0,
              subtotal: 1.0,
              total: 1.12,
              haveTax: true,
              haveRetention: true,
            },
          ],
        }
        const jsonToStamp = generateCartaPorte2ToStamp(state, testBillingState, action.payload.transports[action.payload.index])
        // eslint-disable-next-line no-console
        console.log('jsonToStamp', jsonToStamp)
        return { ...state }
      }
      case 'Change Hub Objective': {
        saveChangeInDB(state._id, 'Update', { taskilityBoLHObjective: action.payload })
        return { ...state, taskilityBoLHObjective: action.payload }
      }
      case 'Add Documents': {
        // TODO: Trabajar para agregar index a un array
        // eslint-disable-next-line dot-notation
        const transport = state?.billOfLading2?.transports[action.payload.index]
        const allDocuments = transport.documents ? [...transport.documents, ...action.payload.documents] : [...action.payload.documents]
        // eslint-disable-next-line dot-notation
        // const documentsWithNoDuplicates = [... new Set(allDocuments.map(document => document.fileId))]
        const documentsWithNoDuplicates = []

        const unique = allDocuments.filter(document => {
          const isDuplicate = documentsWithNoDuplicates.includes(document.fileId)

          if (!isDuplicate) {
            documentsWithNoDuplicates.push(document.fileId)
            return true
          }
          return false
        })

        const editedTransport = { ...transport, documents: [...unique] }
        state?.billOfLading2?.transports?.splice(action.payload.index, 1, editedTransport)
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.transports': [...state.billOfLading2.transports] })
        return { ...state }
      }
      case 'Add Costs': {
        const formerCosts = state?.billOfLading2?.costs ? state?.billOfLading2?.costs : []
        // console.log(action.payload.cost)
        const newCosts = [...formerCosts, { ...action.payload.cost, transportIndex: action.payload.index }]
        saveChangeInDB(state._id, 'Update', { 'billOfLading2.costs': newCosts })
        return { ...state, billOfLading2: { ...state?.billOfLading2, costs: newCosts } }
      }
      case 'Add Goods Object Extracted From XML': {
        if (state?.billOfLading2?.goods?.good === undefined) return { ...state }
        const totalWeight = action.payload.totalWeight + (state?.billOfLading2?.goods?.totalWeight || 0)
        const totalGoods = action.payload.totalGoods + (state?.billOfLading2?.goods?.totalGoods || 0)
        saveChangeInDB(state._id, 'Update', {
          'billOfLading2.goods.totalWeight': totalWeight,
          'billOfLading2.goods.totalGoods': action.payload.weightUnit,
          // eslint-disable-next-line no-unsafe-optional-chaining
          'billOfLading2.goods.good': [
            // eslint-disable-next-line no-unsafe-optional-chaining
            ...(state?.billOfLading2?.goods?.good !== undefined ? state?.billOfLading2?.goods?.good : []),
            ...action.payload.good,
          ],
        })
        return {
          ...state,
          billOfLading2: {
            ...state?.billOfLading2,
            goods: {
              totalWeight: totalWeight,
              weightUnit: action.payload.weightUnit,
              totalGoods: totalGoods,
              // eslint-disable-next-line no-unsafe-optional-chaining
              good: [...state?.billOfLading2?.goods?.good, ...action.payload.good],
            },
          },
        }
      }
      case 'Algo Raro':
        // console.log('algo raro', action.payload)
        return { ...state }
      default:
        return state
    }
  }

  const [BoLHState, dispatch] = useReducer(BoLHReducer, BoLHInitialState)

  const getTotalPrice = cfdiDrafts => {
    let subtotal = 0
    if (cfdiDrafts)
      cfdiDrafts.map(cfdiDraft => {
        cfdiDraft?.items.map(item => {
          if (typeof item.subtotal === 'undefined') return null
          subtotal += item.subtotal
          return null
        })
        return null
      })
    return subtotal
  }

  const getTotalCost = costs => {
    let subtotal = 0
    if (costs)
      costs?.map(cost => {
        if (typeof cost.subtotal === 'undefined') return null
        subtotal += Number(cost?.subtotal)
        return null
      })
    return subtotal
  }

  const getTotalMargin = (totalPrice, totalCost, decimals) => {
    if (totalPrice === 0) return 1
    const margin = (totalPrice - totalCost) / totalPrice
    return parseFloat(margin.toFixed(decimals))
  }

  const getTotalMarginText = (totalPrice, totalCost, monetaryDecimals, percentageDecimals, currency = '') => {
    const totalMargin = getTotalMargin(totalPrice, totalCost, percentageDecimals) * 100
    const monetaryProfit = totalPrice - totalCost
    return `${currency} ${numberFormat(monetaryProfit, monetaryDecimals)} (${totalMargin.toFixed(monetaryDecimals)}%)`
  }

  useEffect(() => {
    dispatch({ type: 'Initialize State', payload: null })
  }, [data])
  // console.log('BoLHState', BoLHState)

  const onSubmitTeam = teamData => {
    // console.log(data)
  }
  const onSubmitGeneral = generalData => {
    // console.log(data)
  }
  const onSubmitRoute = routeData => {
    setIsRouteComplete(true)
  }
  const onSubmitLoad = loadData => {
    // console.log(data)
  }
  const onSubmitPrices = pricesData => {
    // console.log(data)
  }
  const onSubmitCustoms = customsData => {
    // console.log(data)
  }
  const onSubmitDocuments = documentsData => {
    // console.log(data)
  }
  const onCloseShare = () => {
    setIsShareVisible(false)
  }
  const onClickShare = () => {
    setIsShareVisible(true)
  }

  const onCloseTag = () => {
    setIsTagVisible(false)
  }
  const onClickTag = () => {
    setIsTagVisible(true)
  }

  const onCloseSettings = () => {
    setIsSettingsVisible(false)
  }
  const onClickSettings = () => {
    setIsSettingsVisible(true)
  }

  const updateName = value => {
    // console.log('value', value)
    dispatch({ type: 'Update Hub Name', payload: value })
  }

  const getWritingPermissions = cardName => {
    if (BoLHState?.share?.users) {
      const currentUser = BoLHState?.share?.users.filter(user => {
        return user.email === loggedEmail
      })
      if (currentUser[0]) return currentUser[0].writePermissions.includes(cardName)
      return false
    }
    return false
  }

  const getViewPermissions = cardName => {
    if (BoLHState?.share?.users) {
      const currentUser = BoLHState?.share?.users.filter(user => {
        return user.email === loggedEmail
      })
      if (currentUser[0]) return currentUser[0].viewPermissions.includes(cardName)
      return false
    }
    return false
  }

  const createTransportsCards = BoLHState
    ? BoLHState.billOfLading2?.transports?.map((transport, index) => {
        // console.log('transport', transport)
        // console.log('index', index)
        // console.log('transport.transportType', transport.transportType)

        if (transport.transportType === '01')
          return (
            <LandTransport
              // eslint-disable-next-line react/no-array-index-key
              key={`${index}-${transport.company._id}`}
              transports={BoLHState.billOfLading2.transports}
              index={index}
              parentDispatch={dispatch}
              isEditing={isEditingTransport}
              disabled={getWritingPermissions('transports') && !BoLHState?.status?.transportsComplete}
              usersList={filterUsersByViewPermission(BoLHState?.share?.users, 'transports')}
              loggedEmail={loggedEmail}
              sharePermission={getViewPermissions('share')}
              companyProfile={companyProfile}
            />
          )
        return null
      })
    : []
  const pendingActions = `${BoLHState?.status?.generalInfoComplete ? '' : i18n('newBillOfLadingHub.pendingActions.generalInfoIncomplete')}\n
  ${BoLHState?.status?.locationsComplete ? '' : i18n('newBillOfLadingHub.pendingActions.locationsIncomplete')}\n
  ${BoLHState?.status?.goodsComplete ? '' : i18n('newBillOfLadingHub.pendingActions.goodsIncomplete')}\n
  ${BoLHState?.status?.transportsComplete ? '' : i18n('newBillOfLadingHub.pendingActions.transportsIncomplete')}`

  const isBoLHComplete =
    BoLHState?.status?.generalInfoComplete &&
    BoLHState?.status?.locationsComplete &&
    BoLHState?.status?.goodsComplete &&
    BoLHState?.status?.transportsComplete

  const extractGoodFromXmlFromInvoice = async fileHandle => {
    const fileData = await fileHandle.getFile()
    const text = await fileData.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, 'text/xml')
    // console.log('text', text)

    // Get company information (issuer)
    const issuerDOM = xmlDoc.getElementsByTagName('cfdi:Emisor')
    const issuer = {
      rfc: issuerDOM[0].getAttribute('Rfc'),
      name: issuerDOM[0].getAttribute('Nombre'),
    }
    const currency = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0].getAttribute('Moneda')
    const conceptos = xmlDoc.getElementsByTagName('cfdi:Concepto')
    const mercancias = xmlDoc.getElementsByTagName('cce11:Mercancia')
    // console.log('conceptos', conceptos)
    // console.log('mercancias', mercancias)

    // Get goods attributes
    let conceptosIndex = 0
    const newGoodsArray = []
    const satProductCodeArray = []
    for (conceptosIndex = 0; conceptosIndex < conceptos.length; conceptosIndex += 1) {
      const newGood = {
        company: issuer,
        currency: currency,
      }
      if (conceptos[conceptosIndex].getAttribute('ClaveProdServ')) {
        newGood.satProductCode = conceptos[conceptosIndex].getAttribute('ClaveProdServ')
        satProductCodeArray.push(conceptos[conceptosIndex].getAttribute('ClaveProdServ'))
      }
      if (conceptos[conceptosIndex].getAttribute('NoIdentificacion'))
        newGood.productIdNumber = conceptos[conceptosIndex].getAttribute('NoIdentificacion')
      if (conceptos[conceptosIndex].getAttribute('Unidad'))
        newGood.satUnitKey = conceptos[conceptosIndex].getAttribute('Unidad').substring(0, 3)
      if (conceptos[conceptosIndex].getAttribute('Descripcion')) newGood.description = conceptos[conceptosIndex].getAttribute('Descripcion')
      if (conceptos[conceptosIndex].getAttribute('Cantidad')) newGood.quantity = conceptos[conceptosIndex].getAttribute('Cantidad')
      if (conceptos[conceptosIndex].getAttribute('Importe')) newGood.value = conceptos[conceptosIndex].getAttribute('Importe')

      // Get FraccionArancelaria
      if (mercancias) {
        const noIdentificacion = conceptos[conceptosIndex].getAttribute('NoIdentificacion')
        const selector = `[NoIdentificacion="${noIdentificacion}"]`
        const selectorResult = xmlDoc.querySelectorAll(selector)
        newGood.tariffCode = selectorResult[1].getAttribute('FraccionArancelaria')
      }

      // Add it to Array
      newGoodsArray.push(newGood)
    }

    // Add it to BoLHStatus and DB
    dispatch({ type: 'Add Item from XML', payload: { satProductCodeArray: satProductCodeArray, goodsArray: newGoodsArray } })
    // console.log('newGoodsArray', newGoodsArray)

    const good = {
      _id: '61ce63e3c0a011153633d8a6',
      company: {
        // OK
        _id: 'Xy9B4Tcdk9eviyPxq',
        name: 'REHAU SA DE CV', // OK
        rfc: 'REH930611FA8', // OK
      },
      companyId: 'Xy9B4Tcdk9eviyPxq',
      currency: 'USD', // OK
      dangerousMaterial: 'Sí',
      dangerousMaterialCode: '77382883928',
      description: 'Sellos de Goma Nuevos', // OK
      dimensions: {
        depth: 22,
        height: 23,
        unitMeasure: 'cm',
        width: 123,
      },
      packagingCode: '4G',
      packagingDescription: 'Cajas de Cartón',
      pedimento: '20039302930',
      productCode: 'PN 7777 New',
      quantity: 2,
      satProductCode: '88473849', // OK
      satUnitKey: 'E48', // OK
      tariffCode: '7738273',
      value: 0, // OK
      weightInKg: 370,
    }
    return newGoodsArray
  }

  const loadXMLFileToParse = async () => {
    const fileHandleArray = await window.showOpenFilePicker({
      types: [{ description: 'XML File', accept: { 'application/xml': ['.xml'] } }],
      multiple: true,
    })
    const newGoods = []
    let countGoods = 0
    await fileHandleArray.map(fileHandle => {
      extractGoodFromXmlFromInvoice(fileHandle).then(goodArray => {
        goodArray.map(item => {
          newGoods.push(item)
          countGoods += 1
          return null
        })
      })
      return null
      // console.log('goodArray', newGoods)
    })
    message.success(`${i18n('newBillOfLadingHub.goods.itemsAddedSuccessfullyFromXML')}`)
  }

  const loadXMLFileToParse2 = async () => {
    const fileHandleArray = await window.showOpenFilePicker({
      types: [{ description: 'XML File', accept: { 'application/xml': ['.xml'] } }],
      multiple: true,
    })
    const newGoods = []
    let countGoods = 0
    await fileHandleArray.map(fileHandle => {
      extractGoodsFromXml(fileHandle).then(goodArray => {
        goodArray.map(item => {
          newGoods.push(item)
          countGoods += 1
          return null
        })
      })
      return null
      // console.log('goodArray', newGoods)
    })
    message.success(`${i18n('newBillOfLadingHub.goods.itemsAddedSuccessfullyFromXML')}`)
  }

  const handleCloseTag = removedTag => {
    console.log(removedTag)
    const index = BoLHState?.tags?.findIndex(tag => {
      return tag?.type === removedTag?.type && tag?.value === removedTag?.value
    })
    console.log('index', index)
    dispatch({ type: 'Delete a Tag', payload: index })
    setIsDeletingTag(true)
  }

  const listOfTags = BoLHState?.tags?.map(tag => {
    // console.log('tag', tag)
    let color = ''
    switch (tag.type) {
      case 'Shipment':
        color = 'geekblue'
        break
      case 'shipment':
        color = 'geekblue'
        break
      case 'purchaseOrder':
        color = 'blue'
        break
      case 'customerReference':
        color = 'cyan'
        break
      case 'category':
        color = 'green'
        break
      case 'keyword':
        color = 'gold'
        break
      case 'other':
        color = 'volcano'
        break
      default:
        color = 'magenta'
        break
    }
    return (
      <Tag color={color} closable onClose={() => handleCloseTag(tag)} key={tag.value}>
        {`${i18n(`newBillOfLadingHub.tags.${tag.type}`)} | ${tag.value}`}
      </Tag>
    )
  })

  const getCfdiDraftByBoLHSection = sectionName => {
    const cfdiDraft = BoLHState?.cfdiDrafts?.find(({ BoLHSection }) => BoLHSection === sectionName)
    // console.log('getCfdiDraftByBoLHSection', cfdiDraft, sectionName)
    return cfdiDraft
  }

  const getItemsFromCfdiDraft = cfdiDraft => {
    const items = cfdiDraft?.items?.map(item => {
      const iva = item?.taxes?.find(({ isRetention }) => isRetention === false)
      const ivaRet = item?.taxes?.find(({ isRetention }) => isRetention === true)
      const row = {
        key: `${item?.productCode} ${item?.total}`,
        productCode: item?.productCode,
        productDescription: item?.notes,
        quantity: numberFormat(item?.quantity),
        unit: item?.unit,
        currency: cfdiDraft?.currency ? cfdiDraft?.currency : '',
        unitValue: numberFormat(item.unitValue),
        subtotal: numberFormat(item.subtotal),
        taxIva: numberFormat(iva?.value) || 0,
        taxIvaRet: numberFormat(ivaRet?.value) || 0,
        total: numberFormat(item.total),
      }
      return row
    })
    // console.log('getItemsFromCfdiDraft', items)
    return items
  }

  const priceItemsColumns = [
    {
      title: i18n('newBillOfLadingHub.prices.product'),
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: i18n('newBillOfLadingHub.prices.productDescription'),
      dataIndex: 'productDescription',
      key: 'productDescription',
      responsive: ['sm'],
    },
    {
      title: i18n('newBillOfLadingHub.prices.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: i18n('newBillOfLadingHub.prices.unitCode'),
      dataIndex: 'unit',
      key: 'unit',
      responsive: ['sm'],
    },
    {
      title: i18n('newBillOfLadingHub.prices.currency'),
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: i18n('newBillOfLadingHub.prices.subtotal'),
      dataIndex: 'subtotal',
      key: 'subtotal',
      responsive: ['sm'],
    },
    {
      title: i18n('newBillOfLadingHub.prices.tax'),
      dataIndex: 'taxIva',
      key: 'taxIva',
      responsive: ['sm'],
    },
    {
      title: i18n('newBillOfLadingHub.prices.taxRetention'),
      dataIndex: 'taxIvaRet',
      key: 'taxIvaRet',
      responsive: ['sm'],
    },
    {
      title: i18n('newBillOfLadingHub.prices.total'),
      dataIndex: 'total',
      key: 'total',
    },
  ]

  const costsData = costs => {
    const costsRows = costs.map(cost => {
      const row = {
        key: `${cost?.folio}-${cost?.total}`,
        companyName: cost?.company?.name,
        folio: cost?.folio,
        currency: cost?.currency ? cost?.currency : '',
        subtotal: numberFormat(cost?.subtotal),
        tax: numberFormat(cost?.tax) || 0,
        taxRet: numberFormat(cost?.taxRetention) || 0,
        total: numberFormat(cost?.total),
      }
      return row
    })
    return costsRows
  }
  const costItemsColumns = [
    {
      title: i18n('newBillOfLadingHub.costs.company'),
      dataIndex: 'companyName',
      key: 'company.name',
    },
    {
      title: i18n('newBillOfLadingHub.costs.folio'),
      dataIndex: 'folio',
      key: 'folio',
    },
    {
      title: i18n('newBillOfLadingHub.costs.currency'),
      dataIndex: 'currency',
      key: 'currency',
    },
    {
      title: i18n('newBillOfLadingHub.costs.subtotal'),
      dataIndex: 'subtotal',
      key: 'subtotal',
      responsive: ['sm'],
    },
    {
      title: i18n('newBillOfLadingHub.costs.tax'),
      dataIndex: 'tax',
      key: 'tax',
      responsive: ['sm'],
    },
    {
      title: i18n('newBillOfLadingHub.costs.taxRetention'),
      dataIndex: 'taxRet',
      key: 'taxRet',
      responsive: ['sm'],
    },
    {
      title: i18n('newBillOfLadingHub.costs.total'),
      dataIndex: 'total',
      key: 'total',
    },
  ]

  const costsTotals = pageData => {
    let totalSubtotal = ''
    let totalTax = ''
    let totalTaxRetention = ''
    let totalTotal = ''
    pageData.forEach(({ subtotal, tax, taxRet, total }) => {
      totalSubtotal += subtotal
      totalTax += tax
      totalTaxRetention += taxRet
      totalTotal += total
    })
    return (
      <Table.Summary.Row>
        <Table.Summary.Cell index={0}>{i18n('newBillOfLadingHub.costs.total')}</Table.Summary.Cell>
        <Table.Summary.Cell index={1} />
        <Table.Summary.Cell index={2} />
        <Table.Summary.Cell index={3} responsive={['sm']}>
          <Text>{numberFormat(totalSubtotal)}</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={4} responsive={['sm']}>
          <Text>{numberFormat(totalTax)}</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={5} responsive={['sm']}>
          <Text>{numberFormat(totalTaxRetention)}</Text>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={6}>
          <Text>{numberFormat(totalTotal)}</Text>
        </Table.Summary.Cell>
      </Table.Summary.Row>
    )
  }

  const isBoLCompleteToStamp = () => {
    if (BoLHState?.status) {
      if (
        BoLHState?.status?.generalInfoComplete &&
        BoLHState?.status?.locationsComplete &&
        BoLHState?.status?.goodsComplete &&
        BoLHState?.status?.transportsComplete &&
        BoLHState?.status?.pricesComplete
      ) {
        return true
      }
      return false
    }
    return false
  }

  // console.log('BoLH authorizedUsers Goods', BoLHState?.share?.users?.filter(user => user?.viewPermissions?.includes('goods')))

  // useEffectExceptOnMount(() => {
  //   // console.log('useEffectStarted, isReadyToAction: ', isReadyToAction)
  //   const { validation, errors } = validateHub()
  //   const isComplete = isBoLCompleteToStamp()
  //   // console.log('validation', validation, 'isComplete', isComplete)
  //   if (validation && isComplete) {
  //     setIsReadyToAction(true)
  //   } else {
  //     setIsReadyToAction(false)
  //   }
  //   setHubErrors(errors)
  //   // console.log('useEffectFinished, isReadyToAction: ', isReadyToAction)
  // }, [BoLHState.status])

  return (
    <Layout className="min-h-screen" hasSider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header className="bg-white ">
          {BoLHState?.companyName !== undefined ? <Text ellipsis>{BoLHState?.companyName}</Text> : null}
          <Space className="float-right  ">
            {getViewPermissions('share') ? <Button onClick={onClickShare}>{i18n(`newBillOfLadingHub.team.share`)}</Button> : null}
            {/* <Button onClick={onClickSettings}><SettingOutlined /></Button> */}
          </Space>
        </Header>
        <Layout className="site-layout p-4" style={{ minHeight: '100vh', overflow: 'scroll' }}>
          <div className="">
            <Card className="border-l-8 border-t-0 border-b-0 border-r-0 border-tkyBlue">
              <div className="mt-2">
                <a href="/bill-of-lading">{i18n('newBillOfLadingHub.billOfLandingHubs')}</a> {'>'} {BoLHState?.folio}
              </div>
              <Paragraph
                className="my-2 text-tkyBlue italic text-3xl"
                editable={{
                  icon: <EditOutlined />,
                  tooltip: i18n(`buttons.clickToEdit`),
                  onChange: updateName,
                  enterIcon: <CheckOutlined />,
                }}
              >
                {BoLHState?.name}
              </Paragraph>
              <Space wrap className="w-full mt-2">
                {listOfTags}
                <Button
                  type=""
                  className="float-right text-xs"
                  onClick={() => {
                    setIsTagVisible(true)
                    setIsEditingTag(false)
                    setTagIndex(undefined)
                  }}
                  size="small"
                >
                  <PlusOutlined /> {i18n('buttons.addTag')}
                </Button>
              </Space>
            </Card>
            <Card className="mt-2">
              <Collapse ghost className="mt-2">
                <Panel header={i18n(`newBillOfLadingHub.hubOptions`)} key="1">
                  <Title level={5} className="mt-2">
                    {i18n(`newBillOfLadingHub.hubObjective`)}
                  </Title>
                  <div className="mb-4">{i18n(`newBillOfLadingHub.hubObjectiveDescription`)}</div>
                  <Radio.Group
                    onChange={e => dispatch({ type: 'Change Hub Objective', payload: e.target.value })}
                    value={BoLHState.taskilityBoLHObjective}
                    className="mt-2"
                    disabled={companyProfile ? companyProfile.disableTaskilityBoLHObjective : false}
                  >
                    <Space size={[60, 32]} wrap>
                      <Radio value="Stamp BoL">
                        <Space direction="vertical" size={2}>
                          <span>
                            <strong className="">{i18n(`newBillOfLadingHub.stampBoL`)}</strong>
                          </span>
                          <span className="">{i18n(`newBillOfLadingHub.stampBoLDescription`)}</span>
                        </Space>
                      </Radio>
                      <Radio value="Send BoL Data">
                        <Space direction="vertical" size={2}>
                          <span>
                            <strong className="">{i18n(`newBillOfLadingHub.sendBoLInfo`)}</strong>
                          </span>
                          <span className="">{i18n(`newBillOfLadingHub.sendBoLInfoDescription`)}</span>
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Panel>
              </Collapse>
            </Card>

            {isBoLHComplete ? (
              <Alert
                className="mt-2"
                message={i18n('newBillOfLadingHub.pendingActions.successTitle')}
                description={i18n('newBillOfLadingHub.pendingActions.successDescription')}
                type="success"
                showIcon
              />
            ) : (
              <Alert
                className="mt-2"
                message={i18n('newBillOfLadingHub.pendingActions.title')}
                description={pendingActions}
                type="info"
                showIcon
              />
            )}
          </div>
          <Drawer
            width="80%"
            onClose={onCloseShare}
            visible={isShareVisible}
            bodyStyle={{ paddingBottom: 80 }}
            // eslint-disable-next-line prettier/prettier
            // extra={
            //   <Space>
            //     <Button onClick={() => setIsLocationVisible(false)}>Cancel</Button>
            //     {/* <Button onClick={() => setIsLocationVisible(false)} type="primary">
            //       {i18n('buttons.submit')}
            //     </Button> */}
            //   </Space>
            //   // eslint-disable-next-line prettier/prettier
            // }
            key={1}
            destroyOnClose
          >
            <ShareWithTeam
              initialState={BoLHState?.share}
              BoLHFolio={BoLHState?.folio}
              BoLHName={BoLHState?.name}
              BoLHId={BoLHState?._id}
              parentDispatch={dispatch}
              emailInputRef={emailInputRef}
              disabled={!getWritingPermissions('share')}
            />
          </Drawer>
          <Drawer
            width="80%"
            onClose={onCloseTag}
            visible={isTagVisible}
            bodyStyle={{ paddingBottom: 80 }}
            // eslint-disable-next-line prettier/prettier
            // extra={
            //   <Space>
            //     <Button onClick={() => setIsLocationVisible(false)}>Cancel</Button>
            //     {/* <Button onClick={() => setIsLocationVisible(false)} type="primary">
            //       {i18n('buttons.submit')}
            //     </Button> */}
            //   </Space>
            //   // eslint-disable-next-line prettier/prettier
            // }
            key="TagDrawer"
            destroyOnClose
          >
            <NewTag
              dispatch={dispatch}
              setIsTagVisible={setIsTagVisible}
              tags={BoLHState?.billOfLading2?.tags}
              index={tagIndex}
              isEditingTransport={isEditingTag}
            />
          </Drawer>
          <Drawer
            width="80%"
            onClose={onCloseSettings}
            visible={isSettingsVisible}
            bodyStyle={{ paddingBottom: 80 }}
            // eslint-disable-next-line prettier/prettier
            // extra={
            //   <Space>
            //     <Button onClick={() => setIsLocationVisible(false)}>Cancel</Button>
            //     {/* <Button onClick={() => setIsLocationVisible(false)} type="primary">
            //       {i18n('buttons.submit')}
            //     </Button> */}
            //   </Space>
            //   // eslint-disable-next-line prettier/prettier
            // }
            key="drawerSettings"
            destroyOnClose
          >
            {/* <BoLSettings
              initialState={BoLHState.share}
              BoLHFolio={BoLHState.folio}
              BoLHName={BoLHState.name}
              BoLHId={BoLHState._id}
              parentDispatch={dispatch}
              emailInputRef={emailInputRef}
            /> */}
          </Drawer>

          {/* Prices */}
          {getViewPermissions('prices') ? (
            <div>
              <Card className="w-full mt-20 border-l-8 border-t-0 border-b-0 border-r-0 border-tkyBlue">
                <Form layout="vertical">
                  <Title level={3}>{i18n(`newBillOfLadingHub.prices.title`)}</Title>
                  <div className="mt-4">{i18n('newBillOfLadingHub.prices.description')}</div>
                  {getWritingPermissions('prices') ? (
                    <Space className="mt-4 md:float-right md:-mt-16" wrap>
                      {BoLHState?.status?.pricesComplete ? null : (
                        <Button type="" className="float-right" onClick={() => getCfdiFields(BoLHState)}>
                          {i18n('newBillOfLadingHub.prices.addItem')}
                        </Button>
                      )}
                      {BoLHState?.status?.pricesComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Prices Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Prices Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </Space>
                  ) : null}

                  {/* <Divider plain />
                  <Table
                    pagination={false}
                    dataSource={getItemsFromCfdiDraft(getCfdiDraftByBoLHSection('Main'))}
                    columns={priceItemsColumns}
                  />
                  <Divider plain /> */}
                  {/* {getWritingPermissions('prices') ? (
                    <div>
                      {BoLHState?.status?.pricesComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Prices Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Prices Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </div>
                  ) : null} */}
                </Form>
              </Card>
              {/* Profitability */}
              {getViewPermissions('prices') && getViewPermissions('costs') ? (
                <Row className="w-full">
                  <Col span={24} sm={{ span: 8 }}>
                    <Card className="mt-2">
                      <Statistic
                        title={i18n('newBillOfLadingHub.profitability.totalPrice')}
                        value={getTotalPrice(BoLHState?.cfdiDrafts)}
                        precision={2}
                        // valueStyle={{ color: '#53cf8c' }}
                        prefix={BoLHState?.cfdiDrafts[0] ? BoLHState?.cfdiDrafts[0].currency : ''}
                        // suffix="%"
                        key="totalPrice"
                      />
                    </Card>
                  </Col>
                  <Col span={24} sm={{ span: 8 }}>
                    <Card className="mt-2 md:ml-2">
                      <Statistic
                        title={i18n('newBillOfLadingHub.profitability.totalCost')}
                        value={getTotalCost(BoLHState?.billOfLading2?.costs)}
                        precision={2}
                        // valueStyle={{ color: '#f97474' }}
                        prefix={
                          BoLHState?.billOfLading2?.costs !== undefined && BoLHState?.billOfLading2?.costs.length > 0
                            ? BoLHState?.billOfLading2?.costs[0].currency
                            : ''
                        }
                        // suffix="%"
                        key="totalCost"
                      />
                    </Card>
                  </Col>
                  <Col span={24} sm={{ span: 8 }}>
                    <Card className="mt-2 md:ml-2">
                      <Statistic
                        title={i18n('newBillOfLadingHub.profitability.totalMargin')}
                        value={getTotalMarginText(
                          getTotalPrice(BoLHState?.cfdiDrafts),
                          getTotalCost(BoLHState?.billOfLading2?.costs),
                          2,
                          4,
                          BoLHState?.billOfLading2?.costs !== undefined && BoLHState?.billOfLading2?.costs.length > 0
                            ? BoLHState?.billOfLading2?.costs[0].currency
                            : ''
                        )}
                        precision={2}
                        valueStyle={
                          getTotalMargin(getTotalPrice(BoLHState?.cfdiDrafts), getTotalCost(BoLHState?.billOfLading2?.costs), 4) > 0
                            ? { color: '#53cf8c' }
                            : { color: '#f97474' }
                        }
                        // prefix={''}
                        // suffix="%"
                        key="totalMargin"
                      />
                    </Card>
                  </Col>
                  {/* <Col span={24} sm={{ span: 6 }}>
                    <Card className="mt-2 md:ml-2">
                      <Statistic
                        title={i18n('newBillOfLadingHub.profitability.totalMargin')}
                        value={getTotalMargin(getTotalPrice(BoLHState?.cfdiDrafts), getTotalCost(BoLHState?.billOfLading2?.costs), 4)}
                        precision={2}
                        valueStyle={
                          getTotalMargin(getTotalPrice(BoLHState?.cfdiDrafts), getTotalCost(BoLHState?.billOfLading2?.costs), 4) > 0
                            ? { color: '#53cf8c' }
                            : { color: '#f97474' }
                        }
                        // prefix={''}
                        suffix="%"
                        key="totalMargin"
                      />
                    </Card>
                  </Col> */}
                </Row>
              ) : null}
              {getViewPermissions('prices') && !getViewPermissions('costs') ? (
                <Row className="w-full">
                  <Col span={24}>
                    <Card className="mt-2">
                      <Statistic
                        title={i18n('newBillOfLadingHub.profitability.totalPrice')}
                        value={getTotalPrice(BoLHState?.cfdiDrafts)}
                        precision={2}
                        // valueStyle={{ color: '#53cf8c' }}
                        prefix={BoLHState?.cfdiDrafts[0] ? BoLHState?.cfdiDrafts[0].currency : ''}
                        // suffix="%"
                        key="totalPrice"
                      />
                    </Card>
                  </Col>
                </Row>
              ) : null}
              <Card className="w-full my-2">
                <Table
                  pagination={false}
                  dataSource={getItemsFromCfdiDraft(getCfdiDraftByBoLHSection('Main'))}
                  columns={priceItemsColumns}
                />
              </Card>
            </div>
          ) : null}

          {/* Costs */}
          {getViewPermissions('costs') ? (
            <div>
              <Card className="w-full mt-20 border-l-8 border-t-0 border-b-0 border-r-0 border-tkyBlue">
                <Form layout="vertical">
                  <Title level={3}>{i18n(`newBillOfLadingHub.costs.title`)}</Title>
                  <div className="mt-4">{i18n('newBillOfLadingHub.costs.description')}</div>
                  {getWritingPermissions('costs') ? (
                    <Space className="mt-4 md:float-right md:-mt-16" wrap>
                      {/* {BoLHState?.status?.pricesComplete ? null : (
                        <Button type="" className="float-right" onClick={() => getCfdiFields(BoLHState)}>
                          {i18n('newBillOfLadingHub.costs.addItem')}
                        </Button>
                      )} */}
                      {BoLHState?.status?.costsComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Costs Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Costs Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </Space>
                  ) : null}

                  {/* <Divider plain />
                  <Table
                    pagination={false}
                    dataSource={getItemsFromCfdiDraft(getCfdiDraftByBoLHSection('Main'))}
                    columns={priceItemsColumns}
                  />
                  <Divider plain /> */}
                  {/* {getWritingPermissions('prices') ? (
                    <div>
                      {BoLHState?.status?.pricesComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Prices Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Prices Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </div>
                  ) : null} */}
                </Form>
              </Card>
              {getViewPermissions('costs') ? (
                <Row className="w-full">
                  <Col span={24}>
                    <Card className="mt-2">
                      <Statistic
                        title={i18n('newBillOfLadingHub.profitability.totalCost')}
                        value={getTotalCost(BoLHState?.billOfLading2?.costs)}
                        precision={2}
                        // valueStyle={{ color: '#f97474' }}
                        prefix={
                          BoLHState?.billOfLading2?.costs !== undefined && BoLHState?.billOfLading2?.costs.length > 0
                            ? BoLHState?.billOfLading2?.costs[0].currency
                            : ''
                        }
                        // suffix="%"
                        key="totalCost"
                      />
                    </Card>
                  </Col>
                </Row>
              ) : null}
              <Card className="w-full my-2">
                <Table
                  pagination={false}
                  dataSource={costsData(BoLHState?.billOfLading2?.costs ? BoLHState?.billOfLading2?.costs : [])}
                  columns={costItemsColumns}
                  // summary={pageData => costsTotals(pageData)}
                />
              </Card>
            </div>
          ) : null}

          {/* General Info */}
          {getViewPermissions('generalInfo') ? (
            <div>
              <Card className="w-full mt-20 border-l-8 border-t-0 border-b-0 border-r-0 border-tkyBlue">
                <Form layout="vertical" onFinish={handleSubmit(onSubmitRoute)}>
                  {/* <Button onClick={() => console.log(BoLHState, BoLHState.billOfLading2.locations)}>
            Console Log State
          </Button> */}
                  <Title level={3}>{i18n(`newBillOfLadingHub.generalInfo.title`)}</Title>
                  <div className="mt-4">{i18n('newBillOfLadingHub.generalInfo.description')}</div>
                  {getWritingPermissions('generalInfo') ? (
                    <Space className="mt-4 md:float-right md:-mt-16" wrap>
                      {BoLHState?.status?.generalInfoComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'General Info Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'General Info Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </Space>
                  ) : null}

                  {/* <Divider plain />
                  <GeneralShipmentInfo
                    dispatch={dispatch}
                    internationalTransport={BoLHState?.billOfLading2?.internationalTransport}
                    inOutGoods={BoLHState?.billOfLading2?.inOutGoods}
                    countryOfOrigin={BoLHState?.billOfLading2?.countryOfOrigin}
                    wayInOut={BoLHState?.billOfLading2?.wayInOut}
                    disabled={!(getWritingPermissions('generalInfo') && !BoLHState?.status?.generalInfoComplete)}
                  />
                  <Divider plain />
                  {getWritingPermissions('generalInfo') ? (
                    <div>
                      {BoLHState?.status?.generalInfoComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'General Info Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'General Info Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </div>
                  ) : null} */}
                </Form>
              </Card>
              <Card className="w-full mt-2">
                <GeneralShipmentInfo
                  dispatch={dispatch}
                  internationalTransport={BoLHState?.billOfLading2?.internationalTransport}
                  inOutGoods={BoLHState?.billOfLading2?.inOutGoods}
                  countryOfOrigin={BoLHState?.billOfLading2?.countryOfOrigin}
                  wayInOut={BoLHState?.billOfLading2?.wayInOut}
                  disabled={!(getWritingPermissions('generalInfo') && !BoLHState?.status?.generalInfoComplete)}
                />
              </Card>
            </div>
          ) : null}

          {/* Locations */}
          {getViewPermissions('locations') ? (
            <div>
              <Card className="w-full mt-20 border-l-8 border-t-0 border-b-0 border-r-0 border-tkyBlue">
                <Form layout="vertical" onFinish={handleSubmit(onSubmitRoute)}>
                  <Title level={3}>{i18n(`newBillOfLadingHub.locations.title`)}</Title>
                  <div className="mt-4">{i18n('newBillOfLadingHub.locations.description')}</div>
                  {getWritingPermissions('locations') ? (
                    <Space className="mt-4 md:float-right md:-mt-16" wrap>
                      <Button
                        type=""
                        className="float-right"
                        onClick={() => {
                          setIsEditingLocation(false)
                          setIsDisabledSearchPlaces(false)
                          setLocationIndex(undefined)
                          setIsLocationVisible(true)
                          // console.log('isEditingLocation', isEditingLocation)
                          // console.log('isDisabledSearchPlaces', isDisabledSearchPlaces)
                        }}
                        disabled={BoLHState?.status?.locationsComplete}
                      >
                        {i18n('newBillOfLadingHub.locations.addLocation')}
                      </Button>
                      {BoLHState?.status?.locationsComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Locations Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Locations Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </Space>
                  ) : null}

                  {/* <Divider plain />
                  <RouteTimeline
                    locations={BoLHState ? BoLHState?.billOfLading2?.locations : null}
                    dispatch={dispatch}
                    disabled={getWritingPermissions('locations') && !BoLHState?.status?.locationsComplete}
                  />
                  <Divider plain /> */}
                  {/* {getWritingPermissions('locations') ? (
                    <div>
                      {BoLHState?.status?.locationsComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Locations Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Locations Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </div>
                  ) : null} */}
                </Form>
              </Card>
              <Drawer
                width="80%"
                onClose={() => setIsLocationVisible(false)}
                visible={isLocationVisible}
                bodyStyle={{ paddingBottom: 80 }}
                destroyOnClose
                // eslint-disable-next-line prettier/prettier
                // extra={
                //   <Space>
                //     <Button onClick={() => setIsLocationVisible(false)}>Cancel</Button>
                //     {/* <Button onClick={() => setIsLocationVisible(false)} type="primary">
                //       {i18n('buttons.submit')}
                //     </Button> */}
                //   </Space>
                //   // eslint-disable-next-line prettier/prettier
                // }
                key={2}
              >
                <NewLocation
                  dispatch={dispatch}
                  setIsLocationVisible={setIsLocationVisible}
                  locations={BoLHState?.billOfLading2?.locations}
                  index={locationIndex}
                  isEditingLocation={isEditingLocation}
                  isDisabledSearchPlaces={isDisabledSearchPlaces}
                  isDisabledSearchCompanies={isDisabledSearchPlaces}
                  authorizedUsers={filterUsersByViewPermissionOnlyMail(BoLHState?.share?.users, 'locations')}
                />
              </Drawer>
              <Card className="w-full mt-2">
                <RouteTimeline
                  locations={BoLHState ? BoLHState?.billOfLading2?.locations : null}
                  dispatch={dispatch}
                  disabled={getWritingPermissions('locations') && !BoLHState?.status?.locationsComplete}
                  usersList={filterUsersByViewPermission(BoLHState?.share?.users, 'locations')}
                  loggedEmail={loggedEmail}
                  sharePermission={getViewPermissions('share')}
                />
              </Card>
            </div>
          ) : null}

          {/* Goods */}
          {getViewPermissions('goods') ? (
            <div>
              <Card className="w-full mt-20 border-l-8 border-t-0 border-b-0 border-r-0 border-tkyBlue">
                <Form layout="vertical" onFinish={handleSubmit(onSubmitLoad)}>
                  <Title level={3}>{i18n(`newBillOfLadingHub.goods.title`)}</Title>
                  <div className="mt-4">{i18n('newBillOfLadingHub.goods.description')}</div>
                  {getWritingPermissions('goods') ? (
                    <Space className="mt-4 md:float-right md:-mt-16" wrap>
                      {/* <Button type="" onClick={() => loadXMLFileToParse()}>
                        {i18n('newBillOfLadingHub.goods.importFromXML')}
                      </Button>
                      <Button type="" onClick={() => loadXMLFileToParse()}>
                        {i18n('newBillOfLadingHub.goods.loadXML')}
                      </Button> */}
                      <Button
                        type=""
                        onClick={() => {
                          setIsItemVisible(true)
                          setIsEditingItem(false)
                          setItemIndex(undefined)
                        }}
                        disabled={BoLHState?.status?.goodsComplete}
                      >
                        {i18n('newBillOfLadingHub.load.addItem')}
                      </Button>
                      {BoLHState?.status?.goodsComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Goods Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Goods Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </Space>
                  ) : null}

                  <Divider plain />
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">{i18n(`newBillOfLadingHub.goods.totalWeight`)}</Text>
                    <Text>
                      {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                      <strong>{BoLHState ? numberFormat(BoLHState?.billOfLading2?.goods?.totalWeight) : 0} </strong>
                      {BoLHState ? BoLHState?.billOfLading2?.goods?.UnidadPeso : null}
                    </Text>
                  </Space>
                  <Space direction="vertical" size={0} className="float-right mr-5">
                    <Text type="secondary">{i18n(`newBillOfLadingHub.goods.items`)}</Text>
                    <Space className="float-right ">
                      <Text>
                        <strong>{BoLHState ? BoLHState?.billOfLading2?.goods?.good.length : 0}</strong>
                      </Text>
                      {/* <Text>{i18n(`newBillOfLadingHub.goods.items`)}</Text> */}
                    </Space>
                  </Space>
                  {/* <Divider plain />
                  <GoodsList
                    goods={BoLHState ? BoLHState?.billOfLading2?.goods?.good : null}
                    dispatch={dispatch}
                    disabled={getWritingPermissions('goods') && !BoLHState?.status?.goodsComplete}
                  />
                  <Divider plain />
                  {getWritingPermissions('goods') ? (
                    <div>
                      {BoLHState?.status?.goodsComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Goods Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Goods Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </div>
                  ) : null} */}
                </Form>
              </Card>
              <Drawer
                width="80%"
                onClose={() => setIsItemVisible(false)}
                visible={isItemVisible}
                bodyStyle={{ paddingBottom: 80 }}
                destroyOnClose
                // eslint-disable-next-line prettier/prettier
                // extra={
                //   <Space>
                //     <Button onClick={() => setIsLocationVisible(false)}>Cancel</Button>
                //     {/* <Button onClick={() => setIsLocationVisible(false)} type="primary">
                //       {i18n('buttons.submit')}
                //     </Button> */}
                //   </Space>
                //   // eslint-disable-next-line prettier/prettier
                // }
                key="newItemDrawer"
              >
                <NewItem
                  dispatch={dispatch}
                  setIsItemVisible={setIsItemVisible}
                  goods={BoLHState?.billOfLading2?.goods?.good}
                  index={itemIndex}
                  isEditingItem={isEditingItem}
                  isDisabledSearchItems={isDisabledSearchItems}
                  key="newItemForm"
                  authorizedUsers={filterUsersByViewPermissionOnlyMail(BoLHState?.share?.users, 'goods')}
                />
              </Drawer>
              <GoodsList
                goods={BoLHState ? BoLHState?.billOfLading2?.goods?.good : null}
                dispatch={dispatch}
                disabled={getWritingPermissions('goods') && !BoLHState?.status?.goodsComplete}
                usersList={filterUsersByViewPermission(BoLHState?.share?.users, 'goods')}
                loggedEmail={loggedEmail}
                sharePermission={getViewPermissions('share')}
              />
            </div>
          ) : null}

          {/* Transport */}
          {getViewPermissions('transports') ? (
            <div>
              <Card className="w-full mt-20 border-l-8 border-t-0 border-b-0 border-r-0 border-tkyBlue">
                <Form layout="vertical" onFinish={handleSubmit(onSubmitLoad)}>
                  <Title level={3}>{i18n(`newBillOfLadingHub.transport.title`)}</Title>
                  <div className="mt-4">{i18n('newBillOfLadingHub.transport.description')}</div>
                  {getWritingPermissions('transports') ? (
                    <Space className="mt-4 md:float-right md:-mt-16" wrap>
                      <Button
                        type=""
                        onClick={() => {
                          setIsEditingTransport(false)
                          setTransportIndex(undefined)
                          setIsTransportVisible(true)
                        }}
                        // disabled={BoLHState?.status?.transportsComplete}
                      >
                        {i18n('newBillOfLadingHub.transport.addTransport')}
                      </Button>
                      {/* Mark as Completed Button */}
                      {/* {BoLHState?.status?.transportsComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Transports Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Transports Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )} */}
                    </Space>
                  ) : null}

                  {/* {createTransportsCards}
                  <Divider plain />
                  {getWritingPermissions('transports') ? (
                    <div>
                      {BoLHState?.status?.transportsComplete ? (
                        <Button type="" className="float-right" onClick={() => dispatch({ type: 'Transports Edit' })}>
                          {i18n('buttons.edit')}
                        </Button>
                      ) : (
                        <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Transports Complete' })}>
                          {i18n('buttons.complete')}
                        </Button>
                      )}
                    </div>
                  ) : null} */}
                  <Button
                    className="md:float-right mt-4 md:mt-0"
                    onClick={() => {
                      // eslint-disable-next-line no-console
                      console.log('BoLHState', BoLHState)
                    }}
                  >
                    Console Log State
                  </Button>
                </Form>
              </Card>
              {createTransportsCards}
              <Drawer
                width="80%"
                onClose={() => setIsTransportVisible(false)}
                visible={isTransportVisible}
                bodyStyle={{ paddingBottom: 80 }}
                destroyOnClose
                // eslint-disable-next-line prettier/prettier
                // extra={
                //   <Space>
                //     <Button onClick={() => setIsLocationVisible(false)}>Cancel</Button>
                //     {/* <Button onClick={() => setIsLocationVisible(false)} type="primary">
                //       {i18n('buttons.submit')}
                //     </Button> */}
                //   </Space>
                //   // eslint-disable-next-line prettier/prettier
                // }
                key={4}
              >
                <NewTransport
                  dispatch={dispatch}
                  setIsTransportVisible={setIsTransportVisible}
                  transports={BoLHState?.billOfLading2?.transports}
                  index={transportIndex}
                  isEditingTransport={isEditingTransport}
                  authorizedUsers={filterUsersByViewPermissionOnlyMail(BoLHState?.share?.users, 'transports')}
                  companyProfile={companyProfile}
                />
              </Drawer>
            </div>
          ) : null}

          {/* Load */}
          {/* <Card className="w-full my-2">
        <Form layout="vertical" onFinish={handleSubmit(onSubmitLoad)}>
          <Title level={3}>{i18n(`newBillOfLadingHub.load.title`)}</Title>
          <p>
            {i18n('newBillOfLadingHub.load.description')}
            <Button type="" className="float-right">
              {i18n('newBillOfLadingHub.load.addItem')}
            </Button>
          </p>
          <Divider plain />
          <Table columns={loadColumns} dataSource={loadData} pagination={false} />
          <Divider plain />
          <Button type="primary" className="float-right" onClick={() => dispatch({ type: 'Load Submit' })}>
            {i18n('buttons.complete')}
          </Button>
        </Form>
      </Card> */}

          {/* Customs */}
          {/* {BoLHState?.billOfLading2.internationalTransport === 'Si' ? (
        <Card className="w-full my-2">
          <Form layout="vertical" onFinish={handleSubmit(onSubmitCustoms)}>
            <Title level={3}>{i18n(`newBillOfLadingHub.customs.title`)}</Title>
            <p>{i18n('newBillOfLadingHub.customs.description')}</p>
            <Divider plain />
            <Input className="w-full sm:w-96 mr-2 mb-2" placeholder={i18n('newBillOfLadingHub.customs.placeholder')} />
            <Button type="primary" onClick={() => dispatch({ type: 'Customs Submit' })}>
              {i18n('buttons.complete')}
            </Button>
          </Form>
        </Card>
      ) : null} */}

          {/* Documents */}
          {/* <Card className="w-full my-2">
        <Form layout="vertical" onFinish={handleSubmit(onSubmitDocuments)}>
          <Title level={3}>{i18n(`newBillOfLadingHub.documents.title`)}</Title>
          <p>{i18n('newBillOfLadingHub.documents.description')}</p>
          <Upload
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            defaultFileList={[
              {
                uid: '1',
                name: 'xxx.png',
                status: 'done',
                response: 'Server Error 500', // custom error message to show
                url: 'http://www.baidu.com/xxx.png',
              },
              {
                uid: '2',
                name: 'yyy.png',
                status: 'done',
                url: 'http://www.baidu.com/yyy.png',
              },
              {
                uid: '3',
                name: 'zzz.png',
                status: 'error',
                response: 'Server Error 500', // custom error message to show
                url: 'http://www.baidu.com/zzz.png',
              },
            ]}
            listType="text"
            showUploadList={{ showPreviewIcon: false, showDownloadIcon: true }}
          >
            <Button className="" icon={<UploadOutlined />} type="primary" onClick={() => dispatch({ type: 'Documents Submit' })}>
              {i18n('newBillOfLadingHub.documents.upload')}
            </Button>
          </Upload>

          <Divider plain />
          <Input className="w-full sm:w-96 mr-2 mb-2" placeholder={i18n('newBillOfLadingHub.documents.placeholder')} />
          <Button type="primary">{i18n('newBillOfLadingHub.documents.upload')}</Button>
        </Form>
      </Card> */}

          {/* Logs */}
          {/* <Card className="w-full my-2">
        <Title level={3}>{i18n(`newBillOfLadingHub.logs.title`)}</Title>
        <p>{i18n('newBillOfLadingHub.logs.description')}</p>
      </Card> */}
        </Layout>
      </Layout>
    </Layout>
  )
}

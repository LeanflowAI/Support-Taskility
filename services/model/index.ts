// TODO: Sort function definitions alphabetically... and define naming convention
import { ObjectId } from 'bson'
import { WithId } from 'mongodb'

// Types in Database Scheme

export enum UserType {
  client = 'client',
  freeUser = 'freeUser',
  paidUser = 'paidUser',
  provider = 'provider',
  invitedUser = 'invitedUser',
}

interface VerificationToken {
  token: string
  address: string
  when: Date
}

export interface User {
  _id?: any
  createdAt: Date
  username: string
  services: {
    email: {
      verificationTokens: VerificationToken[]
    }
    password: {
      bcrypt: string
    }
    resume?: {
      loginTokens: [
        {
          when: Date
          hashedToken: string
        }
      ]
    }
  }
  emails: [{ address?: string; verified?: boolean }]
  mobilePhone?: string
  profile: {
    userType: UserType
    companyId?: string
    settings?: object
    canCreateInvoices?: boolean
    canCreateCreditNotes?: boolean
    canCreatePaymentProofs?: boolean
    canCancelInvoices?: boolean
    photo?: string
  }
  enabled?: boolean
  deleted?: boolean
  licenses?: [{ licenseId: any; licenseName: string; active: boolean; expiration?: Date; suspension?: Date }]
  roles?: [{ role: string; companyId: any }]
  authorizations?: Object
  managers?: [{ userId: any; companyId: any }]
  position?: string
}

// TODO: Change Payed to Paid in the model and in the database.
export type CfdiStatus =
  | 'active'
  | 'payed'
  | 'partiallyPayed'
  | 'payedWithoutComplement'
  | 'cancelPending'
  | 'canceled'
  | 'discounted'
  | 'totallyDiscounted'

/*
 *    pending: cfdi created, not sent yet
 *    sending: email delivery in progress
 *    sent: email sent, awaiting confirmation
 *    missing-config: business relationship configuration to send notifications not specified
 *    no-recipients: no recipients available on business relationship
 *    error: email sent error, notified via webhook
 */

// TODO: Update Leanflow to create quotations with this new schema
export interface ShipmentOrderQuotation {
  id: string // TODO: AGREGAR AL CREAR LOS SERVICIOS EN LA ORDEN DE EMBARQUE
  /** Service code from catalogs */
  productCode: string // TODO: Migration to make this a required field
  /** Service description from catalogs */
  description?: string // TODO: Migration to make this a required field (only 0.5% are undefined)
  unit: string
  quantity?: number // TODO: Migration to make this a required field
  unitValue: number
  /** Three letter currency code */
  currency: string
  isAccesorial?: boolean
  accesorialCode?: string
  // TODO: Migration to join accesorialCode and accesorialId on an optional object with required "id" and "code"
  accesorialId?: string
  haveTax?: boolean
  tax: number | string // TODO: Migration to fix documents with strings. Convert to numbers and remove string type
  haveIvaRet?: boolean
  ivaRet: number | string // TODO: Migration to fix documents with strings. Convert to numbers and remove string type
  taxesTotal?: number
  subtotal: number // TODO: Migration to calculate and store subtotal
  total: number | string // TODO: Migration to fix documents with strings. Convert to numbers and remove string type
  createdFromRate?: boolean
  notes?: string
  /** Each quotation will be related to one cfdi:
   * an invoice for billed quotations or a credit note for quotations with negative value
   * The field don't exists if the quotation has not been billed */
  relatedCfdi?: { id: string; itemId: string; status: CfdiStatus; folio: number }
  taxObject?: string
}

export interface ShipmentOrder {
  _id?: any
  type: 'order' | 'quotation'
  shipmentType?: 'import' | 'export' | 'domestic'
  serviceType?: 'single' | 'roundTrip' | 'expedited'
  companyId: string
  clientId: string
  shippedBy?: string
  origin?: string
  depositedBy?: string
  destination?: string
  pickupDate?: Date
  deadline?: Date
  userId: string // TODO: Check what this field represents, migrate to a better name and add documentation
  author: string // 'author' TODO: Migrate to createdByUsername
  submitted?: Date // TODO: Migrate to createdAt (Check if the value is the creation datetime)
  isChecked?: boolean
  orderClientReference?: string
  referencia: string // TODO: Migration to change name "referencia" -> "reference"
  milestonesList?: Array<{
    number: number
    endAddress: string
    milestoneType: 'pickup' | 'delivery' | 'airway' | 'land' | 'seaway' | 'train' | 'customs'
    /** Id of the company that act as carrier */
    carrier: string // TODO: Rename to carrierId
    trackingNumber: string
  }> // TODO: Rename to "milestones"
  currentMilestoneNumber?: number
  deliveryDate?: Date
  currency?: string // TODO: Remove. The currencies are specified on each quotation. Belongs to V1
  quotations?: Array<ShipmentOrderQuotation>
  completedDate?: Date // TODO: Check al the stored dates (pickupDate, deadline, ...) to apply MongoDB attribute pattern
  creditDays?: string // TODO: Convert to number
  invoiceCompanyId?: string // TODO: Check usage and remove if is required.
  invoiceId?: string // TODO: Migrate and remove. Belongs to V1
  clientName?: string
  depositedByName?: string
  shippedByName?: string
  documents?: Array<{
    id: string
    documentType: string // TODO: Make it match with orderDocumentTypes from catalogs
  }>
  cfdis?: Array<{
    id: string
    uuid: string
    folio?: string | number
    /** Related cfdi total */
    total: number
    /** Amount from total related to this shipment order */
    amount: number
  }>
  observaciones?: string // TODO: pending rename to "notes"
}

export type CfdiType = 'invoice' | 'creditNote' | 'paymentProof'

export type CfdiDeliveryStatus = 'pending' | 'sending' | 'sent' | 'missing-config' | 'no-recipients' | 'error'

export interface CfdiItem {
  id: string // TODO: Migration required to add this field
  productCode: string
  unit: string
  quantity: number
  unitValue: number
  subtotal: number
  taxes?: Array<{ name: string; rate: number; isRetention: boolean; value: number }>
  total: number
  /** Id of the invoice being affected. Only for credit note items */
  invoiceId?: string
  /** Related service (shipment order, ...) related to this invoice item */
  service?: { id: string; quotationId?: string }
  notes?: string
  taxObject?: string
}

export interface CfdiRelatedCfdi {
  id: string
  uuid: string
  /** 'paymentProof' | 'creditNote' for invoices, 'invoice' for payment proofs and credit notes */
  type: 'paymentProof' | 'creditNote' | 'invoice'
  status: CfdiStatus
  folio: number
  currency?: string
  exchangeRate?: number
  total?: number
  createdAt: Date
  /** Amount deducted from an invoice by a credit note. For invoices inside credit notes. */
  creditAmount?: number
  /** Amount not payed before the payment proofs creation. For invoices inside payment proofs only. */
  previousBalanceAmount?: number // TODO: Get from Complement.Payments.RelatedDocuments
  /** Amount payed after the payment proof creation. For invoices inside payment proofs only. */
  amountPaid?: number // TODO: Get from Complement.Payments.RelatedDocuments
  /** For invoices inside payment proofs only. */
  partialityNumber?: number // TODO: Get from Complement.Payments.RelatedDocuments
  /** For invoices inside payment proofs only. */
  paymentMethod?: number // TODO: Get from Complement.Payments.RelatedDocuments
}

interface CfdiPayment {
  date: Date
  paymentForm: string
  currency: string
  exchangeRate: number
  amount: number
  receiverAccount?: { number: string; bankRfc: string }
  issuerAccount?: { number: string; bankRfc: string }
  operationNumber?: string
  /** uuids of related documents (details are stored on "relatedCfdis") */
  cfdisUuids: Array<string>
}

type CfdiRelatedService = {
  id: string
  reference: string
  clientReference?: string
  notes?: string
  createdAt: Date
  origin: string
  destination: string
}

export interface Cfdi {
  _id?: any
  // invoiceCompanyId: string // TODO: Migration to remove. Replaced by issuer.id
  // clientCompanyId: string // TODO: Migration to remove. Replaced by receiver.id
  createdAt: Date // Assigned from API "Date" field
  expirationDate?: Date
  createdBy: string
  createdByUsername: string
  status: CfdiStatus
  deliveryStatus: CfdiDeliveryStatus
  apiId?: string // Id given by the SAT API. Optional: CFDIs loaded from XML don't have it
  issuer: { id: string; fiscalRegime: string; rfc: string; name: string; address: string; phone?: string }
  receiver: {
    id: string
    rfc: string
    name: string
    address: string
    // paymentAccountNumber?: string // TODO: Review to remove. Never used in Leanflow
    foreignFiscalId?: string
    cfdiUse?: string
  }
  cfdiType: CfdiType
  folio: number // TODO: Migration to store as numbers only
  certNumber: string
  paymentTerms?: string
  paymentConditions?: string
  paymentMethod?: string
  expeditionPlace: string
  exchangeRate?: number
  currency?: string // Payment proofs store currencies inside his payments
  shortCurrency?: string
  subtotal?: number
  total?: number
  uuid: string
  cfdiSign: string
  cfdiSignDate: Date
  satCertNumber: string
  satSign: string
  items?: Array<CfdiItem>
  pdfDocumentId?: string
  pdfDocumentUrl?: string
  xmlDocumentId?: string
  cancelXmlDocumentId?: string
  sourceXmlDocumentId?: string // This field exists, for CFDIs loaded from an external XML file
  // TODO: Store external XML file on 'attachedFiles' collection
  deliveryEmails?: Array<string>
  /** Invoices, Payment proofs or credit notes where the currenct cfdi is referenced. */
  relatedCfdis?: Array<CfdiRelatedCfdi>
  /** Details of payments on this payment proof */
  payments?: Array<CfdiPayment>
  /** Invoice pending amount */
  pendingAmount?: number
  /** Amount of the invoice total already payed via payment proofs */
  payedAmount?: number
  notes?: string
  /** Shipment orders and other services being billed by this invoice or affected by this credit note */
  relatedServices?: Array<CfdiRelatedService>
  /** User id and username only for the requests made by a user.
   * The server can check cancel status for "pending" requests */
  cancelRequests?: [{ userId?: string; username?: string; requestDate: Date; status: 'canceled' | 'pending'; message: string }]
  // TODO: Store "CancellationDate" from the successful cancel request on canceledAt
  /** Current CFDI is cancelled if this date exists. */
  canceledAt?: Date
  // TODO: Create "attachedFiles" collection (_id, type: url|base64 , url, data)
  cancelEvidence?: { required: boolean; loadedAt?: Date; userId?: Date; documentId?: string }
  /** If "loadDateTime" exists, the CFDI was loaded from an external XML file */
  loadDateTime?: Date
  complement?: { billOfLading20?: {} | undefined } | undefined
}

export type EmailMessage = {
  _id?: any
  createdAt: Date
  messageId: string
  emailStatus: 'sent' | 'delivered' | 'opened' | 'spamComplaint' | 'bounced'
  to: string
  submittedAt: Date
  attachments?: Array<{ name: string; size: number }>
}

export interface Company {
  _id?: any
  name: string
  comercialName: string
  rfc: string
  email: string
  fiscalRegime: string
  foreignFiscalId?: string
  address: string
  addressData: {
    street: string
    municipality: string
    exteriorNumber: string
    state: string
    neighborhood: string
    country: string
    zipCode: string
  }
  phoneNumber?: string
  bankAccountsList?: Array<{
    bank: string
    bankRfc: string
    number: string
    currency: string
    clabe?: string
    isDefault?: boolean
  }>
  accountLastDigits?: string // TODO: Migration to store for all companies with at least one bank account
  // TODO: Also update on bankAccountsList changes. Delete or ser to 4 last digits of the default account

  initialInvoiceNumber?: string // TODO: Migration. Store as numbers
  lastInvoiceNumber?: number
  initialCreditNoteNumber?: string // TODO: Migration. Store as numbers
  lastCreditNoteNumber?: number
  initialPaymentProofNumber?: string // TODO: Migration. Store as numbers
  lastPaymentProofNumber?: number

  logoImageId?: string
  parentCompanyId?: string
  profile?: Object

  /*
currency:"Pesos MX"

companyManagerId:"GmHeGWnh3Phfxawpk"
orderInitialNumber:"172587"
quotationInitialNumber:"A1A170001"
allowedUsersCount:"100"
phoneNumber:"4423400070"
subscriptionEndDate:"2018-12-31"
monthlySubscriptionFee:"0"
createdAt:2017-11-06T1:0:32.271+0:00
createdBy:"3ZvRNgAbtq7ZyywG6"
gpsApiUsername:"API.A1ALogistics"
gpsApiPassword:"F4h9N78G"
haveCsd:true
nextOrderNumber:1424
orderNumberPrefix:"A1AL20"
nextOrderNumberByPrefix:
  A1A:1
  A1A17:5
  A1A18:3894
  A2A18:1
  A1A 18:1
  A1A19:1
  A1AL19:2101
  A1AL20:1
nextQuotationNumber:4
gpsApi:leanflow:
  username:"ventas@a1alogistics.com"
  password:"Trafico2019"

billingCountry:"MEX"
types:"Terrestre"
  */
  isSigningCfdi: boolean
  gpsApi: { [index: string]: { [index: string]: string } }
  licenses: [{ licenseId: any; licenseType: string; expiration: Date; suspension: Date }]
  authorizations: Object
  nextBoLHNumber?: number
  orderNumberPrefix?: string
  nextOrderNumber?: number
}

export interface Company40 {
  _id?: any
  name: string
  comercialName: string
  rfc: string
  email: string
  fiscalRegime: string
  foreignFiscalId?: string
  address: string
  zipCode: string
  addressData: {
    street: string
    exteriorNumber: string
    interiorNumber?: string
    neighborhood: {
      satCode: string
      satDescription: string
    }
    municipality?: {
      satCode: string
      satDescription: string
    }
    locality?: {
      satCode: string
      satDescription: string
    }
    state: {
      satCode: string
      satDescription: string
    }
    country: string
    zipCode: string
  }
  phoneNumber?: string
  bankAccountsList?: Array<{
    bank: string
    bankRfc: string
    number: string
    currency: string
    clabe?: string
    isDefault?: boolean
  }>
  accountLastDigits?: string // TODO: Migration to store for all companies with at least one bank account
  // TODO: Also update on bankAccountsList changes. Delete or ser to 4 last digits of the default account

  initialInvoiceNumber?: string // TODO: Migration. Store as numbers
  lastInvoiceNumber?: number
  initialCreditNoteNumber?: string // TODO: Migration. Store as numbers
  lastCreditNoteNumber?: number
  initialPaymentProofNumber?: string // TODO: Migration. Store as numbers
  lastPaymentProofNumber?: number

  logoImageId?: string
  parentCompanyId?: string
  profile?: Object

  /*
currency:"Pesos MX"

companyManagerId:"GmHeGWnh3Phfxawpk"
orderInitialNumber:"172587"
quotationInitialNumber:"A1A170001"
allowedUsersCount:"100"
phoneNumber:"4423400070"
subscriptionEndDate:"2018-12-31"
monthlySubscriptionFee:"0"
createdAt:2017-11-06T1:0:32.271+0:00
createdBy:"3ZvRNgAbtq7ZyywG6"
gpsApiUsername:"API.A1ALogistics"
gpsApiPassword:"F4h9N78G"
haveCsd:true
nextOrderNumber:1424
orderNumberPrefix:"A1AL20"
nextOrderNumberByPrefix:
  A1A:1
  A1A17:5
  A1A18:3894
  A2A18:1
  A1A 18:1
  A1A19:1
  A1AL19:2101
  A1AL20:1
nextQuotationNumber:4
gpsApi:leanflow:
  username:"ventas@a1alogistics.com"
  password:"Trafico2019"

billingCountry:"MEX"
types:"Terrestre"
  */
  isSigningCfdi: boolean
  gpsApi: { [index: string]: { [index: string]: string } }
  licenses: [{ licenseId: any; licenseType: string; expiration: Date; suspension: Date }]
  authorizations: Object
  nextBoLHNumber?: number
  orderNumberPrefix?: string
  nextOrderNumber?: number
}

// TODO: Add relationship type for bank/client relationship
export type RelationshipType = 'service'

export type RelationshipCompanyRole = 'client' | 'serviceProvider'

export interface Relationship {
  _id?: string
  type: RelationshipType
  createdAt: Date
  createdBy: string
  createdByCompany: string
  companies: Array<{ companyId: string; companyName: string; role: RelationshipCompanyRole }>
  // TODO: Complete schema
  peopleList?: Array<{
    accountUserId?: string
    createdAt: Date
    createdByCompany: string
    createdByUser: string
    email: string
    job?: string
    name: string
    newDocumentNotifications: Boolean
    phone?: 'string'
    // TODO: Currenctly used to notify new CFDIs. Update to split permissions by CFDI type or just rename to "sendCfdis"
    sendInvoices: Boolean
    sendQuotations: Boolean
    statusNotifications: Boolean
    viewOrders: Boolean
  }>
  sendNewInvoiceEmails: boolean
  sendNewInvoiceEmailsLang: 'en' | 'es'
  newInvoiceEmailTitle: string // TODO: Rename to newCfdiEmailTitle
  bankAccountsList: Array<{
    number: string
    bank: string
    currency: string
    bankRfc: string
    createdAt: Date
    createdByUser: string
    createdByCompany: string
  }>
}

export interface EmailDelivery {
  _id?: any
  messageId: string
  emailStatus: 'opened' | 'sent' | 'delivered'
  to: string
  attachments?: [{ name: string; size: number }]
  sentAt: Date
  deliveredAt?: Date
  openedAt?: Date
}

export interface AttachedFile {
  _id?: any
  createdAt: Date
  type: 'url' | 'base64'
  url?: string
  base64Data?: string
  size: number
  ext: string
}

export interface EventLogType {
  name: string
  category: string
}

export type EventLog = {
  _id?: any
  number: number
  createdAt: Date
  user?: { id: string; username: string; role: UserType }
  hash: string
  event: any
}

export type CurrencyRate = {
  _id?: any
  base: string
  date: Date
  /** Store currency-value pairs. Currencies use three letters code. */
  rates: { [key: string]: number }
}

export interface GeocodingPositionInfo {
  _id?: any
  createdAt: Date
  lat: number
  lng: number
  result: any
}

export interface Vehicle {
  _id?: any
  companyId: string
  number: string
  createdAt: Date
  type?: string
  plateNumber?: string
  trailerType?: string
  createdBy?: string
  trailerId?: string
  locationInfo?: {
    Latitude: string
    Longitude: string
    Location: string
    ActivityDateTime: Date
  }
  foundOnGpsApi?: boolean
  gpsInfo?: { [gpsProviderName: string]: any }
  active?: boolean
  activeChangedAt?: Date
  activeChangedBy?: string
}

export interface SatAddressComponent {
  key: string
  satCode: string
  satDescription: string
}

export interface SatAddress {
  exteriorNumber?: string
  street?: string
  suburb: string | SatAddressComponent | Array<SatAddressComponent>
  locality: string | SatAddressComponent | Array<SatAddressComponent>
  municipality: string | SatAddressComponent | Array<SatAddressComponent>
  state: string | SatAddressComponent | Array<SatAddressComponent>
  country: string | SatAddressComponent | Array<SatAddressComponent>
  postalCode: string | string[]
}

export interface GeolocationData {
  latitude: number
  longitude: number
  northEastCorner: number
  southWestCorner: number
}

export interface AppointmentContact {
  name: string
  lastName: string
  email: string
  phoneNumber: string
  link: string
  api: string
}

export type PlaceType =
  | 'warehouse'
  | 'factory'
  | 'distributionCenter'
  | 'retailStore'
  | 'tollBooth'
  | 'officeBuilding'
  | 'airport'
  | 'seaport'
  | 'yard'
  | 'other'

export interface Place {
  _id?: any
  name: string
  type?: PlaceType
  foundOnGoogleApi?: boolean
  googleApiResult?: Array<void>
  createdAt: Date
  lastUpdateAt: Date
  createrBy?: string
  satAddress: SatAddress
  geolocation: GeolocationData
  serviceHours?: Array<any>
  requiresAppointment?: Boolean
  appointmentRequestInfo?: AppointmentContact
  safetyRequirements?: string
}

export interface DbService {
  // Signup related dbServices
  createAccountRecoveryToken: (params: { email: string }) => Promise<string>
  saveActivationEmailData: (params: { username: string; submittedAt: string; messageId: string }) => void
  saveRecoveryEmailData: (params: { username: string; submittedAt: string; messageId: string }) => void
  validateCredentials: (user: User, password: string) => boolean

  // User related dbServices
  activateUser: (token: string) => void
  createUser: (params: { username: string; email: string; password: string }) => Promise<string>
  deleteUser: (userId: string) => Promise<void>
  getAllUserClients: (user: User, fields: { [key: string]: number }) => Promise<Array<Company>>
  getAllUserCompanies: (user: User, fields: { [key: string]: number }) => Promise<Array<any>>
  getUserByActivationToken: (token: string) => Promise<User | null>
  getUserByEmail: (email: string) => Promise<User | null>
  getUserById: (userId: string) => Promise<User | null>
  getUserByUsername: (username: string) => Promise<User | null>
  getUserByRecoveryToken: (token: string) => Promise<User | null>
  getUserCurrentCompany: ({ user }: { user: User }) => Promise<Company | null>
  getUsersList: (user: User) => Promise<{ users: any[]; count: number }>
  // getUserProfilePhoto: (userId: string) => Promise<User | null>
  updateUserPassword: (token: string, newPassword: string) => Promise<void>
  saveLoginToken: (params: { userId?: string; token: string }) => Promise<void>
  saveUserSettings: (params: { userId: string; settings: object }) => Promise<void>
  setUserEnabled: (userId: string) => Promise<void>
  setUserDisabled: (userId: string) => Promise<void>
  setUserType: (userId: string, newUserType: UserType, loggedUser: object) => Promise<void>

  // Billing related dbServices
  addCfdiDeliveryEmails: (cfdiId: string, sentEmailsIds: Array<string>) => Promise<void>
  addCfdiCancelRequest: (params: {
    cfdiId: string
    user: User | undefined
    requestDate: Date
    cancelDate: Date
    cancelResultMessage: string
  }) => Promise<void>
  attachCfdiBase64CancelXml: ({ cfdiId, xmlDocument }: { cfdiId: string; xmlDocument: string }) => Promise<void>
  attachCfdiBase64Xml: ({ cfdiId, xmlDocument }: { cfdiId: string; xmlDocument: string }) => Promise<void>
  attachPdfToCfdi: (cfdiId: string, file: AttachedFile) => Promise<void>
  findCfdis: (searchText: string) => Promise<Array<Cfdi>>
  getAttachedFileById: (attachedFileId: string) => Promise<AttachedFile | null>
  getBillingPendingServices: (companyId: string, clientId: string, fields: { [key: string]: number }) => Promise<Array<any>>
  getCancelPendingCfdis: () => Promise<Array<Cfdi>>
  getCfdi: (cfdiId?: string) => Promise<Cfdi | null>
  getCfdiList: (params: {
    user: User
    filters?: any[]
    searchText?: string
    skip?: number
    from?: string
    to?: string
    cfdiType?: string
    cfdiStatus?: string
    cfdiClients?: string
  }) => Promise<{ cfdis: any[]; count: number }>
  getCfdis: (cfdiIds?: Array<string>) => Promise<Array<Cfdi>>
  getExchangeRate: (date: Date, fromCurrency: string, toCurrency: string) => Promise<number | null>
  getInvoice: ({ invoiceId }: { invoiceId?: string }) => Promise<Cfdi | null>
  getPaymentProofPendingInvoices: (companyId: string, clientId: string, fields: { [key: string]: number }) => Promise<Array<any>>
  getNextCfdiNumber: ({ cfdiType, companyId }: { cfdiType: CfdiType; companyId: string }) => Promise<number | null>
  saveCfdi: ({ cfdi, sentCfdiId }: { cfdi: Cfdi; sentCfdiId: string | null }) => Promise<string | null>
  saveCfdiDraft: (cfdi: any) => Promise<void>
  saveCfdiSentToSign: (params: { user: User; clientParams: any; sentCfdi: any; signedCfdi: any; signError: any }) => Promise<string | null>
  setCompanyHaveCsd: ({ rfc, haveCsd }: { rfc: string; haveCsd: boolean }) => Promise<void>
  saveExchangeRate: (rate: CurrencyRate) => Promise<void>
  saveExternalInvoice: ({
    invoiceXmlAsJson,
    orderReference,
    user,
  }: {
    invoiceXmlAsJson: any
    orderReference: any
    user: any
  }) => Promise<any>
  setCfdiAsCanceled: (cfdiId: string, cancelDate: Date, pending?: boolean) => Promise<void>
  eventLogTypes: { [key: string]: EventLogType }
  setCfdiDeliveryStatus: (cfdiId: string, deliveryStatus: CfdiDeliveryStatus) => Promise<void>
  setCompanySigningCfdi: (companyId: string, isSigningCfdi: boolean) => Promise<boolean>
  // updateCfdiDiscountedStatus: (cfdiId: string, status: CfdiStatus) => Promise<any>

  // Company and Business Relationships related dbServices
  getClientById: (id: string) => Promise<any>
  getCompaniesWithGpsTracking: () => Promise<Array<any>>
  getCompany: ({ companyId, fields }: { companyId: string; fields?: { [key: string]: number } }) => Promise<Company | null>
  getCompany40: ({ companyId, fields }: { companyId: string; fields?: { [key: string]: number } }) => Promise<any>
  getCompanyClients: ({
    providerCompanyId,
    fields,
  }: {
    providerCompanyId: string
    fields: { [key: string]: number }
  }) => Promise<Array<any>>
  getCompanyLogoUrl: (logoId: string) => Promise<string>
  getServiceRelationship: (companyId: string, clientCompanyId: string, fields?: { [key: string]: number }) => Promise<Relationship | null>

  // Shipment related dbServices
  getShipment: ({ shipmentId }: { shipmentId: string }) => Promise<ShipmentOrder | null>
  getShipments: ({ shipmentIds }: { shipmentIds: Array<string> }) => Promise<Array<ShipmentOrder>>

  // Event Log related dbServices
  addEventLog: (eventLogType: EventLogType, eventLogDetails: any, user: User) => Promise<void>

  // Email Notifications related dbServices
  saveEmailMessage: (sentEmailToSave: EmailMessage) => Promise<string | null>

  // GPS Position related dbServices
  createCachedPositionInfo: (lat: number, lng: number, result: any) => Promise<void>
  createCompanyVehicle: (companyId: string, vehicleNumber: string) => Promise<void>
  getCachedPositionInfo: (lat: number, lng: number) => Promise<GeocodingPositionInfo | null>
  getCompanyVehicle: (companyId: string, vehicleNumber: string) => Promise<Vehicle | null>
  updateVehicleLocationInfo: (number: string, companyId: string, providerId: string, locationInfo: any) => Promise<void>

  // Bill of Lading related services
  getPostalCodeDetails: (postalCode: string, countryCode?: string) => Promise<any>
  getState: (stateCode: string, countryCode?: string) => Promise<any>
  getLocality: (localityCode: string, stateCode: string) => Promise<any>
  getMunicipality: (municipalityCode: string, stateCode: string) => Promise<any>
  getCountry: (countryCode: string[]) => Promise<any>
  getSuburbsList: (postalCode: string | string[]) => Promise<any[]>
  getLocalitiesList: (stateCode: string | string[]) => Promise<any[]>
  getMunicipalitiesList: (stateCode: string | string[]) => Promise<any[]>
  getStatesList: (countryCode: string | string[]) => Promise<any[]>

  // NewPlace related Services
  saveNewPlace: (place: Place) => Promise<any>
  searchPlaces: (search: string) => Promise<any[]>

  // NewCompany related Services
  saveNewCompany: (company: any, loggedUser: User) => Promise<{ name: any; _id: ObjectId } | null>
  searchCompanies: (search: string) => Promise<any[]>

  // NewVehicle related Services
  saveNewVehicle: (vehicle: any, loggedUser: User) => Promise<{ name: any; _id: ObjectId } | null>
  searchVehicles: (search: string, companyId: string, type: string) => Promise<any[]>

  // NewVehicle related Services
  saveNewDriver: (driver: any, loggedUser: User) => Promise<{ name: any; _id: any } | null>
  searchDrivers: (search: string, companyId: string) => Promise<any[]>

  // NewProduct related Services
  saveNewProduct: (driver: any, loggedUser: User) => Promise<{ name: any; _id: any } | null>
  searchProducts: (search: string, companyId: string) => Promise<any[]>

  // Counters related Services
  getCurrentCounterNumber: (name: string) => Promise<any>
  saveCounterNumber: (name: string, counter: number) => Promise<void>
  incrementCounterNumber: (name: string, increaseRate: number) => Promise<void>

  // BillOfLadingHub related Services
  saveNewBoLH: (
    BoLH: any,
    userId: string,
    companyId: string | undefined,
    user: any,
    createShipmentWithHub: boolean
  ) => Promise<{ ok: boolean; name: any; _id: any; error?: undefined } | { ok: boolean; name: string; _id: string; error: string }>
  getBillOfLadingHub: (id: string) => Promise<any>
  getBillOfLadingHubListByUser: (userId: string) => Promise<any>
  updateBoLHField: (id: string, action: string, fields: any) => Promise<null>
  getBoLHList: (params: {
    // eslint-disable-next-line no-use-before-define
    user: User
    filters?: any[]
    searchText?: string
    skip?: number
    from?: string
    to?: string
    BoLHClients?: string
    BoLHUsers?: string
  }) => Promise<{ BoLHubs: any[]; count: number }>
  getCompanyById: (companyId: string | undefined) => Promise<Company | null>
  // incrementCompanyBoLHCounter: (companyId: string | undefined, increaseRate: number) => Promise<any>
  getCfdiDraftsByBoLHId: (id: string) => Promise<any>
  copyBoLHubById: (id: string) => Promise<any>
  copyMultipleHubsById: (hubsIds: Array<string>) => Promise<any>
  getHubsForCopy: (hubsIds: Array<string>) => Promise<any>

  // Shipment Related Services
  // createNewShipmetFromBoLH: (companyId: string, shipmentReference: string, customerId?: string) => Promise<any>

  // SAT Codes Search
  searchSATCodesProductAndServices: (searchText: string) => Promise<object[]>
  searchSATTariffCodes: (searchText: string) => Promise<object[]>
  searchSATDangerousMaterialCodes: (searchText: string) => Promise<object[]>

  // Tracking related
  saveNewTrackingPosition: (shipmentId: string, coords: object, timestamp: string, companyId: string) => Promise<null>
  getShipmentLastPosition: (shipmentId: string) => Promise<object[]>

  // Get ahtorizations, profiles and configurations
  // eslint-disable-next-line no-use-before-define
  getCompanyProfile: (companyId: string | undefined) => Promise<Company | null>

  // DoF Exchange Rates related services
  saveExchangeRateDoF: (date: Date, exchangeRate: string) => Promise<null>
}



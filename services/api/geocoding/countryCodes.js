// eslint-disable-next-line camelcase
import { ISO_3166CountryCodes } from './ISO3166CountryCodes'

// Alpha-2 functions
export const alpha2ToNameCountry = alpha2CountryCode => {
  if (alpha2CountryCode.length !== 2) {
    throw new Error('Country Code provided must have exactly 2 letters')
  }
  const result = ISO_3166CountryCodes.find(country => {
    return country.alpha2 === alpha2CountryCode
  })
  if (!result) {
    throw new Error('Country Code not found')
  }
  return result.name
}

export const alpha2ToAlpha3CountryCodes = alpha2CountryCode => {
  if (alpha2CountryCode.length !== 2) {
    throw new Error('Country Code provided must have exactly 2 letters')
  }
  const result = ISO_3166CountryCodes.find(country => {
    return country.alpha2 === alpha2CountryCode
  })
  if (!result) {
    throw new Error('Country Code not found')
  }
  return result.alpha3
}

export const alpha2ToNumericCountryCodes = alpha2CountryCode => {
  if (alpha2CountryCode.length !== 2) {
    throw new Error('Country Code provided must have exactly 2 letters')
  }
  const result = ISO_3166CountryCodes.find(country => {
    return country.alpha2 === alpha2CountryCode
  })
  if (!result) {
    throw new Error('Country Code not found')
  }
  return result.numeric
}

export const alpha3ToNameCountryCodes = alpha3CountryCode => {
  if (alpha3CountryCode.length !== 3) {
    throw new Error('Country Code provided must have exactly 3 letters')
  }
  const result = ISO_3166CountryCodes.find(country => {
    return country.alpha3 === alpha3CountryCode
  })
  if (!result) {
    throw new Error('Country Code not found')
  }
  return result.name
}

export const alpha3ToAlpha2CountryCodes = alpha3CountryCode => {
  if (alpha3CountryCode.length !== 3) {
    throw new Error('Country Code provided must have exactly 3 letters')
  }
  const result = ISO_3166CountryCodes.find(country => {
    return country.alpha3 === alpha3CountryCode
  })
  if (!result) {
    throw new Error('Country Code not found')
  }
  return result.alpha2
}

export const alpha3ToNumericCountryCodes = alpha3CountryCode => {
  if (alpha3CountryCode.length !== 3) {
    throw new Error('Country Code provided must have exactly 3 letters')
  }
  const result = ISO_3166CountryCodes.find(country => {
    return country.alpha3 === alpha3CountryCode
  })
  if (!result) {
    throw new Error('Country Code not found')
  }
  return result.numeric
}

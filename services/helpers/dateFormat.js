import moment from 'moment'

const momentFormat = (options, date) => {
  const momentDate = moment(date)
  momentDate.locale(options.locale)
  return momentDate.format(options.format)
}

export const dateFormat = (date, options = {}) => {
  const defaultOptions = { format: 'DD-MMM-YYYY', locale: 'es' }
  return momentFormat({ ...defaultOptions, ...options }, date)
}

export const timeFormat = (date, options = {}) => {
  const defaultOptions = { format: 'h:mm:ss a', locale: 'es' }
  return momentFormat({ ...defaultOptions, ...options }, date)
}

export const datetimeFormat = (date, options = {}) => {
  const defaultOptions = { format: 'DD-MMM-YYYY HH:mm', locale: 'es' }
  return momentFormat({ ...defaultOptions, ...options }, date)
}

import { i18n } from '../i18n'
import { satPedimentos } from '../catalogs'

export function isPedimentoValid(pedimento) {
  const messagesArray = []
  const validationArray = [true]
  const validationStatusArray = []
  if (pedimento.length !== 15) {
    messagesArray.push(<div>{i18n('pedimentoValidation.lenght15Digits')}</div>)
    validationArray.push(false)
    validationStatusArray.push('warning')
  }
  const validationYear = pedimento.substring(0,2)
  const customNumber = pedimento.substring(2,4)
  const patentNumber = pedimento.substring(4,8)
  const excerciseYear = pedimento.substring(8,9)
  const progressiveNumber = pedimento.substring(9,15)
  const currentYear = new Date().getFullYear()
  const currentYearLast2Digits = currentYear.toString().substring(2,4)
  const currentYearLastDigit = currentYear.toString().substring(3,4)
  let lastYear = Number(currentYearLastDigit) - 1

  if (currentYearLastDigit === '0') {
    lastYear = 9
  }

  if (validationYear > currentYearLast2Digits) {
    messagesArray.push(<div>{i18n('pedimentoValidation.validationYearIncorrect')}</div>)
    validationArray.push(false)
    validationStatusArray.push('error')
  }

  const foundCustomNumber = satPedimentos.some(pedimento => pedimento.customNumber === customNumber)

  if (!foundCustomNumber) {
    messagesArray.push(<div>{i18n('pedimentoValidation.customNumberIncorrect')}</div>)
    validationArray.push(false)
    validationStatusArray.push('error')
  }

  const foundPatentNumber = satPedimentos.some(pedimento => pedimento.patentNumber === patentNumber)

  
  if (!foundPatentNumber) {
    messagesArray.push(<div>{i18n('pedimentoValidation.patentNumberIncorrect')}</div>)
    validationArray.push(false)
    validationStatusArray.push('error')
  }

  if (!( Number(excerciseYear) === lastYear || Number(excerciseYear) === Number(currentYearLastDigit)) ) {
    messagesArray.push(<div>{i18n('pedimentoValidation.excerciseYearIncorrect')}</div>)
    validationArray.push(false)
    validationStatusArray.push('error')
  }

  if (progressiveNumber < 1 || progressiveNumber > 999999 ) {
    messagesArray.push(<div>{i18n('pedimentoValidation.progressiveNumberIncorrect')}</div>)
    validationArray.push(false)
    validationStatusArray.push('error')
  }

  let isValid = true
  validationArray.map(element => { 
    isValid = isValid && element
    return null
  })

  let status = 'validating'
  if (validationStatusArray.find(element => element === 'warning')) {
    status = 'warning'
  }
  if (validationStatusArray.find(element => element === 'error')) {
    status = 'error'
  }

  const formattedValue = `${validationYear}  ${customNumber}  ${patentNumber}  ${currentYearLastDigit}${progressiveNumber}`

  return { valid: isValid, validateStatus: status, message: messagesArray, formattedValue: formattedValue }
}
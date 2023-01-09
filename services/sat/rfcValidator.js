// Función para validar un RFC
// Devuelve el RFC sin espacios ni guiones si es correcto
// Devuelve false si es inválido
// (debe estar en mayúsculas, guiones y espacios intermedios opcionales)
// export function rfcValido(rfc) {
//   const rfcPatternPm =
//     '^(([A-ZÑ&]{3})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|' +
//     '(([A-ZÑ&]{3})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|' +
//     '(([A-ZÑ&]{3})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|' +
//     '(([A-ZÑ&]{3})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$'
//   const rfcPatternPf =
//     '^(([A-ZÑ&]{4})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|' +
//     '(([A-ZÑ&]{4})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|' +
//     '(([A-ZÑ&]{4})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|' +
//     '(([A-ZÑ&]{4})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$'
//   // eslint-disable-next-line no-undef
//   // console.log(rfc.match(rfcPatternPm))
//   return rfc.match(rfcPatternPm) || rfc.match(rfcPatternPf)
// }

import { i18n } from '../i18n'

// eslint-disable-next-line consistent-return
export function rfcValido(rfc) {
  if (rfc === 'XAXX010101000') return { valid: true, validateStatus: 'success', message: i18n('rfcValidation.genericNational') }
  if (rfc === 'XEXX010101000') return { valid: true, validateStatus: 'success', message: i18n('rfcValidation.genericInternational') }
  const re = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/
  const validado = rfc.match(re)
  const isValid = re.test(rfc)
  // console.log(`validado: ${validado}`)
  // console.log(`isValid: ${isValid}`)

  if (!validado)
    // Coincide con el formato general del regex?
    return { valid: false, validateStatus: 'warning', message: i18n('rfcValidation.invalid') }

  // Separar el dígito verificador del resto del RFC
  const digitoVerificador = validado.pop()
  // console.log(`digitoVerificador: ${digitoVerificador}`)

  const rfcSinDigito = validado.slice(1).join('')
  const len = rfcSinDigito.length
  // Obtener el digito esperado
  const diccionario = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ'
  const indice = len + 1
  let suma
  let digitoEsperado

  if (len === 12) suma = 0
  else suma = 481 // Ajuste para persona moral
  let i = 0
  // eslint-disable-next-line no-plusplus
  for (i = 0; i < len; i++) {
    suma += diccionario.indexOf(rfcSinDigito.charAt(i)) * (indice - i)
    // console.log(`suma dígito verificador: ${rfcSinDigito.charAt(i)} = ${diccionario.indexOf(rfcSinDigito.charAt(i))}X ${indice - i}`)
  }

  digitoEsperado = 11 - (suma % 11)
  if (digitoEsperado === 11) digitoEsperado = 0
  else if (digitoEsperado === 10) digitoEsperado = 'A'
  // console.log(`digitoEsperado: ${digitoEsperado}`)

  const digitoVerificadorValido = Number(digitoVerificador) === Number(digitoEsperado)
  // console.log(`digitoVerificadorValido: ${digitoVerificadorValido}`)

  if (!digitoVerificadorValido) return { valid: false, validateStatus: 'warning', message: i18n('rfcValidation.invalidDigit') }
  if (isValid && digitoVerificadorValido) return { valid: true, validateStatus: 'success', message: i18n('rfcValidation.valid') }

  // // El dígito verificador coincide con el esperado?
  // // o es un RFC Genérico (ventas a público general)?
  // if (digitoVerificador !== digitoEsperado && (!aceptarGenerico || rfcSinDigito + digitoVerificador !== 'XAXX010101000')) return false
  // if (!aceptarGenerico && rfcSinDigito + digitoVerificador === 'XEXX010101000') return false
  // return true
}

const fixedNum = decimals => value => {
  const num = typeof value !== 'number' ? Number(value) : value
  return Number(num.toFixed(decimals))
}

export const num = (value = 0, { decimals: defaultDecimals = 2 } = {}) => {
  const factor = defaultDecimals === 0 ? 1 : 10 ** defaultDecimals
  const fix = fixedNum(defaultDecimals)
  const fixedValue = fix(fix(value) * factor)
  return {
    plus(val) {
      const fixedVal = fix(fix(val) * factor)
      return num((fixedValue + fixedVal) / factor)
    },
    minus(val) {
      const fixedVal = fix(fix(val) * factor)
      return num((fixedValue - fixedVal) / factor)
    },
    times(val) {
      const fixedVal = fixedNum(defaultDecimals * 2)(val)
      const newFixedValue = fixedNum(defaultDecimals * 2)(value)
      const result = fix(newFixedValue * fixedVal)
      return num(result)
    },
    div(val) {
      const fixedVal = fix(fix(val) * factor)
      const result = fix(fixedValue / fixedVal)
      return num(result)
    },
    fixedVal(decimals = 2) {
      return fixedNum(decimals)(value)
    },
    val() {
      return value
    },
  }
}

export const toPercentage = max => value => num(value).times(100).div(max).val()

/**
 * Return the number of decimals of a given number.
 * @param {number} value
 * @return {number} number of decimals
 */
export const countDecimals = value => {
  const decimalPart = Number(value).toString().split('.')[1]
  return decimalPart ? decimalPart.length : 0
}

export const numberFormat = (value, options = {}) => {
  const defaultOptions = { minimumFractionDigits: 2, maximumFractionDigits: 6 }
  return (value || value === 0) && value.toLocaleString('en-US', { style: 'decimal', ...defaultOptions, ...options })
}

export const currencyFormat = amount => {
  let i = parseFloat(amount)
  if (Number.isNaN(i)) i = 0.0
  i = parseInt((Math.abs(i) + 0.005) * 100, 10) / 100
  let s = String(i)
  if (!s.includes('.')) s += '.00'
  if (s.indexOf('.') === s.length - 2) s += '0'
  return `${i < 0 ? '-' : ''}${s}`
}

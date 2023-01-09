import { countDecimals, num, toPercentage } from './mathHelp'

describe('Math operations helpers', () => {
  test('use 0 as default value', () => {
    expect(num().val()).toBe(0)
  })
  test('perform a simple addition correctly', () => {
    const result = num(0.1).plus(0.2).val()
    expect(result).toBe(0.3)
  })
  test('perform an addition correctly', () => {
    const result = num(1.13).plus(1.14).val()
    expect(result).toBe(2.27)
  })
  test('perform an addition correctly with 4 decimals', () => {
    const result = num(1.1323, { decimals: 4 }).plus(1.1).val()
    expect(result).toBe(2.2323)
  })
  test('perform an subtraction correctly', () => {
    const result = num(1.13).minus(1.14).val()
    expect(result).toBe(-0.01)
  })
  test('perform an subtraction correctly with 4 decimals', () => {
    const result = num(1.1323, { decimals: 4 }).minus(1.1).val()
    expect(result).toBe(0.0323)
  })
  test('perform a simple multiplication correctly', () => {
    const result = num(0.1).times(0.2).val()
    expect(result).toBe(0.02)
  })
  test('perform a multiplication correctly', () => {
    const result = num(12513.35).times(0.16).val()
    expect(result).toBe(2002.14)
  })
  test('perform another multiplication correctly', () => {
    const result = num(12513.34).times(0.16).val()
    expect(result).toBe(2002.13)
  })
  test('perform another simple multiplication correctly', () => {
    const result = num(0.1).times(0.2).val()
    expect(result).toBe(0.02)
  })
  test('perform a third multiplication correctly', () => {
    const result = num(12513.35).times(0.16).val()
    expect(result).toBe(2002.14)
  })
  test('more multiplication...', () => {
    const result = num(12513.34).times(0.16).val()
    expect(result).toBe(2002.13)
  })
  test('perform multiplication trimming decimals correctly', () => {
    const result = num(3.46671234).times(100).val()
    expect(result).toBe(346.67)
  })
  test('perform a simple division correctly', () => {
    const result = num(5.3).div(0.1).val()
    expect(result).toBe(53)
  })
  test('perform a division correctly', () => {
    const result = num(123.1).div(10).val()
    expect(result).toBe(12.31)
  })
  test('transform a number to percentage', () => {
    const result = toPercentage(5)(3.46)
    expect(result).toBe(69.2)
  })
  test('transform a number to percentage without decimals', () => {
    const result = toPercentage(5)(3.45)
    expect(result).toBe(69)
  })
  test('get the correct number of decimals from a provided number', () => {
    expect(countDecimals(0)).toBe(0)
    expect(countDecimals(0.0)).toBe(0)
    expect(countDecimals(0.01)).toBe(2)
    expect(countDecimals(0.05)).toBe(2)
    expect(countDecimals(0.052)).toBe(3)
    expect(countDecimals(0.0523)).toBe(4)
    expect(countDecimals(0.05234)).toBe(5)
    expect(countDecimals(0.052343)).toBe(6)
    expect(countDecimals(0.987654321)).toBe(9)
    expect(countDecimals(321.987654321)).toBe(9)
    expect(countDecimals('0')).toBe(0)
    expect(countDecimals('A')).toBe(0)
  })
})

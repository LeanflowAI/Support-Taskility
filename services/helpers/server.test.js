import { getNewId } from './server'

describe('getNewId', () => {
  test('does not return an empty string', () => {
    expect(getNewId().length).toBeGreaterThan(0)
  })

  test('return an string with 24 characters', () => {
    expect(getNewId()).toHaveLength(24)
  })
})

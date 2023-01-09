import { routeHandler as login } from 'pages/api/users/login'

const mockRes = () => ({
  headers: {},
  writeValue: '',
  jsonValue: {},
  setHeader(name, value) {
    this.headers = { ...this.headers, [name]: value }
  },
  write(value) {
    this.writeValue = value
  },
  end() {},
  json(value) {
    this.jsonValue = JSON.parse(value)
  },
})

describe('login', () => {
  test('/login without email or password returns missing data error', async () => {
    const req = { method: 'POST', body: {} }
    const res = mockRes()
    const err = await login(req, res, e => e)
    expect(err.message).toBe('login.errors.missingData')
  })

  test('/login with incorrect email or password returns error', async () => {
    const body = { email: 'nonexistentemail@email.com', password: 'nomatherwhat' }
    const req = { method: 'POST', body, dbService: { getUserByEmail: async () => null } }
    const res = mockRes()
    const err = await login(req, res, e => e)
    expect(err.message).toBe('login.errors.userNotFound')
  })
})

// TODO: Check that returned i18n key actually exists.
// Is it a good pattern or it is better to check in a separate test?
// Also check that all i18n files have the same keys
// How to check for unused i18n keys

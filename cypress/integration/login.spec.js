/* eslint-disable jest/expect-expect */
describe('Login form', () => {
  it('Inputs are working correctly', () => {
    cy.loginRouteSetup({ response: { error: 'login.errors.userNotFound' } })

    const email = 'aaaa@aaa.aaa'
    const password = 'wrong pass'
    cy.get('[id=email]').type(email).should('have.value', email)
    cy.get('[id=password]').type(password).should('have.value', password)
    cy.get('[name="login-btn"]').click()

    // cy.wait('@login') // Disabled. Cypress don't support fetch requests, only XHR

    cy.get('[class^="UserNotification__Message"]').should('have.text', 'User not found')
  })
})

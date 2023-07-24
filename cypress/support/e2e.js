// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

/**
 * Logs the user by making API call to POST /login.
 * Make sure "cypress.json" + CYPRESS_ environment variables
 * have username and password values set.
 */
export const login = () => {
  const username = Cypress.env('us')
  const password = Cypress.env('pa')

  // it is ok for the username to be visible in the Command Log
  expect(username, 'username was set').to.be.a('string').and.not.be.empty
  // but the password value should not be shown
  if (typeof password !== 'string' || !password) {
    throw new Error('Missing password value')
  }

  cy.request({
    method: 'POST',
    url: Cypress.env('backendUrl') + 'get_auth_token',
    form: true,
    body: {
      username,
      password
    }
  }).as('getauthtoken')
  cy.get('@getauthtoken').should((response) => {
    console.log(response.body.token) // FIXME: how to save in variable and use later?
    // cy.getCookie('sessionid').should('exist')
  })
}

export const loginUI = () => {
//  const username = Cypress.env('some')
  const username = Cypress.env('us')
  const password = Cypress.env('pa')

  // it is ok for the username to be visible in the Command Log
  expect(username, 'username was set').to.be.a('string').and.not.be.empty
  // but the password value should not be shown
  if (typeof password !== 'string' || !password) {
    throw new Error('Missing password value')
  }

  cy.visit('http://localhost:3000/login')
  cy.get('._fields_mtkaf_16 > :nth-child(1) > ._basic-layout_58nyi_1 > ._children-container_58nyi_17 > ._raw-input_8rtzt_1').type(username)
  cy.get(':nth-child(2) > ._basic-layout_58nyi_1 > ._children-container_58nyi_17 > ._raw-input_8rtzt_1').type(password)
  cy.get('._actions_mtkaf_29 > ._raw-button_v5zcf_1 > ._children-container_58nyi_17').click()
}

export const urlExists = (url, callback) => { // stackoverflow.com/questions/1591401/javascript-jquery-check-broken-links
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      callback(xhr.status < 400);
    }
  };
  xhr.open('HEAD', url);
  xhr.send();
}

Cypress.on('uncaught:exception', (err, runnable) => {
  // we expect a 3rd party library error with message 'ResizeObserver loop limit exceeded'
  // and don't want to fail the test so we return false
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  // we still want to ensure there are no other unexpected errors, so we let them fail the test
})

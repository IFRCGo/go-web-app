/// <reference types="cypress" />

import { login, loginUI, urlExists } from '../../support/e2e.js'

context('Actions', () => {

  it('checks resources', () => {
    cy.visit('http://localhost:3000/resources')
    cy.contains('._content_ejc95_17 > ._heading_1sool_1', 'Resources')
  })

  it('checks a 3W endpoint', () => {
    cy.visit('http://localhost:3000/three-w')
    cy.contains('[href="/login"] > ._children-wrapper_5lf9o_18', 'Login')
    loginUI()
    cy.contains('[href="/login"] > ._children-wrapper_5lf9o_18', 'Login').should('not.exist')
  })

  it('checks main emergency page', () => {
    cy.visit('http://localhost:3000/emergencies')
    login()
  })

})

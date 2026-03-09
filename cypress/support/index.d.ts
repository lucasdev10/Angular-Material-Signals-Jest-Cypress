/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to tab to the next focusable element
     * @example cy.get('input').tab()
     */
    tab(options?: Partial<TypeOptions>): Chainable<JQuery<HTMLElement>>;
  }
}

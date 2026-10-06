// Ignore errors thrown by third-party scripts (e.g. analytics) so they don't fail tests
Cypress.on('uncaught:exception', () => false);

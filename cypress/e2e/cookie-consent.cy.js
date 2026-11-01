const cookieConsent = require('../pages/CookieConsentPage');
const homePage = require('../pages/HomePage');

describe('markolosic.github.io — Cookie consent', () => {
  beforeEach(() => {
    cy.intercept('GET', 'https://www.googletagmanager.com/gtag/js*', {
      statusCode: 200,
      body: '',
    }).as('googleAnalytics');

    cy.visit('/');
    cy.clearLocalStorage();
    cy.reload();
  });

  it('does not load analytics until consent is accepted', () => {
    cookieConsent.banner.should('be.visible');
    cookieConsent.banner.should(
      'contain.text',
      'Nothing is loaded unless you accept.',
    );
    cy.get('script[src*="googletagmanager.com/gtag/js"]').should('not.exist');

    cookieConsent.declineButton.click();
    cy.window().its('localStorage.consent').should('eq', 'denied');
    cookieConsent.banner.should('not.be.visible');
    cy.get('script[src*="googletagmanager.com/gtag/js"]').should('not.exist');

    cy.reload();
    cookieConsent.banner.should('not.exist');
    cy.window().its('localStorage.consent').should('eq', 'denied');
    cy.get('script[src*="googletagmanager.com/gtag/js"]').should('not.exist');
  });

  it('loads analytics after acceptance and keeps consent across pages', () => {
    cookieConsent.acceptButton.click();

    cy.wait('@googleAnalytics');
    cy.window().its('localStorage.consent').should('eq', 'granted');
    cy.get('script[src*="googletagmanager.com/gtag/js"]').should('exist');
    cookieConsent.banner.should('not.be.visible');

    cy.visit('/blog/');
    cookieConsent.banner.should('not.exist');
    cy.window().its('localStorage.consent').should('eq', 'granted');
  });

  it('reopens cookie settings and translates the consent controls', () => {
    cookieConsent.declineButton.click();
    cookieConsent.openSettings();
    cookieConsent.banner.should('be.visible');

    homePage.toggleLanguage();
    cookieConsent.banner.should('have.attr', 'aria-label', 'Pristanak na kolačiće');
    cookieConsent.banner.should('contain.text', 'Ništa se ne učitava dok ne prihvatiš.');
    cookieConsent.declineButton.should('have.text', 'Odbij');
    cookieConsent.acceptButton.should('have.text', 'Prihvati');
  });
});

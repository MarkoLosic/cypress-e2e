class CookieConsentPage {
  get banner() {
    return cy.get('.consent[role="region"]');
  }

  get acceptButton() {
    return this.banner.find('button[data-v="granted"]');
  }

  get declineButton() {
    return this.banner.find('button[data-v="denied"]');
  }

  get settingsButton() {
    return cy.get('footer [data-consent]');
  }

  openSettings() {
    this.settingsButton.click();
  }
}

module.exports = new CookieConsentPage();

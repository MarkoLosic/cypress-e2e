const BasePage = require('./BasePage');

class HomePage extends BasePage {
  get heroHeading() {
    return cy.get('.hero h1');
  }

  get heroPhoto() {
    return cy.get('.hero img.photo');
  }

  get floatingChips() {
    return cy.get('.hero .float-chip');
  }

  get talkButton() {
    return cy.get('.hero .cta a.btn.primary');
  }

  get downloadCvButton() {
    return cy.get('.hero .cta a[download]');
  }

  get socialLinks() {
    return cy.get('.hero .socials a');
  }

  get stats() {
    return cy.get('.stats .stat');
  }

  section(id) {
    return cy.get(`section#${id}`);
  }

  sectionHeading(id) {
    return this.section(id).find('h2');
  }

  get contactList() {
    return cy.get('#contact .contact-list');
  }

  get copyEmailButton() {
    return cy.get('#copy');
  }

  get copyEmailLabel() {
    return cy.get('#copy-label');
  }

  open() {
    this.visit('/');
  }

  clickTalk() {
    this.talkButton.click();
  }

  copyEmail() {
    this.copyEmailButton.click();
  }

  verifyHeroHeading(text) {
    this.heroHeading.invoke('text').then((t) => {
      expect(t.replace(/\s+/g, ' ').trim()).to.eq(text);
    });
  }

  verifyImageLoaded() {
    this.heroPhoto
      .should('be.visible')
      .and(($img) => expect($img[0].naturalWidth).to.be.greaterThan(0));
  }
}

module.exports = new HomePage();

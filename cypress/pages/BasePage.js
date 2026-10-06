class BasePage {
  visit(path = '/') {
    cy.visit(path);
  }

  get html() {
    return cy.get('html');
  }

  get header() {
    return cy.get('#nav');
  }

  get brand() {
    return cy.get('#nav .brand');
  }

  get navLinks() {
    return cy.get('#links a');
  }

  get themeToggle() {
    return cy.get('#theme');
  }

  get languageToggle() {
    return cy.get('#lang');
  }

  get footer() {
    return cy.get('footer.footer');
  }

  navLink(text) {
    return this.navLinks.contains(text);
  }

  toggleTheme() {
    this.themeToggle.click();
  }

  toggleLanguage() {
    this.languageToggle.click();
  }

  verifyTitle(title) {
    cy.title().should('eq', title);
  }

  verifyTheme(theme) {
    this.html.should('have.attr', 'data-theme', theme);
  }
}

module.exports = BasePage;

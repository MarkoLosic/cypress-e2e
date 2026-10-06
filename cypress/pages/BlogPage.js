const BasePage = require('./BasePage');

class BlogPage extends BasePage {
  get heading() {
    return cy.get('h1.blog-title');
  }

  get lead() {
    return cy.get('.blog-hero .lead');
  }

  get searchInput() {
    return cy.get('#q');
  }

  get tagButtons() {
    return cy.get('#tags .tag');
  }

  get activeTag() {
    return cy.get('#tags .tag.on');
  }

  get postCards() {
    return cy.get('#posts .post-card');
  }

  get visiblePostCards() {
    return cy.get('#posts .post-card:not([hidden])');
  }

  get featuredPost() {
    return cy.get('#posts .post-card.featured');
  }

  get noMatchMessage() {
    return cy.get('#none');
  }

  tagButton(tag) {
    return cy.get(`#tags .tag[data-t="${tag}"]`);
  }

  postCard(slug) {
    return cy.get(`#posts .post-card[href="${slug}/"]`);
  }

  open(query = '') {
    this.visit(`/blog/${query}`);
  }

  openFilteredByTag(tag) {
    this.open(`?tag=${encodeURIComponent(tag)}`);
  }

  search(term) {
    this.searchInput.clear().type(term);
  }

  clearSearch() {
    this.searchInput.clear();
  }

  filterByTag(tag) {
    this.tagButton(tag).click();
  }

  showAll() {
    this.tagButton('').click();
  }

  openPost(slug) {
    this.postCard(slug).click();
  }

  verifyVisiblePostSlugs(slugs) {
    this.visiblePostCards.should('have.length', slugs.length);
    this.visiblePostCards.each(($card, i) => {
      expect($card.attr('href')).to.eq(`${slugs[i]}/`);
    });
  }
}

module.exports = new BlogPage();

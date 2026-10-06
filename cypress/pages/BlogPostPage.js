const BasePage = require('./BasePage');

class BlogPostPage extends BasePage {
  get backLink() {
    return cy.get('main a.back');
  }

  get title() {
    return cy.get('article .post-head h1');
  }

  get publishedDate() {
    return cy.get('article .post-head time');
  }

  get tags() {
    return cy.get('article .post-head .tags span');
  }

  get content() {
    return cy.get('article .prose');
  }

  get contentHeadings() {
    return cy.get('article .prose h2');
  }

  get externalLinks() {
    return cy.get('article .prose a[target="_blank"]');
  }

  get copyLinkButton() {
    return cy.get('#share');
  }

  get contactButton() {
    return cy.get('.post-end a.btn.primary');
  }

  get morePosts() {
    return cy.get('.more-posts .post-card');
  }

  open(slug) {
    this.visit(`/blog/${slug}/`);
  }

  goBack() {
    this.backLink.click();
  }

  copyLink() {
    this.copyLinkButton.click();
  }

  verifyHeading(title) {
    this.title.should('have.text', title);
  }

  verifyTags(tags) {
    this.tags.should('have.length', tags.length);
    this.tags.each(($t, i) => expect($t.text()).to.eq(tags[i]));
  }
}

module.exports = new BlogPostPage();

const blogPostPage = require('../pages/BlogPostPage');

const byDateDesc = (a, b) => b.date.localeCompare(a.date);
const siteUrl = 'https://markolosic.github.io';

describe('markolosic.github.io — Blog post', () => {
  let data;
  let posts;
  let post;

  before(() => {
    cy.fixture('blog').then((d) => {
      data = d;
    });
    cy.request('/blog/posts.json').then(({ body }) => {
      posts = body.slice().sort(byDateDesc);
      [post] = posts;
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    blogPostPage.open(post.slug);
  });

  it('loads with the correct title and SEO meta data', () => {
    blogPostPage.verifyTitle(`${post.title} — Marko Lošić`);
    cy.get('meta[name="description"]').should('have.attr', 'content', post.excerpt);
    cy.get('link[rel="canonical"]').should('have.attr', 'href', `${siteUrl}/blog/${post.slug}/`);
    cy.get('meta[property="og:type"]').should('have.attr', 'content', 'article');
    cy.get('meta[property="article:published_time"]').should('have.attr', 'content', post.date);
  });

  it('has valid BlogPosting structured data', () => {
    cy.get('script[type="application/ld+json"]').then(($s) => {
      const ld = JSON.parse($s.text());
      expect(ld['@type']).to.eq('BlogPosting');
      expect(ld.headline).to.eq(post.title);
      expect(ld.description).to.eq(post.excerpt);
    });
  });

  it('shows the post header with title, date, reading time and tags', () => {
    blogPostPage.verifyHeading(post.title);
    blogPostPage.publishedDate.should('have.attr', 'datetime', post.date);
    cy.get('article .post-head .meta').should('contain.text', `${post.readingTime} min read`);
    blogPostPage.verifyTags(post.tags);
  });

  it('renders the article content with section headings', () => {
    blogPostPage.content.should('be.visible').invoke('text').its('length').should('be.greaterThan', 500);
    blogPostPage.contentHeadings.should('have.length.greaterThan', 0);
    blogPostPage.contentHeadings.each(($h) => {
      expect($h.attr('id'), 'heading anchor').to.not.be.empty;
    });
  });

  it('opens external links safely in a new tab', () => {
    blogPostPage.externalLinks.each(($a) => {
      expect($a.attr('rel')).to.contain('noopener');
    });
  });

  it('copies the post link and shows confirmation', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText').resolves();
    });
    blogPostPage.copyLinkButton.should('have.text', data.copyLink);
    blogPostPage.copyLink();
    cy.get('@writeText').should('have.been.calledOnceWith', `${siteUrl}/blog/${post.slug}/`);
    blogPostPage.copyLinkButton.should('have.text', data.copied);
    blogPostPage.copyLinkButton.should('have.text', data.copyLink);
  });

  it('links to the contact section', () => {
    blogPostPage.contactButton.click();
    cy.location('pathname').should('eq', '/');
    cy.location('hash').should('eq', '#contact');
  });

  it('suggests other existing posts', () => {
    const slugs = posts.map((p) => p.slug);
    blogPostPage.morePosts.should('have.length.greaterThan', 0);
    blogPostPage.morePosts.each(($card) => {
      const slug = $card.attr('href').replace(/^\.\.\/|\/$/g, '');
      expect(slug).to.not.eq(post.slug);
      expect(slugs).to.include(slug);
    });
  });

  it('navigates back to the blog list', () => {
    blogPostPage.goBack();
    cy.location('pathname').should('eq', '/blog/');
  });

  it('switches the post content to Serbian and back', () => {
    blogPostPage.content.invoke('text').then((englishText) => {
      blogPostPage.toggleLanguage();
      blogPostPage.html.should('have.attr', 'lang', 'sr');
      blogPostPage.verifyHeading(post.titleSr);
      blogPostPage.content.invoke('text').should('not.eq', englishText);

      blogPostPage.toggleLanguage();
      blogPostPage.verifyHeading(post.title);
      blogPostPage.content.invoke('text').should('eq', englishText);
    });
  });

  it('remembers the selected language across posts', () => {
    blogPostPage.toggleLanguage();
    blogPostPage.open(posts[1].slug);
    blogPostPage.html.should('have.attr', 'lang', 'sr');
    blogPostPage.verifyHeading(posts[1].titleSr);
  });

  it('serves a page for every post in posts.json', () => {
    posts.forEach((p) => {
      cy.request(`/blog/${p.slug}/`).then(({ status, body }) => {
        expect(status, p.slug).to.eq(200);
        expect(body, p.slug).to.contain(`<link rel="canonical" href="${siteUrl}/blog/${p.slug}/">`);
        expect(body, p.slug).to.contain(`<meta property="article:published_time" content="${p.date}">`);
      });
    });
  });
});

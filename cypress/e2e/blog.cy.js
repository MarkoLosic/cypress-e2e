const blogPage = require('../pages/BlogPage');
const homePage = require('../pages/HomePage');

// Posts are published often, so expected data comes from the site's own posts.json instead of being hardcoded.
const byDateDesc = (a, b) => b.date.localeCompare(a.date);

describe('markolosic.github.io — Blog list', () => {
  let data;
  let posts;

  before(() => {
    cy.fixture('blog').then((d) => {
      data = d;
    });
    cy.request('/blog/posts.json').then(({ body }) => {
      posts = body.slice().sort(byDateDesc);
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    blogPage.open();
  });

  it('loads with the correct title, heading and meta data', () => {
    blogPage.verifyTitle(data.title);
    blogPage.heading.should('have.text', data.heading.en);
    blogPage.lead.should('not.be.empty');
    cy.get('link[rel="canonical"]').should('have.attr', 'href', 'https://markolosic.github.io/blog/');
    cy.get('link[rel="alternate"][type="application/rss+xml"]').should('have.attr', 'href').and('contain', 'rss.xml');
  });

  it('marks Blog as the active navigation link', () => {
    blogPage.navLinks.filter('.active').should('have.length', 1).and('have.text', 'Blog');
  });

  it('renders a card for every published post', () => {
    blogPage.postCards.should('have.length', posts.length);
    blogPage.postCards.then(($cards) => {
      const slugs = [...$cards].map((c) => c.getAttribute('href').replace(/\/$/, ''));
      expect(slugs).to.have.members(posts.map((p) => p.slug));
    });
  });

  it('lists posts from newest to oldest', () => {
    blogPage.postCards.find('time').then(($times) => {
      const dates = [...$times].map((t) => t.getAttribute('datetime'));
      expect(dates).to.deep.eq(dates.slice().sort().reverse());
    });
  });

  it('shows title, excerpt, date, reading time and tags on each card', () => {
    posts.forEach((post) => {
      blogPage.postCard(post.slug).within(() => {
        cy.get('h2').should('have.text', post.title);
        cy.get('p').should('have.text', post.excerpt);
        cy.get('time').should('have.attr', 'datetime', post.date);
        cy.get('.meta').should('contain.text', `${post.readingTime} min read`);
        cy.get('.tags span').should('have.length', post.tags.length);
      });
    });
  });

  it('highlights the newest post as featured', () => {
    blogPage.featuredPost.should('have.length', 1);
    blogPage.postCards.first().should('have.class', 'featured');
  });

  it('filters posts by search term', () => {
    const term = posts[0].title.split(' ').slice(-2).join(' ').toLowerCase();

    blogPage.search(term);
    blogPage.postCard(posts[0].slug).should('be.visible');
    blogPage.visiblePostCards.each(($card) => {
      expect($card.attr('data-search')).to.contain(term);
    });
    blogPage.noMatchMessage.should('not.be.visible');

    blogPage.clearSearch();
    blogPage.visiblePostCards.should('have.length', posts.length);
  });

  it('shows an empty state when nothing matches the search', () => {
    blogPage.search('zzz-no-such-post-zzz');
    blogPage.visiblePostCards.should('have.length', 0);
    blogPage.noMatchMessage.should('be.visible').and('have.text', data.noMatch);
  });

  it('filters posts by tag', () => {
    const tag = posts[0].tags[posts[0].tags.length - 1];
    const expected = posts.filter((p) => p.tags.includes(tag)).map((p) => p.slug);

    blogPage.filterByTag(tag);
    blogPage.activeTag.should('have.length', 1).and('have.attr', 'data-t', tag);
    blogPage.visiblePostCards.should('have.length', expected.length);
    blogPage.visiblePostCards.each(($card) => {
      expect($card.attr('data-tags').split('|')).to.include(tag);
    });

    blogPage.showAll();
    blogPage.visiblePostCards.should('have.length', posts.length);
  });

  it('combines tag filter and search', () => {
    const tag = 'qa';
    const term = 'testing';
    const expected = posts.filter((p) => p.tags.includes(tag));

    blogPage.filterByTag(tag);
    blogPage.search(term);
    blogPage.visiblePostCards.should('have.length.at.most', expected.length);
    blogPage.visiblePostCards.each(($card) => {
      expect($card.attr('data-tags').split('|')).to.include(tag);
      expect($card.attr('data-search')).to.contain(term);
    });
  });

  it('applies the tag filter from the ?tag= URL parameter', () => {
    const tag = posts[0].tags[0];
    const expectedCount = posts.filter((p) => p.tags.includes(tag)).length;

    blogPage.openFilteredByTag(tag);
    blogPage.activeTag.should('have.attr', 'data-t', tag);
    blogPage.visiblePostCards.should('have.length', expectedCount);
  });

  it('opens a post when its card is clicked', () => {
    const post = posts[0];
    blogPage.openPost(post.slug);
    cy.location('pathname').should('eq', `/blog/${post.slug}/`);
    cy.get('article h1').should('have.text', post.title);
  });

  it('switches the blog UI and post titles to Serbian', () => {
    blogPage.toggleLanguage();
    blogPage.html.should('have.attr', 'lang', 'sr');
    blogPage.heading.should('have.text', data.heading.sr);
    blogPage.searchInput.should('have.attr', 'placeholder', data.searchPlaceholder.sr);

    const translated = posts.find((p) => p.titleSr);
    blogPage.postCard(translated.slug).find('h2').should('have.text', translated.titleSr);

    blogPage.toggleLanguage();
    blogPage.heading.should('have.text', data.heading.en);
    blogPage.searchInput.should('have.attr', 'placeholder', data.searchPlaceholder.en);
  });

  it('shows the latest posts on the home page and links to the blog', () => {
    homePage.open();
    homePage.section('blog').should('be.visible');
    homePage.latestPosts.should('have.length', Math.min(data.latestPostsOnHome, posts.length));
    homePage.latestPosts.first().should('have.attr', 'href', `blog/${posts[0].slug}/`);

    homePage.allPostsButton.click();
    cy.location('pathname').should('eq', '/blog/');
  });
});

const homePage = require('../pages/HomePage');

describe('markolosic.github.io — Home page', () => {
  let data;

  before(() => {
    cy.fixture('portfolio').then((d) => {
      data = d;
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    homePage.open();
  });

  it('loads with the correct title and meta data', () => {
    homePage.verifyTitle(data.title);
    cy.get('meta[name="description"]').should('have.attr', 'content').and('contain', 'QA Engineer');
    cy.get('link[rel="canonical"]').should('have.attr', 'href', 'https://markolosic.github.io/');
  });

  it('displays the header with brand and navigation links', () => {
    homePage.header.should('be.visible');
    homePage.brand.invoke('text').then((t) => {
      expect(t.replace(/\s+/g, ' ').trim()).to.eq(data.brandName);
    });
    homePage.navLinks.should('have.length', data.navLinks.en.length);
    homePage.navLinks.each(($a, i) => {
      expect($a.text().trim()).to.eq(data.navLinks.en[i]);
    });
  });

  it('displays the hero section with heading, photo and CTAs', () => {
    homePage.verifyHeroHeading(data.heroHeading.en);
    homePage.verifyImageLoaded();
    homePage.floatingChips.should('have.length', data.tools.length);
    data.tools.forEach((tool) => homePage.floatingChips.should('contain.text', tool));
    homePage.talkButton.should('have.attr', 'href', '#contact');
    homePage.downloadCvButton.should('have.attr', 'href', 'assets/Marko-Losic-CV.pdf');
  });

  it('has a downloadable CV', () => {
    homePage.downloadCvButton.invoke('attr', 'href').then((href) => {
      cy.request(href).its('status').should('eq', 200);
    });
  });

  it('has valid social links', () => {
    homePage.socialLinks.should('have.length', 3);
    homePage.socialLinks.filter('[aria-label="GitHub"]').should('have.attr', 'href', data.githubUrl);
    homePage.socialLinks.filter('[aria-label="Email"]').should('have.attr', 'href', `mailto:${data.email}`);
    homePage.socialLinks.filter('[target="_blank"]').each(($a) => {
      expect($a).to.have.attr('rel', 'noopener');
    });
  });

  it('shows the stats block', () => {
    homePage.stats.should('have.length', 4);
  });

  it('renders all main sections with headings', () => {
    data.sections.forEach((id) => {
      homePage.section(id).should('exist');
      homePage.sectionHeading(id).should('not.be.empty');
    });
  });

  it('scrolls to the Contact section from the hero CTA', () => {
    homePage.clickTalk();
    cy.location('hash').should('eq', '#contact');
    homePage.section('contact').should('be.visible');
  });

  it('shows correct contact details', () => {
    homePage.contactList.within(() => {
      cy.contains('a', data.email).should('have.attr', 'href', `mailto:${data.email}`);
      cy.contains('a', data.phone).should('have.attr', 'href', 'tel:+38763759197');
      cy.contains('a', 'github.com/MarkoLosic').should('have.attr', 'href', data.githubUrl);
    });
  });

  it('copies the email and shows confirmation', () => {
    homePage.copyEmailButton.should('have.attr', 'data-copy', data.email);
    homePage.copyEmail();
    homePage.copyEmailLabel.should('have.text', 'Copied ✓');
  });

  it('toggles between dark and light theme', () => {
    homePage.html.invoke('attr', 'data-theme').then((initial) => {
      const next = initial === 'light' ? 'dark' : 'light';
      homePage.toggleTheme();
      homePage.verifyTheme(next);
      homePage.toggleTheme();
      homePage.verifyTheme(initial);
    });
  });

  it('switches the language to Serbian and back', () => {
    homePage.toggleLanguage();
    homePage.html.should('have.attr', 'lang', 'sr');
    homePage.verifyHeroHeading(data.heroHeading.sr);
    homePage.navLinks.each(($a, i) => {
      expect($a.text().trim()).to.eq(data.navLinks.sr[i]);
    });

    homePage.toggleLanguage();
    homePage.html.should('have.attr', 'lang', 'en');
    homePage.verifyHeroHeading(data.heroHeading.en);
  });

  it('displays the footer', () => {
    homePage.footer.should('contain.text', data.brandName).and('contain.text', new Date().getFullYear());
    homePage.footer.find('a[href="#top"]').should('exist');
  });
});

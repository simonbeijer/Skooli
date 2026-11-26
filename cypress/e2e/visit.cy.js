describe('Home Page', () => {
  it('Visit home page and should click the Get Started button and navigate to login page', () => {
    cy.visit('/');
    cy.contains('Utforska Verktygen').should('be.visible').click();
    cy.url().should('include', '/login');
    // The login header shows only the logo, no nav
    cy.get('header').should('exist');
    // Check that we're on the login page
    cy.get('h1').should('contain', 'Skooli');
  });
});

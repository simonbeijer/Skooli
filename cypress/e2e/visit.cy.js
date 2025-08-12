describe('Home Page', () => {
  it('Visit home page and should click the Get Started button and navigate to login page', () => {
    cy.visit('/');
    cy.contains('Skapa Min Första Lektion').should('be.visible').click();
    cy.url().should('include', '/login');
    cy.get('nav').should('exist');
    // Check that we're on the login page
    cy.get('h1').should('contain', 'Skooli');
  });
});

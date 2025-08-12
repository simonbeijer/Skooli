describe('Home Page', () => {
  it('Visit home page and should click the Get Started button and navigate to login page', () => {
    cy.visit('/');
    cy.contains('Get Started').should('be.visible').click();
    cy.url().should('include', '/login');
    cy.get('nav').should('exist');
    cy.get('nav').should('contain', 'My navbar logged out');
  });
});

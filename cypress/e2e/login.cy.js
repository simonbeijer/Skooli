describe('Home and Login Flow', () => {
  it('should navigate from home to login and log in successfully', () => {

    cy.visit('/');

    cy.contains('Skapa Min Första Lektion').click();

    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('Password123');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    // Verify we're on the dashboard page
    cy.url().should('include', '/dashboard');
  });
});

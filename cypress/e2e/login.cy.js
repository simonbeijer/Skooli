describe('Home and Login Flow', () => {
  it('should navigate from home to login and log in successfully', () => {

    cy.visit('/');

    cy.contains('Get Started').click();

    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password123');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard');
  });
});

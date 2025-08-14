describe('Generate Form Validation', () => {
  it('should validate form fields and enable submit button when filled', () => {
    // Login first
    cy.visit('/');
    cy.contains('Skapa Min Första Lektion').click();
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('Password123');
    cy.get('button[type="submit"]').click();
    
    // Navigate to generate form
    cy.url().should('include', '/dashboard');
    cy.contains('Skapa Ny Lektion').click();
    cy.url().should('include', '/generate');
    
    // Test form validation - button should be disabled initially
    cy.contains('Generera Lektionsplan').should('have.class', 'cursor-not-allowed');
    
    // Fill required fields
    cy.get('input[name="theme"]').type('Skogens Djur');
    
    // Select grade dropdown
    cy.contains('label', 'Årskurs').parent().find('button').click();
    cy.contains('Årskurs 3').click();
    
    cy.get('input[name="subjects"]').type('Matematik + Svenska');
    
    // Select duration dropdown
    cy.contains('label', 'Längd').parent().find('button').click();
    cy.contains('2 veckor').click();
    
    // Optional field
    cy.get('textarea[name="notes"]').type('Fokus på räkna och läsa om djur');
    
    // Button should now be enabled
    cy.contains('Generera Lektionsplan').should('not.have.class', 'cursor-not-allowed');
    
    // Test that form data is captured
    cy.get('input[name="theme"]').should('have.value', 'Skogens Djur');
    cy.get('input[name="subjects"]').should('have.value', 'Matematik + Svenska');
    cy.get('textarea[name="notes"]').should('have.value', 'Fokus på räkna och läsa om djur');
  });
});
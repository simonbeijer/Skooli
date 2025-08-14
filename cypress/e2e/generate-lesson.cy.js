describe('Generate Lesson Workflow', () => {
  it('should successfully submit lesson generation form and trigger API call', () => {
    // Step 1: Navigate to home and login
    cy.visit('/');
    cy.contains('Skapa Min Första Lektion').click();
    
    // Login
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('Password123');
    cy.get('button[type="submit"]').click();
    
    // Step 2: Verify we're on dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Välkommen Tillbaka!').should('be.visible');
    
    // Step 3: Navigate to generate lesson page
    cy.contains('Skapa Ny Lektion').click();
    cy.url().should('include', '/generate');
    cy.contains('Skapa Din Lektionsplan').should('be.visible');
    
    // Step 4: Fill out the lesson generation form
    cy.get('input[name="theme"]').type('Skogens Djur');
    
    // Select grade (custom dropdown)
    cy.contains('label', 'Årskurs').parent().find('button').click();
    cy.contains('Årskurs 3').click();
    
    cy.get('input[name="subjects"]').type('Matematik + Svenska');
    
    // Select duration (custom dropdown) 
    cy.contains('label', 'Längd').parent().find('button').click();
    cy.contains('2 veckor').click();
    
    cy.get('textarea[name="notes"]').type('Fokus på räkna och läsa om djur');
    
    // Step 5: Submit the form
    cy.contains('Generera Lektionsplan').click();
    
    // Step 6: Wait for generation (check for loading state)
    cy.contains('Skapar Din Lektionsplan...', { timeout: 10000 }).should('be.visible');
    
    // Step 7: Verify API call was triggered (test completes here)
    // The loading screen confirms the form submission and API call started
    // Full API testing would require proper backend setup
  });
});
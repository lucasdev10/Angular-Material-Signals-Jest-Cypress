/// <reference types="cypress" />

describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Keyboard Navigation', () => {
    it('should navigate through header elements with Tab key', () => {
      // Tab to Products link
      cy.get('a[aria-label="View products"]').first().focus();
      cy.focused().should('contain', 'Products');

      // Tab to cart button
      cy.focused().tab();
      cy.focused().should('have.attr', 'aria-label').and('include', 'Shopping cart');

      // Tab to login button
      cy.focused().tab();
      cy.focused().should('contain', 'Login');
    });

    it('should activate buttons with Enter key', () => {
      cy.visit('/products/list');
      cy.wait(1000);

      // Focus on first "Add to Cart" button
      cy.get('[id^="add-to-cart-button"]').first().focus();

      // Press Enter to add to cart
      cy.focused().type('{enter}');

      // Verify cart badge updated
      cy.get('[matbadge]').should('exist');
    });

    it('should navigate form fields with Tab', () => {
      cy.visit('/auth/login');

      // Tab through form fields
      cy.get('input[type="email"]').focus().should('be.focused');
      cy.focused().tab();
      cy.get('input[type="password"]').should('be.focused');
      cy.focused().tab();
      cy.get('button[type="button"]').contains('Login').should('be.focused');
    });
  });

  describe('ARIA Attributes', () => {
    it('should have proper aria-labels on interactive elements', () => {
      // Check shopping cart button
      cy.get('button[aria-label*="Shopping cart"]').should('exist');

      // Check navigation
      cy.get('nav[role="navigation"]').should('exist');
      cy.get('[role="menubar"]').should('exist');
    });

    it('should have aria-live regions for dynamic content', () => {
      cy.visit('/products/list');

      // Check loading state has aria-live
      cy.get('[role="status"][aria-live="polite"]').should('exist');
    });

    it('should have proper aria-labels on product cards', () => {
      cy.visit('/products/list');
      cy.wait(1000);

      // Check product cards have aria-label
      cy.get('[role="article"]')
        .first()
        .should('have.attr', 'aria-label')
        .and('include', 'Product:');

      // Check add to cart buttons have descriptive labels
      cy.get('button[aria-label*="Add"]')
        .first()
        .should('have.attr', 'aria-label')
        .and('include', 'to cart');
    });

    it('should have aria-required on form fields', () => {
      cy.visit('/auth/login');

      cy.get('input[type="email"]').should('have.attr', 'aria-required', 'true');
      cy.get('input[type="password"]').should('have.attr', 'aria-required', 'true');
    });

    it('should have aria-invalid on invalid form fields', () => {
      cy.visit('/auth/login');

      // Submit empty form
      cy.get('button').contains('Login').click();

      // Check aria-invalid is set
      cy.get('input[type="email"]').should('have.attr', 'aria-invalid');
    });
  });

  describe('Semantic HTML', () => {
    it('should have proper document structure', () => {
      // Check main landmark
      cy.get('main[role="main"]').should('exist');

      // Check header landmark
      cy.get('[role="banner"]').should('exist');

      // Check navigation landmark
      cy.get('nav[role="navigation"]').should('exist');
    });

    it('should have proper heading hierarchy', () => {
      cy.visit('/products/list');

      // Check h1 exists
      cy.get('h1').should('exist').and('contain', 'Our Products');
    });

    it('should use semantic lists', () => {
      cy.visit('/products/list');
      cy.wait(1000);

      // Check products grid is a list
      cy.get('[role="list"]').should('exist');
      cy.get('[role="listitem"]').should('have.length.greaterThan', 0);
    });

    it('should have proper table structure in admin', () => {
      // Login as admin
      cy.visit('/auth/login');
      cy.get('input[type="email"]').type('admin@admin.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button').contains('Login').click();

      cy.wait(1000);
      cy.visit('/admin/products');
      cy.wait(1000);

      // Check table has proper role
      cy.get('[role="table"]').should('exist');

      // Check table headers have scope
      cy.get('th[scope="col"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Images and Icons', () => {
    it('should have alt text on all images', () => {
      cy.visit('/products/list');
      cy.wait(1000);

      // Check all images have alt attribute
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('should hide decorative icons from screen readers', () => {
      // Check icons have aria-hidden
      cy.get('mat-icon[aria-hidden="true"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      cy.visit('/products/list');

      // Tab to first button
      cy.get('button').first().focus();

      // Check focus is visible (this is a visual check, may need manual verification)
      cy.focused().should('be.visible');
    });

    it('should maintain focus order in cart', () => {
      // Add item to cart
      cy.visit('/products/list');
      cy.wait(1000);
      cy.get('[id^="add-to-cart-button"]').first().click();

      // Go to cart
      cy.get('button[aria-label*="Shopping cart"]').click();
      cy.wait(500);

      // Check quantity controls are focusable
      cy.get('button[aria-label*="Decrease quantity"]').first().should('be.visible');
      cy.get('button[aria-label*="Increase quantity"]').first().should('be.visible');
    });
  });

  describe('Live Regions', () => {
    it('should announce cart updates', () => {
      cy.visit('/products/list');
      cy.wait(1000);

      // Add item to cart
      cy.get('[id^="add-to-cart-button"]').first().click();

      // Go to cart
      cy.get('button[aria-label*="Shopping cart"]').click();
      cy.wait(500);

      // Check live region exists
      cy.get('[role="status"][aria-live="polite"]').should('exist');
    });

    it('should announce errors assertively', () => {
      cy.visit('/auth/login');

      // Try to login with invalid credentials
      cy.get('input[type="email"]').type('invalid@test.com');
      cy.get('input[type="password"]').type('wrong');
      cy.get('button').contains('Login').click();

      cy.wait(500);

      // Check error has assertive live region
      cy.get('[role="alert"][aria-live="assertive"]').should('exist');
    });
  });

  describe('Form Accessibility', () => {
    it('should associate labels with inputs', () => {
      cy.visit('/auth/login');

      // Check inputs have proper labels
      cy.get('mat-label').contains('E-mail').should('exist');
      cy.get('mat-label').contains('Password').should('exist');
    });

    it('should provide error descriptions', () => {
      cy.visit('/auth/login');

      // Submit empty form
      cy.get('button').contains('Login').click();

      // Check error messages are associated with inputs
      cy.get('input[type="email"]').should('have.attr', 'aria-describedby').and('include', 'error');
    });

    it('should have accessible password toggle', () => {
      cy.visit('/auth/login');

      // Check password toggle has aria-label
      cy.get('button[aria-label*="password"]').should('exist');

      // Check it has aria-pressed state
      cy.get('button[aria-label*="password"]').should('have.attr', 'aria-pressed');
    });
  });

  describe('Cart Accessibility', () => {
    beforeEach(() => {
      // Add item to cart
      cy.visit('/products/list');
      cy.wait(1000);
      cy.get('[id^="add-to-cart-button"]').first().click();
      cy.get('button[aria-label*="Shopping cart"]').click();
      cy.wait(500);
    });

    it('should have accessible quantity controls', () => {
      // Check quantity controls have proper labels
      cy.get('[role="group"][aria-label*="Quantity controls"]').should('exist');
      cy.get('button[aria-label*="Decrease quantity"]').should('exist');
      cy.get('button[aria-label*="Increase quantity"]').should('exist');
    });

    it('should announce quantity changes', () => {
      // Check quantity display has live region
      cy.get('[role="status"][aria-live="polite"]').should('exist');
    });

    it('should have accessible remove buttons', () => {
      // Check remove button has descriptive label
      cy.get('button[aria-label*="Remove"]').should('exist');
      cy.get('button[aria-label*="Remove"]')
        .first()
        .should('have.attr', 'aria-label')
        .and('include', 'from cart');
    });

    it('should have accessible checkout button', () => {
      cy.get('button[aria-label*="checkout"]').should('exist');
    });
  });

  describe('Admin Accessibility', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/auth/login');
      cy.get('input[type="email"]').type('admin@admin.com');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button').contains('Login').click();
      cy.wait(1000);
    });

    it('should have accessible product table', () => {
      cy.visit('/admin/products');
      cy.wait(1000);

      // Check table accessibility
      cy.get('[role="table"]').should('exist');
      cy.get('th[scope="col"]').should('have.length.greaterThan', 0);
    });

    it('should have accessible action buttons', () => {
      cy.visit('/admin/products');
      cy.wait(1000);

      // Check edit and delete buttons have labels
      cy.get('button[aria-label*="Edit"]').should('exist');
      cy.get('button[aria-label*="Delete"]').should('exist');
    });

    it('should have accessible form', () => {
      cy.visit('/admin/products/create');

      // Check form has proper role and label
      cy.get('form[role="form"]').should('exist');
      cy.get('form').should('have.attr', 'aria-labelledby');

      // Check all fields have aria-required
      cy.get('input[aria-required="true"]').should('have.length.greaterThan', 0);
    });
  });
});

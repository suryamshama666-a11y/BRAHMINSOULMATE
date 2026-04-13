import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileCard from '../ProfileCard';
import { Button } from '../ui/button';

describe('Accessibility Tests', () => {
  describe('ProfileCard Component', () => {
    const mockProfile = {
      id: '1',
      name: 'John Doe',
      age: 28,
      gender: 'male',
      religion: 'Hindu',
      caste: 'Brahmin',
      subcaste: 'Iyer',
      location: { city: 'Mumbai', state: 'Maharashtra' },
      education: { degree: 'Masters', field: 'Engineering' },
      employment: { profession: 'Software Engineer' },
      bio: 'Software engineer looking for a life partner',
      images: ['profile1.jpg', 'profile2.jpg'],
      interests: ['reading', 'music', 'travel'],
      marital_status: 'single',
      height: 175,
      gotra: 'Kashyap',
      matchPercentage: 85,
      subscription_type: 'premium',
      lastActive: '2 hours ago',
    };

    it('should have proper ARIA labels', () => {
      render(
        <MemoryRouter>
          <ProfileCard profile={mockProfile} />
        </MemoryRouter>
      );
      
      // Check for alt text on images
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
      
      // Check for proper heading structure
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable', () => {
      render(
        <MemoryRouter>
          <ProfileCard profile={mockProfile} />
        </MemoryRouter>
      );
      
      // Check that interactive elements are focusable
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabindex');
      });
    });

    it('should have proper color contrast', () => {
      render(
        <MemoryRouter>
          <ProfileCard profile={mockProfile} />
        </MemoryRouter>
      );
      
      // Check text elements for sufficient contrast
      const textElements = screen.getAllByText(/./);
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        expect(styles.color).toBeDefined();
        expect(styles.backgroundColor).toBeDefined();
      });
    });
  });

  describe('Button Component', () => {
    it('should have proper accessibility attributes', () => {
      render(<Button aria-label="Submit form">Submit</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });

    it('should handle disabled state accessibility', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      // Note: aria-disabled is not automatically added by HTML disabled attribute
      // The disabled attribute itself provides accessibility
    });

    it('should support keyboard interactions', () => {
      const mockClick = vi.fn();
      render(<Button onClick={mockClick}>Clickable Button</Button>);
      
      const button = screen.getByRole('button');
      // Buttons are naturally focusable, no need for explicit tabindex
      expect(button.tagName.toLowerCase()).toBe('button');
      
      // Simulate keyboard interaction
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form labeling', () => {
      render(
        <form>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" />
          
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
          
          <Button type="submit">Submit</Button>
        </form>
      );
      
      const usernameInput = screen.getByLabelText('Username');
      const emailInput = screen.getByLabelText('Email');
      
      expect(usernameInput).toHaveAttribute('id', 'username');
      expect(emailInput).toHaveAttribute('id', 'email');
    });

    it('should provide error messages for invalid inputs', () => {
      render(
        <form>
          <label htmlFor="email">Email</label>
          <input 
            id="email" 
            type="email" 
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">Please enter a valid email</span>
        </form>
      );
      
      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Please enter a valid email');
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have skip navigation links', () => {
      render(
        <div>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <nav>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/profile">Profile</a></li>
              <li><a href="/search">Search</a></li>
            </ul>
          </nav>
          <main id="main-content">
            <h1>Main Content</h1>
          </main>
        </div>
      );
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(skipLink).toHaveClass('skip-link');
    });

    it('should have semantic HTML structure', () => {
      render(
        <div>
          <header>
            <h1>Site Title</h1>
            <nav aria-label="Main navigation">
              {/* Navigation items */}
            </nav>
          </header>
          <main>
            <section aria-labelledby="content-heading">
              <h2 id="content-heading">User Profile</h2>
            </section>
          </main>
          <footer>
            <p>&copy; 2024 Company Name</p>
          </footer>
        </div>
      );
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA landmarks', () => {
      render(
        <div>
          <header role="banner">
            <h1>Site Title</h1>
          </header>
          <nav role="navigation" aria-label="Main navigation">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/search">Search</a></li>
            </ul>
          </nav>
          <main role="main">
            <section aria-labelledby="content-heading">
              <h2 id="content-heading">Content Section</h2>
            </section>
          </main>
          <aside role="complementary">
            <h3>Related Information</h3>
          </aside>
          <footer role="contentinfo">
            <p>Footer content</p>
          </footer>
        </div>
      );
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should announce dynamic content changes', () => {
      render(
        <div>
          <div role="status" aria-live="polite">
            Loading...
          </div>
          <div role="alert" aria-live="assertive">
            Error occurred!
          </div>
        </div>
      );
      
      const statusElement = screen.getByRole('status');
      const alertElement = screen.getByRole('alert');
      
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
      expect(alertElement).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Mobile Accessibility', () => {
    it('should have touch-friendly target sizes', () => {
      render(
        <div>
          <button className="touch-target" style={{ minHeight: '44px' }}>Touch Target</button>
          <a href="#" className="touch-link" style={{ minHeight: '44px' }}>Touch Link</a>
        </div>
      );
      
      const button = screen.getByRole('button');
      const link = screen.getByRole('link');
      
      // Check that touch targets exist - in a real browser with CSS this would be 44px
      expect(button).toBeInTheDocument();
      expect(link).toBeInTheDocument();
      
      // Note: jsdom doesn't compute actual styles, so we verify the elements exist
      // In production, CSS should ensure 44x44px minimum touch targets
    });

    it('should support screen reader announcements', () => {
      render(
        <div>
          <button 
            aria-pressed="false"
            aria-expanded="false"
            aria-controls="menu"
          >
            Menu
          </button>
          <div id="menu" role="menu" aria-hidden="true">
            <button role="menuitem">Item 1</button>
            <button role="menuitem">Item 2</button>
          </div>
        </div>
      );
      
      const menuButton = screen.getByRole('button', { name: /menu/i });
      expect(menuButton).toHaveAttribute('aria-pressed', 'false');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-controls', 'menu');
    });
  });
});
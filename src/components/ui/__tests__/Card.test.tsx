import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card components', () => {
  describe('Card', () => {
    it('renders card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>);
      expect(screen.getByTestId('card')).toHaveClass('custom-class');
    });
  });

  describe('CardHeader', () => {
    it('renders header content', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('renders title text', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>My Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });
  });

  describe('CardDescription', () => {
    it('renders description text', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>My Description</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('My Description')).toBeInTheDocument();
    });
  });

  describe('CardContent', () => {
    it('renders content', () => {
      render(
        <Card>
          <CardContent>Main content</CardContent>
        </Card>
      );
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('renders footer content', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });
  });

  describe('Full Card', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});

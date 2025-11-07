import { render, screen } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { vi } from 'vitest';

function Boom() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      const matches = screen.getAllByText(/boom/i);
      expect(matches.length).toBeGreaterThan(0);
    } finally {
      spy.mockRestore();
    }
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>child</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('child')).toBeInTheDocument();
  });
});

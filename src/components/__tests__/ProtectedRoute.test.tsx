import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProtectedRoute from '../ProtectedRoute';
import { vi } from 'vitest';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

describe('ProtectedRoute (development bypass)', () => {
  it('shows bypass UI when unauthenticated in dev mode', () => {
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Secret Area</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enable Development Bypass/i })).toBeInTheDocument();
  });

  it('renders children after enabling bypass', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Secret Area</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Enable Development Bypass/i }));

    expect(await screen.findByText('Secret Area')).toBeInTheDocument();
  });

  it('renders children immediately if bypass previously enabled', () => {
    window.localStorage.setItem('dev_auth_bypass', 'true');

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>Secret Area</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Area')).toBeInTheDocument();

    // cleanup
    window.localStorage.removeItem('dev_auth_bypass');
  });
});


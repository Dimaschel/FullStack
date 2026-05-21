import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

function Probe() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      <span>{isAuthenticated ? 'AUTH' : 'GUEST'}</span>
      <span>{user?.email ?? 'no-user'}</span>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('restores persisted session from localStorage', async () => {
    localStorage.setItem('token', 'saved-token');
    localStorage.setItem('user', JSON.stringify({
      email: 'admin@test.local',
      userType: 'ADMIN',
      userId: 1,
    }));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(await screen.findByText('AUTH')).toBeInTheDocument();
    expect(screen.getByText('admin@test.local')).toBeInTheDocument();
  });

  it('clears persisted session on logout', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'saved-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('user', JSON.stringify({
      email: 'helper@test.local',
      userType: 'HELPER',
      userId: 2,
    }));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await user.click(await screen.findByRole('button', { name: 'logout' }));

    expect(screen.getByText('GUEST')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

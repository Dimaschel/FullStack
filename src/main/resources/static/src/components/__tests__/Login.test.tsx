import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../Login';

const loginMock = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: loginMock,
  }),
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits credentials through auth context', async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue(undefined);

    render(<Login />);

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@test.local');
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('user@test.local', 'secret123');
    });
  });

  it('shows backend error when login fails', async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValue(new Error('Неверный логин или пароль'));

    render(<Login />);

    await user.type(screen.getByPlaceholderText('your@email.com'), 'user@test.local');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Неверный логин или пароль')).toBeInTheDocument();
  });
});

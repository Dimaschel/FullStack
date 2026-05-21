import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Register } from '../Register';

const registerMock = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: registerMock,
  }),
}));

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();

    render(<Register />);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(screen.getByPlaceholderText('your@email.com'), 'new@test.local');
    await user.type(screen.getByPlaceholderText('+7 (999) 123-45-67'), '+79991234567');
    await user.type(passwordInputs[0], 'secret123');
    await user.type(passwordInputs[1], 'secret321');
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    expect(screen.getByText('Пароли не совпадают')).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('submits registration form through auth context', async () => {
    const user = userEvent.setup();
    registerMock.mockResolvedValue(undefined);

    render(<Register />);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(screen.getByPlaceholderText('your@email.com'), 'new@test.local');
    await user.type(screen.getByPlaceholderText('+7 (999) 123-45-67'), '+79991234567');
    await user.selectOptions(screen.getByDisplayValue('Нуждающийся'), 'HELPER');
    await user.type(passwordInputs[0], 'secret123');
    await user.type(passwordInputs[1], 'secret123');
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith('new@test.local', '+79991234567', 'HELPER', 'secret123');
    });
  });

  it('shows backend error when registration fails', async () => {
    const user = userEvent.setup();
    registerMock.mockRejectedValue(new Error('Email уже занят'));

    render(<Register />);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    await user.type(screen.getByPlaceholderText('your@email.com'), 'new@test.local');
    await user.type(screen.getByPlaceholderText('+7 (999) 123-45-67'), '+79991234567');
    await user.type(passwordInputs[0], 'secret123');
    await user.type(passwordInputs[1], 'secret123');
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    expect(await screen.findByText('Email уже занят')).toBeInTheDocument();
  });
});

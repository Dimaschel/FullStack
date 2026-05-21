import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateAnnouncement } from '../CreateAnnouncement';
import { apiService } from '../../services/api';

vi.mock('../../services/api', async () => {
  const actual = await vi.importActual<typeof import('../../services/api')>('../../services/api');
  return {
    ...actual,
    apiService: {
      ...actual.apiService,
      createSchedule: vi.fn(),
    },
  };
});

describe('CreateAnnouncement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation error when required fields are empty', async () => {
    const onSubmit = vi.fn();

    const { container } = render(<CreateAnnouncement onSubmit={onSubmit} />);

    const form = container.querySelector('form');
    if (!form) {
      throw new Error('Create announcement form was not rendered');
    }

    fireEvent.submit(form);

    expect(screen.getByText('Пожалуйста, заполните все обязательные поля')).toBeInTheDocument();
    expect(apiService.createSchedule).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid future schedule and calls onSubmit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    vi.mocked(apiService.createSchedule).mockResolvedValue(undefined);

    const { container } = render(<CreateAnnouncement onSubmit={onSubmit} />);

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const date = tomorrow.toISOString().split('T')[0];
    const dateInput = container.querySelector('input[type="date"]');
    const timeInput = container.querySelector('input[type="time"]');

    await user.type(screen.getByPlaceholderText('Опишите, с чем вам нужна помощь...'), 'Купить продукты');
    if (!dateInput || !timeInput) {
      throw new Error('Date or time input was not rendered');
    }
    await user.type(dateInput, date);
    await user.type(timeInput, '12:30');
    await user.click(screen.getByRole('button', { name: 'Опубликовать объявление' }));

    await waitFor(() => {
      expect(apiService.createSchedule).toHaveBeenCalledTimes(1);
    });

    expect(apiService.createSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        task: 'Купить продукты',
        ownerId: 0,
      })
    );
    expect(onSubmit).toHaveBeenCalled();
  });
});

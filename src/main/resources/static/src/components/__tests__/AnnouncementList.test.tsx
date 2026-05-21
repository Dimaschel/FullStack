import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnouncementList } from '../AnnouncementList';

vi.mock('../AnnouncementCard', () => ({
  AnnouncementCard: ({ announcement }: { announcement: { helpNeeded: string } }) => (
    <div>{announcement.helpNeeded}</div>
  ),
}));

describe('AnnouncementList', () => {
  const baseProps = {
    announcements: [],
    totalAnnouncements: 0,
    searchValue: '',
    statusFilter: 'ALL' as const,
    timeOrder: 'nearest' as const,
    currentPage: 1,
    totalPages: 1,
    onRefresh: vi.fn(),
    onSearchSubmit: vi.fn(),
    onStatusChange: vi.fn(),
    onTimeOrderChange: vi.fn(),
    onPageChange: vi.fn(),
    onResetFilters: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits search text entered by the user', async () => {
    const user = userEvent.setup();
    render(<AnnouncementList {...baseProps} />);

    await user.type(screen.getByPlaceholderText('Поиск по задаче'), 'аптека');
    await user.click(screen.getByRole('button', { name: 'Найти' }));

    expect(baseProps.onSearchSubmit).toHaveBeenCalledWith('аптека');
  });

  it('shows empty state when there are no announcements', () => {
    render(<AnnouncementList {...baseProps} />);

    expect(screen.getByText('По текущим фильтрам ничего не найдено')).toBeInTheDocument();
  });

  it('calls filter and pagination callbacks', async () => {
    const user = userEvent.setup();
    render(
      <AnnouncementList
        {...baseProps}
        announcements={[
          {
            id: 1,
            time: '2026-05-08T12:00:00.000Z',
            helpNeeded: 'Купить продукты',
            author: 'Иван',
            createdAt: new Date('2026-05-07T09:00:00.000Z'),
            status: 'OPEN',
            ownerId: 10,
          },
        ]}
        totalAnnouncements={1}
        totalPages={3}
      />
    );

    await user.selectOptions(screen.getByDisplayValue('Все статусы'), 'OPEN');
    expect(baseProps.onStatusChange).toHaveBeenCalledWith('OPEN');

    await user.selectOptions(screen.getByDisplayValue('Сначала ближайшие'), 'farthest');
    expect(baseProps.onTimeOrderChange).toHaveBeenCalledWith('farthest');

    await user.click(screen.getByRole('button', { name: 'Сбросить' }));
    expect(baseProps.onResetFilters).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '2' }));
    expect(baseProps.onPageChange).toHaveBeenCalledWith(2);
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { WeatherWidget } from '../WeatherWidget';
import { apiService } from '../../services/api';

vi.mock('../../services/api', async () => {
  const actual = await vi.importActual<typeof import('../../services/api')>('../../services/api');
  return {
    ...actual,
    apiService: {
      ...actual.apiService,
      getCurrentWeather: vi.fn(),
    },
  };
});

describe('WeatherWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders weather data from the API', async () => {
    vi.mocked(apiService.getCurrentWeather).mockResolvedValue({
      city: 'Москва',
      date: '2026-05-07',
      description: 'Средняя температура на сегодня',
      averageTemperatureCelsius: 12.4,
      minTemperatureCelsius: 8.1,
      maxTemperatureCelsius: 15.8,
      source: 'Open-Meteo',
    });

    render(<WeatherWidget city="Москва" />);

    await waitFor(() => {
      expect(screen.getByText('Москва')).toBeInTheDocument();
    });

    expect(screen.getByText('12.4°C')).toBeInTheDocument();
    expect(screen.getByText('8.1°C')).toBeInTheDocument();
    expect(screen.getByText('15.8°C')).toBeInTheDocument();
  });

  it('shows graceful degradation message on API failure', async () => {
    vi.mocked(apiService.getCurrentWeather).mockRejectedValue(new Error('timeout'));

    render(<WeatherWidget city="Москва" />);

    await waitFor(() => {
      expect(screen.getByText('Внешний погодный API сейчас недоступен. Основной функционал объявлений продолжает работать без него.')).toBeInTheDocument();
    });
  });

  it('shows empty state when API returns no weather data', async () => {
    vi.mocked(apiService.getCurrentWeather).mockResolvedValue(null);

    render(<WeatherWidget city="Москва" />);

    await waitFor(() => {
      expect(screen.getByText('Погодные данные пока не настроены.')).toBeInTheDocument();
    });
  });
});

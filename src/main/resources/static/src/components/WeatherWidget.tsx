import { useEffect, useState } from 'react';
import { CloudSun, Thermometer } from 'lucide-react';
import { apiService, WeatherInfo } from '../services/api';

interface WeatherWidgetProps {
  city?: string;
}

export function WeatherWidget({ city = 'Moscow' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadWeather = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await apiService.getCurrentWeather(city);
        if (active) {
          setWeather(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Погодный сервис временно недоступен');
          setWeather(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadWeather();
    return () => {
      active = false;
    };
  }, [city]);

  return (
    <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <CloudSun className="text-sky-600" size={24} />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Средняя температура в Москве сегодня</h2>
          <p className="text-sm text-gray-600">Внешний прогнозный API с graceful degradation при недоступности.</p>
        </div>
      </div>

      <div className="min-h-32">
        {loading ? (
          <div className="space-y-3">
            <div className="h-5 w-40 animate-pulse rounded bg-sky-100" />
            <div className="h-4 w-56 animate-pulse rounded bg-sky-100" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-20 animate-pulse rounded-2xl bg-white" />
              <div className="h-20 animate-pulse rounded-2xl bg-white" />
              <div className="h-20 animate-pulse rounded-2xl bg-white" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Внешний погодный API сейчас недоступен. Основной функционал объявлений продолжает работать без него.
          </div>
        ) : !weather ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
            Погодные данные пока не настроены.
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900">{weather.city}</p>
              <p className="text-gray-600">{weather.description}</p>
              <p className="text-sm text-gray-500">
                Дата: {new Date(weather.date).toLocaleDateString('ru-RU')} · Источник: {weather.source}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <div className="mb-2 flex items-center gap-2 text-sky-700">
                  <Thermometer size={18} />
                  <span className="text-sm font-medium">Средняя</span>
                </div>
                <p className="text-xl font-semibold text-gray-900">{weather.averageTemperatureCelsius.toFixed(1)}°C</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="mb-2 text-sm font-medium text-sky-700">Минимум</p>
                <p className="text-xl font-semibold text-gray-900">{weather.minTemperatureCelsius.toFixed(1)}°C</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="mb-2 text-sm font-medium text-sky-700">Максимум</p>
                <p className="text-xl font-semibold text-gray-900">{weather.maxTemperatureCelsius.toFixed(1)}°C</p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

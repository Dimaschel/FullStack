import { FormEvent, useEffect, useState } from 'react';
import { AnnouncementCard } from './AnnouncementCard';
import { Announcement } from '../App';
import { ScheduleTimeOrder } from '../services/api';

interface AnnouncementListProps {
  announcements: Announcement[];
  totalAnnouncements: number;
  searchValue: string;
  statusFilter: Announcement['status'] | 'ALL';
  timeOrder: ScheduleTimeOrder;
  currentPage: number;
  totalPages: number;
  onRefresh?: () => void;
  onSearchSubmit: (value: string) => void;
  onStatusChange: (value: Announcement['status'] | 'ALL') => void;
  onTimeOrderChange: (value: ScheduleTimeOrder) => void;
  onPageChange: (page: number) => void;
  onResetFilters: () => void;
}

const STATUS_OPTIONS: Array<{ value: Announcement['status'] | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Все статусы' },
  { value: 'OPEN', label: 'Открыто' },
  { value: 'IN_PROGRESS', label: 'В процессе' },
  { value: 'COMPLETED', label: 'Завершено' },
  { value: 'CANCELLED', label: 'Отменено' },
];

export function AnnouncementList({
  announcements,
  totalAnnouncements,
  searchValue,
  statusFilter,
  timeOrder,
  currentPage,
  totalPages,
  onRefresh,
  onSearchSubmit,
  onStatusChange,
  onTimeOrderChange,
  onPageChange,
  onResetFilters,
}: AnnouncementListProps) {
  const [searchInput, setSearchInput] = useState(searchValue);

  useEffect(() => {
    setSearchInput(searchValue);
  }, [searchValue]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchSubmit(searchInput);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => (
    Math.abs(page - currentPage) <= 1 || page === 1 || page === totalPages
  ));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Объявления</h2>
        <p className="text-gray-600 mt-2">
          Найдено объявлений: {totalAnnouncements}
        </p>
      </div>

      <div className="mb-6 rounded-2xl border-2 border-gray-100 bg-white p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Поиск по задаче"
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 outline-none transition-colors focus:border-indigo-500"
          />

          <select
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value as Announcement['status'] | 'ALL')}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 outline-none transition-colors focus:border-indigo-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={timeOrder}
            onChange={(event) => onTimeOrderChange(event.target.value as ScheduleTimeOrder)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 outline-none transition-colors focus:border-indigo-500"
          >
            <option value="nearest">Сначала ближайшие</option>
            <option value="farthest">Сначала дальние</option>
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Найти
            </button>
            <button
              type="button"
              onClick={onResetFilters}
              className="rounded-xl border-2 border-gray-200 px-5 py-3 font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              Сбросить
            </button>
          </div>
        </form>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <p className="text-gray-500">
            По текущим фильтрам ничего не найдено
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                onRefresh={onRefresh}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border-2 border-gray-100 bg-white p-4 shadow-sm md:flex-row">
            <p className="text-sm text-gray-600">
              Страница {currentPage} из {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Назад
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-indigo-600 text-white'
                      : 'border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Вперед
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

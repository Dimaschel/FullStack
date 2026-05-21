import { PropsWithChildren, Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AnnouncementList } from './components/AnnouncementList';
import { NotFoundPage } from './components/NotFoundPage';
import { SeoHead } from './components/SeoHead';
import { useAuth } from './contexts/AuthContext';
import { apiService, Schedule, ScheduleAttachment, ScheduleTimeOrder } from './services/api';
import { CloudSun, Home, LogIn, LogOut, PlusCircle, User } from 'lucide-react';

const AboutPage = lazy(() => import('./components/AboutPage').then((module) => ({ default: module.AboutPage })));
const CreateAnnouncement = lazy(() => import('./components/CreateAnnouncement').then((module) => ({ default: module.CreateAnnouncement })));
const Profile = lazy(() => import('./components/Profile').then((module) => ({ default: module.Profile })));
const Login = lazy(() => import('./components/Login').then((module) => ({ default: module.Login })));
const Register = lazy(() => import('./components/Register').then((module) => ({ default: module.Register })));
const WeatherWidget = lazy(() => import('./components/WeatherWidget').then((module) => ({ default: module.WeatherWidget })));

export interface Announcement {
  id: number;
  time: string;
  address?: string;
  helpNeeded: string;
  author: string;
  authorAge?: number;
  createdAt: Date;
  status: string;
  ownerId: number;
  responderId?: number;
  attachments?: ScheduleAttachment[];
}

type ScheduleStatusFilter = Schedule['status'] | 'ALL';

const PAGE_SIZE = 6;

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
        <p className="mt-4 text-gray-600">Загрузка...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <SeoHead
        title={isLogin ? 'Вход' : 'Регистрация'}
        description={isLogin ? 'Войдите в сервис Помощь рядом.' : 'Зарегистрируйтесь в сервисе Помощь рядом.'}
        canonicalPath={isLogin ? '/login' : '/register'}
        robots="noindex,nofollow"
      />
      <header className="border-b-2 border-indigo-100 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-center text-3xl font-bold text-indigo-600">Помощь рядом</h1>
          <p className="mt-2 text-center text-gray-600">Сервис взаимопомощи для пожилых людей</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-xl bg-white p-1 shadow-sm">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `rounded-lg px-6 py-2 transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`
              }
            >
              Вход
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `rounded-lg px-6 py-2 transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`
              }
            >
              Регистрация
            </NavLink>
          </div>
        </div>
        <Suspense fallback={<PageLoader />}>{isLogin ? <Login /> : <Register />}</Suspense>
      </main>
    </div>
  );
}

function SiteLayout() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="border-b-2 border-indigo-100 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-500">Микро-MVP помощи</p>
              <h1 className="text-3xl font-bold text-indigo-600">Помощь рядом</h1>
              <p className="mt-2 text-gray-600">Платформа для публикации заявок о помощи и координации помощников.</p>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-600">{user?.email}</span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 transition-colors hover:text-indigo-600"
                  >
                    <LogOut size={20} />
                    <span>Выйти</span>
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
                >
                  <LogIn size={18} />
                  <span>Войти</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="sticky top-0 z-10 bg-white shadow-md">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap justify-around">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex flex-1 items-center justify-center gap-3 py-5 transition-colors ${
                  isActive ? 'border-b-4 border-indigo-600 bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Home size={22} />
              <span>Объявления</span>
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `flex flex-1 items-center justify-center gap-3 py-5 transition-colors ${
                  isActive ? 'border-b-4 border-indigo-600 bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <CloudSun size={22} />
              <span>О сервисе</span>
            </NavLink>
            {isAuthenticated && user?.userType === 'NEEDY' && (
              <NavLink
                to="/announcements/create"
                className={({ isActive }) =>
                  `flex flex-1 items-center justify-center gap-3 py-5 transition-colors ${
                    isActive ? 'border-b-4 border-indigo-600 bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <PlusCircle size={22} />
                <span>Создать объявление</span>
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex flex-1 items-center justify-center gap-3 py-5 transition-colors ${
                    isActive ? 'border-b-4 border-indigo-600 bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <User size={22} />
                <span>Профиль</span>
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

function AnnouncementsPage() {
  const { isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const search = searchParams.get('search') ?? '';
  const statusParam = searchParams.get('status');
  const statusFilter: ScheduleStatusFilter =
    statusParam === 'OPEN' ||
    statusParam === 'IN_PROGRESS' ||
    statusParam === 'COMPLETED' ||
    statusParam === 'CANCELLED'
      ? statusParam
      : 'ALL';
  const timeOrder: ScheduleTimeOrder = searchParams.get('timeOrder') === 'farthest' ? 'farthest' : 'nearest';
  const currentPage = Math.max(Number(searchParams.get('page') ?? '1') || 1, 1);

  const queryString = searchParams.toString();
  const canonicalPath = queryString ? `/?${queryString}` : '/';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Объявления о помощи',
    description: 'Публичная витрина объявлений о помощи пожилым людям с фильтрами по статусу и времени.',
    url: `${window.location.origin}${canonicalPath}`,
  };

  const updateFilters = (updates: {
    search?: string;
    status?: ScheduleStatusFilter;
    timeOrder?: ScheduleTimeOrder;
    page?: number;
  }) => {
    const nextParams = new URLSearchParams(searchParams);

    if (updates.search !== undefined) {
      const trimmedSearch = updates.search.trim();
      if (trimmedSearch) {
        nextParams.set('search', trimmedSearch);
      } else {
        nextParams.delete('search');
      }
    }

    if (updates.status !== undefined) {
      if (updates.status === 'ALL') {
        nextParams.delete('status');
      } else {
        nextParams.set('status', updates.status);
      }
    }

    if (updates.timeOrder !== undefined) {
      if (updates.timeOrder === 'nearest') {
        nextParams.delete('timeOrder');
      } else {
        nextParams.set('timeOrder', updates.timeOrder);
      }
    }

    if (updates.page !== undefined) {
      if (updates.page <= 1) {
        nextParams.delete('page');
      } else {
        nextParams.set('page', String(updates.page));
      }
    }

    setSearchParams(nextParams);
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadAnnouncements = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiService.getAllSchedules({
          search: search || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          timeOrder,
          page: currentPage - 1,
          size: PAGE_SIZE,
          signal: controller.signal,
        });

        const formattedAnnouncements: Announcement[] = response.content.map((schedule) => ({
          id: schedule.id,
          time: new Date(schedule.dateTime).toLocaleString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'long',
          }),
          helpNeeded: schedule.task,
          author: schedule.ownerName || `Пользователь ${schedule.ownerId}`,
          createdAt: new Date(schedule.dateTime),
          status: schedule.status,
          ownerId: schedule.ownerId,
          responderId: schedule.responderId,
          attachments: schedule.attachments ?? [],
        }));

        setAnnouncements(formattedAnnouncements);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);

        if (response.totalPages > 0 && currentPage > response.totalPages) {
          updateFilters({ page: response.totalPages });
        } else if (response.totalPages === 0 && currentPage !== 1) {
          updateFilters({ page: 1 });
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes('aborted')) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Ошибка загрузки объявлений');
      } finally {
        setLoading(false);
      }
    };

    void loadAnnouncements();
    return () => controller.abort();
  }, [search, statusFilter, timeOrder, currentPage, reloadNonce]);

  const handleCreateAnnouncement = async () => {
    navigate({ pathname: '/', search: location.search });
  };

  return (
    <>
      <SeoHead
        title="Объявления о помощи"
        description="Публичная страница объявлений о помощи пожилым людям. Фильтруйте заявки по статусу, времени и теме задачи."
        canonicalPath={canonicalPath}
        jsonLd={jsonLd}
      />

      <section className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-4xl font-bold text-gray-900">Объявления о помощи</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600">
            Публичная витрина заявок на помощь. Здесь можно найти актуальные запросы, отфильтровать их по статусу и времени и быстро понять, где нужна поддержка.
          </p>
        </section>

        <Suspense fallback={<div className="min-h-32 rounded-3xl bg-white p-6 shadow-sm" />}>
          <WeatherWidget city="Москва" />
        </Suspense>
      </section>

      {error && (
        <div className="mb-4 rounded-xl border-2 border-red-200 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <PageLoader />
      ) : (
        <AnnouncementList
          announcements={announcements}
          totalAnnouncements={totalElements}
          searchValue={search}
          statusFilter={statusFilter}
          timeOrder={timeOrder}
          currentPage={currentPage}
          totalPages={Math.max(totalPages, 1)}
          onRefresh={() => setReloadNonce((value) => value + 1)}
          onSearchSubmit={(value) => updateFilters({ search: value, page: 1 })}
          onStatusChange={(value) => updateFilters({ status: value, page: 1 })}
          onTimeOrderChange={(value) => updateFilters({ timeOrder: value, page: 1 })}
          onPageChange={(page) => updateFilters({ page })}
          onResetFilters={() => setSearchParams(new URLSearchParams())}
        />
      )}

      {!isAuthenticated && (
        <section className="mt-8 rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">Хотите опубликовать своё объявление?</h2>
          <p className="mt-3 text-gray-600">
            Зарегистрируйтесь, чтобы создавать новые заявки, управлять своими объявлениями и работать с профилем.
          </p>
        </section>
      )}
    </>
  );
}

function ProfilePage() {
  return (
    <>
      <SeoHead
        title="Профиль пользователя"
        description="Личный кабинет пользователя сервиса Помощь рядом."
        canonicalPath="/profile"
        robots="noindex,nofollow"
      />
      <Profile />
    </>
  );
}

function CreateAnnouncementPage() {
  const navigate = useNavigate();

  return (
    <>
      <SeoHead
        title="Создать объявление"
        description="Форма создания объявления о помощи."
        canonicalPath="/announcements/create"
        robots="noindex,nofollow"
      />
      <CreateAnnouncement onSubmit={() => navigate('/')} />
    </>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout />}
      />

      <Route path="/" element={<SiteLayout />}>
        <Route index element={<AnnouncementsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route
          path="announcements/create"
          element={
            <ProtectedRoute>
              <CreateAnnouncementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="create"
          element={<Navigate to="/announcements/create" replace />}
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

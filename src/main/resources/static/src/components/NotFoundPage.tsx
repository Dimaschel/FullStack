import { Link } from 'react-router-dom';
import { SeoHead } from './SeoHead';

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 text-center shadow-sm">
      <SeoHead
        title="Страница не найдена"
        description="Запрошенная страница не существует."
        canonicalPath="/404"
        robots="noindex,nofollow"
      />
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-lg text-gray-600">Страница не найдена или была перемещена.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}

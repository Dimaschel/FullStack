import { SeoHead } from './SeoHead';

export function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Как работает сервис Помощь рядом',
    description: 'Платформа для публикации объявлений о помощи пожилым людям и поиска помощников.',
    url: `${window.location.origin}/about`,
  };

  return (
    <>
      <SeoHead
        title="Как работает сервис"
        description="Узнайте, как работает сервис Помощь рядом: публикация объявлений, поиск помощников и безопасная координация помощи."
        canonicalPath="/about"
        jsonLd={jsonLd}
      />
      <article className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Как работает сервис «Помощь рядом»</h1>
          <p className="mt-4 text-lg text-gray-600">
            Мы сделали простой сервис, где пожилые люди могут оставить заявку на помощь, а помощники быстро найти подходящее объявление.
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Для кого этот сервис</h2>
          <p className="mt-3 text-gray-700">
            Платформа подходит для тех, кому нужна помощь с бытовыми задачами, покупками, сопровождением и другими повседневными делами.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Как подать объявление</h2>
          <div className="mt-4 space-y-4">
            <section>
              <h3 className="text-xl font-medium text-gray-900">1. Заполните задачу</h3>
              <p className="mt-2 text-gray-700">Опишите, какая помощь нужна и на какое время.</p>
            </section>
            <section>
              <h3 className="text-xl font-medium text-gray-900">2. Дождитесь отклика</h3>
              <p className="mt-2 text-gray-700">Помощники видят активные объявления и могут откликнуться на них.</p>
            </section>
            <section>
              <h3 className="text-xl font-medium text-gray-900">3. Отслеживайте статус</h3>
              <p className="mt-2 text-gray-700">Объявление проходит статусы: открыто, в процессе, завершено или отменено.</p>
            </section>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900">Почему это удобно</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li>Публичная страница с актуальными объявлениями.</li>
            <li>Чёткие статусы заявок и история помощи.</li>
            <li>Безопасное управление файлами и доступом для администратора.</li>
          </ul>
        </section>
      </article>
    </>
  );
}

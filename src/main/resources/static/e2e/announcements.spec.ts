import { expect, test } from '@playwright/test';

test('announcements page supports filtering and sorting through query params', async ({ page }) => {
  await page.route('http://localhost:8080/integrations/weather/current**', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });

  await page.route('http://localhost:8080/Schedule/getAllSchedule**', async (route) => {
    const url = new URL(route.request().url());
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const timeOrder = url.searchParams.get('timeOrder');

    const content = search === 'аптека' && status === 'OPEN' && timeOrder === 'farthest'
      ? [
          {
            id: 1,
            task: 'Сходить в аптеку',
            dateTime: '2026-05-08T12:30:00.000Z',
            status: 'OPEN',
            ownerId: 11,
            ownerName: 'Иван Петров',
            attachments: [],
          },
        ]
      : [];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content,
        page: 0,
        size: 6,
        totalElements: content.length,
        totalPages: 1,
        first: true,
        last: true,
      }),
    });
  });

  await page.goto('/');

  await page.getByRole('combobox').nth(0).selectOption('OPEN');
  await page.getByRole('combobox').nth(1).selectOption('farthest');
  await page.getByPlaceholder('Поиск по задаче').fill('аптека');
  await page.getByRole('button', { name: 'Найти' }).click();

  await expect(page).toHaveURL(/search=%D0%B0%D0%BF%D1%82%D0%B5%D0%BA%D0%B0/);
  await expect(page).toHaveURL(/status=OPEN/);
  await expect(page).toHaveURL(/timeOrder=farthest/);
  await expect(page.getByText('Сходить в аптеку')).toBeVisible();
  await expect(page.getByText('Иван Петров')).toBeVisible();
});

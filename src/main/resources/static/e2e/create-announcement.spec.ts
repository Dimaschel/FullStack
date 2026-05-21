import { expect, test } from '@playwright/test';

async function seedAuthenticatedNeedy(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'access-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('user', JSON.stringify({
      email: 'needy@test.local',
      userType: 'NEEDY',
      userId: 15,
    }));
  });
}

test('needy user can create announcement and returns to main page', async ({ page }) => {
  await seedAuthenticatedNeedy(page);

  await page.route('http://localhost:8080/integrations/weather/current**', async (route) => {
    await route.fulfill({ status: 204, body: '' });
  });

  await page.route('http://localhost:8080/Schedule/getAllSchedule**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: [],
        page: 0,
        size: 6,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      }),
    });
  });

  await page.route('http://localhost:8080/needy/createSchedule', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'Schedule created',
    });
  });

  await page.goto('/announcements/create');

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const yyyyMmDd = tomorrow.toISOString().split('T')[0];

  await page.getByPlaceholder('Опишите, с чем вам нужна помощь...').fill('Нужно купить продукты');
  await page.locator('input[type="date"]').fill(yyyyMmDd);
  await page.locator('input[type="time"]').fill('12:30');
  await page.getByRole('button', { name: 'Опубликовать объявление' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Объявления о помощи' })).toBeVisible();
});

import { expect, test } from '@playwright/test';

async function mockPublicData(page: import('@playwright/test').Page) {
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

  await page.route('http://localhost:8080/integrations/weather/current**', async (route) => {
    await route.fulfill({
      status: 204,
      body: '',
    });
  });
}

test('guest is redirected from protected profile route to login', async ({ page }) => {
  await mockPublicData(page);

  await page.goto('/profile');

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();
});

test('user can login and gets redirected to announcements', async ({ page }) => {
  await mockPublicData(page);

  await page.route('http://localhost:8080/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'access-token',
        refreshToken: 'refresh-token',
        email: 'helper@test.local',
        userType: 'HELPER',
        userId: 7,
      }),
    });
  });

  await page.goto('/login');
  await page.getByPlaceholder('your@email.com').fill('helper@test.local');
  await page.getByPlaceholder('••••••••').fill('secret123');
  await page.getByRole('button', { name: 'Войти' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('helper@test.local')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Объявления о помощи' })).toBeVisible();
});

test('user can register and then lands on the main page', async ({ page }) => {
  await mockPublicData(page);

  await page.route('http://localhost:8080/auth/register', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'User registered successfully!',
    });
  });

  await page.route('http://localhost:8080/auth/signin', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'access-token',
        refreshToken: 'refresh-token',
        email: 'new@test.local',
        userType: 'NEEDY',
        userId: 8,
      }),
    });
  });

  await page.goto('/register');
  await page.getByPlaceholder('your@email.com').fill('new@test.local');
  await page.getByPlaceholder('+7 (999) 123-45-67').fill('+79991234567');
  await page.getByRole('combobox').selectOption('NEEDY');
  await page.getByPlaceholder('••••••••').nth(0).fill('secret123');
  await page.getByPlaceholder('••••••••').nth(1).fill('secret123');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

  await expect(page).toHaveURL('/');
  await expect(page.getByText('new@test.local')).toBeVisible();
});

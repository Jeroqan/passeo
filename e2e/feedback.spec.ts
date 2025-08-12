import { test, expect } from '@playwright/test';

test('Geri bildirim gönderme akışı başarıyla çalışmalı', async ({ page }) => {
  // 1. API mock
  await page.route('**/api/feedback', route =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Geri bildiriminiz başarıyla alındı.' }),
    })
  );

  await page.goto('/feedback');

  // 2. Açılır menüyü açacak trigger butonunu bulup tıkla
  const trigger = page.getByRole('combobox');
  await trigger.click();

  // 3. Açılan listbox içinden metinle seçeneğe tıkla
  await page.getByRole('option', { name: 'Hata Bildirimi' }).click();

  // 4. Mesajı yaz
  await page.locator('#feedback-message').fill(
    'Bu test sırasında bulunan bir test bug raporudur.'
  );

  // 5. Gönder butonuna tıkla
  await page.getByRole('button', { name: /Gönder/i }).click();

  // 6. Başarı mesajını alert rolüyle doğrula
  await expect(page.getByText('Geri bildiriminiz başarıyla alındı.')).toBeVisible();
});

test('Yetersiz metin girildiğinde gönder butonu devre dışı olmalı', async ({ page }) => {
  await page.goto('/feedback');

  const messageInput = page.locator('#feedback-message');
  const submitButton = page.getByRole('button', { name: /Gönder/i });

  // Kullanıcı gibi davranarak türü seçelim
  const trigger = page.getByRole('combobox');
  await trigger.click();
  await page.getByRole('option', { name: 'Genel Geri Bildirim' }).click();

  // 1. Başlangıçta devre dışı
  await expect(submitButton).toBeDisabled();

  // 2. Kısa metin gir, hâlâ devre dışı
  await messageInput.fill('kısa');
  await expect(submitButton).toBeDisabled();

  // 3. Yeterli uzunlukta metin gir, etkinleşmeli
  await messageInput.fill('Bu artık geri bildirim göndermek için yeterli uzunlukta bir metindir.');
  await expect(submitButton).toBeEnabled();
}); 
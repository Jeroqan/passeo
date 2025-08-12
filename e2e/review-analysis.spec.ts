import { test, expect } from '@playwright/test';

test('Yorum analizi akışı başarıyla çalışmalı', async ({ page }) => {
  // API isteğini taklit ederek testi kararlı hale getiriyoruz
  await page.route('**/api/review-analysis', async (route) => {
    const mockResponse = {
      sentiment: 'Pozitif',
      categories: ['Ürün Kalitesi', 'Hızlı Kargo'],
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    });
  });

  // 1. Yorum Analizi sayfasına git
  await page.goto('/review-analysis');

  // 2. Başlığın doğru olduğunu kontrol et
  await expect(page.getByRole('heading', { name: /Yorum Analizi/i })).toBeVisible();

  // 3. Metin alanına bir yorum gir
  const testComment = 'Bu ürün gerçekten harika, ayrıca kargosu da çok hızlıydı.';
  await page.getByPlaceholder('Analiz edilecek yorumu buraya girin...').fill(testComment);

  // 4. Analiz et butonuna tıkla
  await page.getByRole('button', { name: /Analiz Et/i }).click();

  // 5. Sonuçların ekranda göründüğünü doğrula
  // Duygu sonucunu kontrol et
  await expect(page.getByText(/Duygu Durumu: Pozitif/i)).toBeVisible();

  // Kategori sonuçlarını kontrol et
  await expect(page.getByText('Ürün Kalitesi')).toBeVisible();
  await expect(page.getByText('Hızlı Kargo')).toBeVisible();
});

test('Boş metin gönderildiğinde butonun devre dışı olması', async ({ page }) => {
  // 1. Yorum Analizi sayfasına git
  await page.goto('/review-analysis');
  
  // 2. Metin alanının boş olduğunu doğrula
  const textArea = page.getByPlaceholder('Analiz edilecek yorumu buraya girin...');
  await expect(textArea).toHaveValue('');

  // 3. "Analiz Et" butonunun DEVRE DIŞI (disabled) olduğunu doğrula.
  const analyzeButton = page.getByRole('button', { name: /Analiz Et/i });
  await expect(analyzeButton).toBeDisabled();

  // 4. Metin girildiğinde butonun etkinleştiğini doğrula
  await textArea.fill('kısa metin');
  await expect(analyzeButton).toBeEnabled();
}); 
import { test, expect } from '@playwright/test';

test('AI tespit akışı başarıyla çalışıyor', async ({ page }) => {
  // AI Araçları sayfasına git
  await page.goto('/ai-content-tools');
  
  // BEST PRACTICE: API isteğini `page.route` ile yakalayıp taklit ediyoruz.
  // Bu, testimizi backend'in o anki durumundan bağımsız ve kararlı hale getirir.
  await page.route('**/api/ai-content-tools/detect', async route => {
    // KULLANICI TARAFINDAN SAĞLANAN DOĞRU MOCK VERİ YAPISI
    const mockResponse = {
      title: 'Mock Başlık',
      results: [
        {
          paragraph: [
            { text: 'Bu, Playwright tarafından yazılmış bir test metnidir.', is_ai: true }
          ]
        }
      ],
      overall_score: 0.9876 // Örneğin bir skor
    };
    // İsteği sahte yanıtımızla ve 200 OK durumuyla tamamlıyoruz.
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    });
  });
  
  // Metin giriş alanını bul ve metni yapıştır
  // getByLabel ile seçiciyi daha sağlam hale getirelim -> Geri alındı, getByPlaceholder kullanılıyor.
  await page.getByPlaceholder('Metni buraya yapıştırın...').fill('Bu, Playwright tarafından yazılmış bir test metnidir.');
  
  // Buton locator'ını al
  const detectButton = page.getByRole('button', { name: 'AI Tespit Et' });

  // Butonun etkinleşmesini (enabled) bekle (Sizin önerdiğiniz doğru yöntem)
  await expect(detectButton).toBeEnabled({ timeout: 5000 });

  // Şimdi güvenle tıkla
  await detectButton.click();
  
  // Sonucun ekranda göründüğünü doğrula
  await expect(
    page.getByText(/AI Tarafından Yazılma Oranı:/)
  ).toBeVisible({ timeout: 5000 });
});

// ÖNCEKİ BAŞARISIZ TESTİ BU YENİ VERSİYONLA DEĞİŞTİRİYORUZ.
// Testin adını ve amacını, uygulamanın doğru davranışını yansıtacak şekilde güncelledik.
test('Metin alanı boşken "AI Tespit Et" butonu devre dışı olmalı', async ({ page }) => {
  // 1. AI Araçları sayfasına git
  await page.goto('/ai-content-tools');

  // 2. Metin giriş alanının boş olduğunu doğrula.
  // getByLabel yerine getByPlaceholder kullanıyoruz.
  const textArea = page.getByPlaceholder('Metni buraya yapıştırın...');
  await expect(textArea).toHaveValue('');

  // 3. "AI Tespit Et" butonunun DEVRE DIŞI (disabled) olduğunu doğrula.
  const detectButton = page.getByRole('button', { name: 'AI Tespit Et' });
  await expect(detectButton).toBeDisabled();
}); 
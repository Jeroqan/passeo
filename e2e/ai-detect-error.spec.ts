import { test, expect } from '@playwright/test';

test('Detect API 500 hatası döndüğünde kullanıcıya hata mesajı gösterilmeli', async ({ page }) => {
  // 1. Detect endpoint'ini hata döndürecek şekilde mock'la
  await page.route('**/api/ai-content-tools/detect', route =>
    route.fulfill({ 
      status: 500, 
      contentType: 'application/json',
      body: JSON.stringify({ message: 'İç sunucu hatası oluştu.' }) 
    })
  );

  // 2. Sayfaya git, metin gir
  await page.goto('/ai-content-tools');
  await page.getByPlaceholder('Metni buraya yapıştırın...').fill('Bu metin bir hataya neden olacak');
  
  // Butonun aktifleşmesini bekle ve tıkla
  const detectButton = page.getByRole('button', { name: 'AI Tespit Et' });
  await expect(detectButton).toBeEnabled();
  await detectButton.click();

  // 3. `role="alert"` olan ve içinde beklenen hata metnini barındıran DIV'i bul.
  // Bu, en sağlam ve doğru yöntemdir.
  const errorAlert = page.locator('div[role="alert"]', {
    hasText: 'İç sunucu hatası oluştu.'
  });
  await expect(errorAlert).toBeVisible();
}); 
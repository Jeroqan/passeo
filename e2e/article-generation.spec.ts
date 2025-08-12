import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/auth/user.json' });

test('Makale üretme akışı başarıyla çalışıyor', async ({ page }) => {
  // 1️⃣ API mock: Tek seferde tamamlanmış bir SSE metin gövdesi oluştur
  const sseBody = [
    'data: {"type":"content","value":"<h1>Test Başlık</h1>"}',
    'data: {"type":"content","value":"<p>Bu bir test paragrafıdır.</p>"}',
    'data: {"type":"done"}'
  ].join('\\n\\n') + '\\n\\n';

  await page.route('**/api/generate-content/article', async (route) => {
    // İstek body'sini kontrol etmeye devam edelim, bu iyi bir pratik
    const requestBody = route.request().postDataJSON();
    expect(requestBody).toEqual({
      productName: 'SuperWidget',
      brand: 'Acme',
      category: 'https://www.turkcell.com.tr/pasaj/hobi-oyun/fotograf-kamera/aksiyon-kameralari/',
      keyword: 'yüksek performans',
    });
    
    // Hazırlanan SSE string'ini body olarak gönder
    route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8'
      },
      body: sseBody,
    });
  });

  // 2️⃣ Sayfaya git ve formu doldur
  await page.goto('/article-generation');
  await page.getByPlaceholder('Ürün Adı (Örn: iPhone 15 Pro Max)').fill('SuperWidget');
  await page.getByPlaceholder('Marka (Örn: Apple)').fill('Acme');
  
  // Kategori seçimi için doğru ve mevcut bir veriyi kullan
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Aksiyon Kameralar' }).click();

  await page.getByPlaceholder('Anahtar Kelime (Örn: en iyi kamera)').fill('yüksek performans');

  // 3️⃣ Üret butonuna tıkla
  const generateBtn = page.getByRole('button', { name: /Makale Üret/i });
  await expect(generateBtn).toBeEnabled();
  await generateBtn.click();

  // 4️⃣ SSE sonucunun DOM'a eklenmesini bekle
  const resultArea = page.locator('#article-result');
  // Önce başlığın gelmesini bekle ve doğrula
  await expect(resultArea.locator('h1')).toHaveText('Test Başlık', { timeout: 10000 });
  // Sonra paragrafın içeriğini kontrol et
  await expect(resultArea).toContainText('Bu bir test paragrafıdır.');

  // 5️⃣ Butonun tekrar aktifleştiğini doğrula
  await expect(generateBtn).toBeEnabled();
}); 
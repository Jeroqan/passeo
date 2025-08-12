import { test, expect } from '@playwright/test';

test.describe('AI İçerik Doğallaştırma Akışı', () => {
  test('Şüpheli paragraf seçilip humanize edilebilmeli', async ({ page }) => {
    // 1. Detect API'sini taklit et
    await page.route('**/api/ai-content-tools/detect', async route => {
      const json = {
        results: [ { paragraph: [
          { text: 'The rapid advancement of artificial intelligence presents a fascinating case study in technological evolution.', is_ai: false },
          { text: ' Consequently, many modern systems are now capable of generating text that is virtually indistinguishable from human writing, a development that carries significant implications for the future of digital content.', is_ai: true }
        ] } ],
        overall_ai_probability: 0.98
      };
      await route.fulfill({ json });
    });

    // 2. Humanize API'sini taklit et (Sizin önerinizle eklendi)
    await page.route('**/api/ai-content-tools/humanize', async route => {
      const json = {
        humanizedText:
          'The rapid advancement of artificial intelligence presents a fascinating case study in technological evolution.\n\n' +
          'Bu paragraf artık insanlaştırıldı.'
      };
      await route.fulfill({ json });
    });

    await page.goto('/ai-content-tools');

    await page.getByPlaceholder('Metni buraya yapıştırın...').fill('Bu metin önemli değil, çünkü API yanıtları taklit ediliyor.');

    // "AI Tespit Et" butonu için bekleme ve tıklama
    const detectButton = page.getByRole('button', { name: 'AI Tespit Et' });
    await expect(detectButton).toBeEnabled({ timeout: 5000 });
    await detectButton.click();

    const suspectCheckbox = page.getByRole('checkbox', { name: /Consequently, many modern systems/ });
    await expect(suspectCheckbox).toBeVisible();
    await suspectCheckbox.check();

    // "Doğallaştır" butonu için bekleme ve tıklama
    const humanizeButton = page.getByRole('button', { name: /Seçili \d+ Paragrafı Doğallaştır/i });
    await expect(humanizeButton).toBeEnabled({ timeout: 5000 });
    await humanizeButton.click();

    // 3. Sonuçları doğrula
    const humanizedTextArea = page.getByPlaceholder('Metni buraya yapıştırın...');
    await expect(humanizedTextArea).toContainText('The rapid advancement of artificial intelligence');
    await expect(humanizedTextArea).toContainText('Bu paragraf artık insanlaştırıldı.');
    await expect(humanizedTextArea).not.toContainText('Consequently, many modern systems');
  });
}); 
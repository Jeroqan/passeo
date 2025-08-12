// tests/promptBuilder/contentBlockPrompt.spec.ts
import { createContentBlockPrompt } from '@/lib/promptBuilder/contentBlockPrompt';

describe('createContentBlockPrompt', () => {
  it('ürün adı, marka, kategori ve anahtar kelimeyi içererek mantıklı bir HTML blok promptu oluşturmalı', () => {
    const productName = 'SuperWidget';
    const brand = 'Acme';
    const category = 'Elektronik';
    const keyword = 'yüksek performans';

    const prompt = createContentBlockPrompt(productName, brand, category, keyword);

    // Temel bilgileri içerdiğini doğrulayalım
    expect(prompt).toContain('SuperWidget');
    expect(prompt).toContain('Acme');
    expect(prompt).toContain('Elektronik');
    expect(prompt).toContain('yüksek performans');

    // Örnek HTML etiketlerinin varlığını kontrol edelim
    expect(prompt).toMatch(/<h2>/);
    expect(prompt).toMatch(/<p>/);
  });

  it('oluşturulan prompt için bir snapshot ile eşleşmeli', () => {
    const prompt = createContentBlockPrompt(
      'Test Product',
      'Test Brand',
      'Test Category',
      'test keyword'
    );
    expect(prompt).toMatchSnapshot();
  });
}); 
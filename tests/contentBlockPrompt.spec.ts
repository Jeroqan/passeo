import { createContentBlockPrompt } from '@/lib/promptBuilder/contentBlockPrompt';

describe('createContentBlockPrompt', () => {
  const params = {
    productName: 'SüperMouse X1',
    brand: 'PasajTech',
    category: 'Oyun Ekipmanı',
    keyword: 'yüksek hassasiyet'
  };

  it('Ürün adı, marka, kategori ve anahtar kelimeyi prompt içinde barındırır', () => {
    const prompt = createContentBlockPrompt(params.productName, params.brand, params.category, params.keyword);

    expect(prompt).toContain(params.productName);
    expect(prompt).toContain(params.brand);
    expect(prompt).toContain(params.category);
    expect(prompt).toContain(params.keyword);
  });

  it('Beklenen yapıda bir instruct tarzı prompt döner', () => {
    const prompt = createContentBlockPrompt(params.productName, params.brand, params.category, params.keyword);
    // Örneğin prompt'un bir sistem talimatıyla başladığını veya
    // "Write an HTML block" gibi bir ibare içerdiğini varsayıyoruz:
    expect(prompt).toMatch(/HTML/i);
    expect(prompt).toMatch(/SEO/i);
  });
}); 
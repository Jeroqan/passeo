// tests/logic/contentBlock.spec.ts
import { processContentBlockRequest } from '@/lib/contentBlockLogic';
// createContentBlockPrompt'u artık mock'lamayacağımız için import etmeye gerek yok.

describe('processContentBlockRequest Logic', () => {
  it('eksik alan gönderilirse 400 hatası dönmeli', () => {
    const result = processContentBlockRequest({
      productName: 'Ürün',
      brand: 'Marka',
      category: 'Kategori',
      // keyword eksik
    });
    expect(result).toEqual({ error: 'Eksik bilgi gönderildi.', status: 400 });
  });

  it('tüm alanlar boş string ise 400 hatası dönmeli', () => {
    const result = processContentBlockRequest({
      productName: '',
      brand: '',
      category: '',
      keyword: '',
    });
    expect(result).toEqual({ error: 'Eksik bilgi gönderildi.', status: 400 });
  });

  it('keyword çok uzunsa 400 hatası dönmeli', () => {
    const longKeyword = 'a'.repeat(101);
    const result = processContentBlockRequest({
      productName: 'Ürün',
      brand: 'Marka',
      category: 'Kategori',
      keyword: longKeyword,
    });
    expect(result).toEqual({ error: 'Anahtar kelime çok uzun.', status: 400 });
  });

  it('geçerli istek ile bir prompt stringi oluşturulmalı', () => {
    const payload = {
      productName: 'P',
      brand: 'M',
      category: 'K',
      keyword: 'anahtar',
    };
    const result = processContentBlockRequest(payload);

    if ('error' in result) {
      fail('Test başarısız olmamalıydı ama bir hata döndü.');
    }

    // Dönen prompt'un bir string olduğunu ve payload'daki bilgileri içerdiğini kontrol et
    expect(typeof result.prompt).toBe('string');
    expect(result.prompt.length).toBeGreaterThan(0);
    expect(result.prompt).toContain('P');
    expect(result.prompt).toContain('anahtar');
  });
}); 
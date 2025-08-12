import { hashText, detectCache } from '@/lib/cache';

describe('hashText', () => {
  it('aynı metin için aynı hash döndürür', () => {
    const a = hashText('merhaba dünya');
    const b = hashText('merhaba dünya');
    expect(a).toBe(b);
  });

  it('farklı metinler için farklı hash döndürür', () => {
    const a = hashText('merhaba');
    const b = hashText('dünya');
    expect(a).not.toBe(b);
  });

  it('hash uzunluğu 64 karakter olduğundan emin olur', () => {
    const h = hashText('test');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('detectCache', () => {
  const sampleKey = hashText('örnek');
  const sampleData = { title: 'T', results: [], overall_score: 0 };

  beforeEach(() => {
    detectCache.clear();
  });

  it('önce cache boş, sonra set ve get çalışır', () => {
    expect(detectCache.has(sampleKey)).toBe(false);
    detectCache.set(sampleKey, sampleData);
    expect(detectCache.has(sampleKey)).toBe(true);
    expect(detectCache.get(sampleKey)).toEqual(sampleData);
  });

  it('clear() tüm girdileri temizler', () => {
    detectCache.set(sampleKey, sampleData);
    expect(detectCache.has(sampleKey)).toBe(true);
    detectCache.clear();
    expect(detectCache.has(sampleKey)).toBe(false);
  });
}); 
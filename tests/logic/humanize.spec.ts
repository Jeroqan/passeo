// tests/logic/humanize.spec.ts
import { processHumanizeRequest } from '@/lib/aiHumanizeLogic';
import { openai } from '@/lib/openai';

// openai.chat.completions.create fonksiyonunu mock'luyoruz
jest.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe('processHumanizeRequest Logic', () => {
  const createMock = openai.chat.completions.create as jest.Mock;

  it('geçerli gövde ile başarılı bir şekilde metni doğallaştırmalı', async () => {
    createMock.mockResolvedValue({
      choices: [{ message: { content: 'EDITED: B' } }],
    });

    const result = await processHumanizeRequest('A\\n\\nB\\n\\nC', ['B']);

    if ('error' in result) {
      fail('Test başarısız olmamalıydı ama bir hata döndü.');
    }

    expect(createMock).toHaveBeenCalled();
    expect(result.humanizedText).toContain('EDITED: B');
  });

  it('fullText eksikse 400 hatası dönmeli', async () => {
    const result = await processHumanizeRequest(null, ['B']);
    expect(result).toEqual({ error: 'Tam metin ve seçili paragraflar gereklidir.', status: 400 });
  });

  it('selected eksik veya boş ise 400 hatası dönmeli', async () => {
    const result1 = await processHumanizeRequest('A', null);
    expect(result1).toEqual({ error: 'Tam metin ve seçili paragraflar gereklidir.', status: 400 });

    const result2 = await processHumanizeRequest('A', []);
    expect(result2).toEqual({ error: 'Tam metin ve seçili paragraflar gereklidir.', status: 400 });
  });

  it('OpenAI servisi hata fırlatırsa 500 hatası dönmeli', async () => {
    createMock.mockRejectedValue(new Error('OpenAI API Error'));

    const result = await processHumanizeRequest('A', ['A']);
    expect(result).toEqual({ error: 'Dahili Sunucu Hatası', status: 500 });
  });

  it('OpenAI servisi boş yanıt dönerse 500 hatası dönmeli', async () => {
    createMock.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    const result = await processHumanizeRequest('A', ['A']);
    expect(result).toEqual({ error: 'Modelden geçerli bir yanıt alınamadı.', status: 500 });
  });
}); 
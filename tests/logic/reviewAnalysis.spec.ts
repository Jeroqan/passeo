import { processReviewAnalysis, ReviewAnalysisResponse, ApiError } from '@/lib/reviewAnalysisLogic';
import { openai } from '@/lib/openai';

// OpenAI modülünü taklit ediyoruz
jest.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
}));

// OpenAI mock'unu daha kolay erişilebilir hale getiriyoruz
const mockedOpenAICreate = openai.chat.completions.create as jest.Mock;

describe('processReviewAnalysis Logic', () => {

  beforeEach(() => {
    // Her testten önce mock'ları sıfırla
    mockedOpenAICreate.mockClear();
  });

  it('boş veya kısa metin gönderilirse 400 durum kodu ile hata dönmeli', async () => {
    const result1 = await processReviewAnalysis(undefined) as ApiError;
    expect(result1.status).toBe(400);
    expect(result1.error).toMatch(/bir metin gereklidir/i);

    const result2 = await processReviewAnalysis('abc') as ApiError;
    expect(result2.status).toBe(400);
    expect(result2.error).toMatch(/bir metin gereklidir/i);
  });

  it('geçerli metin ile başarılı bir analiz sonucu dönmeli', async () => {
    const mockResponse: ReviewAnalysisResponse = {
      sentiment: 'Pozitif',
      categories: ['Ürün Kalitesi', 'Kargo'],
    };

    mockedOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    });

    const result = await processReviewAnalysis('Bu ürün harika ve çok hızlı geldi.') as ReviewAnalysisResponse;

    expect(result.sentiment).toBe('Pozitif');
    expect(result.categories).toEqual(['Ürün Kalitesi', 'Kargo']);
    expect(mockedOpenAICreate).toHaveBeenCalledTimes(1);
  });

  it('OpenAI API hatası durumunda 500 durum kodu ile hata dönmeli', async () => {
    mockedOpenAICreate.mockRejectedValue(new Error('OpenAI API Error'));

    const result = await processReviewAnalysis('Bu bir test yorumudur.') as ApiError;

    expect(result.status).toBe(500);
    expect(result.error).toMatch(/sunucuda bir hata oluştu/i);
  });

  it('OpenAI APIden geçersiz formatta yanıt gelirse 500 durum kodu ile hata dönmeli', async () => {
    const invalidResponse = {
      duygu: 'Pozitif', // 'sentiment' olmalıydı
      konular: ['Test'], // 'categories' olmalıydı
    };
    
    mockedOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(invalidResponse) } }],
    });

    const result = await processReviewAnalysis('Bu bir test yorumudur.') as ApiError;

    expect(result.status).toBe(500);
    expect(result.error).toMatch(/yanıt doğrulanamadı/i);
  });
}); 
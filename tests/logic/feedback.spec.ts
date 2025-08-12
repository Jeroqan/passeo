import { processFeedback, FeedbackData } from '@/lib/feedbackLogic';

// Bağımlılıkları taklit ediyoruz.
const mockSaveFeedback = jest.fn();

describe('processFeedback Logic', () => {

  beforeEach(() => {
    mockSaveFeedback.mockClear();
  });

  it('geçerli geri bildirim verisiyle başarılı bir şekilde kayıt yapmalı', async () => {
    const validData: FeedbackData = {
      type: 'BUG',
      message: 'Uygulamada bir buton çalışmıyor.',
      page: '/some-page',
    };
    
    const expectedResult = { id: '1', ...validData, createdAt: new Date() };
    mockSaveFeedback.mockResolvedValue(expectedResult);

    const result = await processFeedback(validData, { saveFeedback: mockSaveFeedback });

    expect(mockSaveFeedback).toHaveBeenCalledWith(validData);
    expect(result).toEqual(expectedResult);
  });

  it('geçersiz veri (çok kısa mesaj) gönderildiğinde 400 hatası dönmeli', async () => {
    const invalidData = {
      type: 'GENERAL_FEEDBACK',
      message: 'kısa',
    } as FeedbackData;

    const result = await processFeedback(invalidData, { saveFeedback: mockSaveFeedback });

    if ('error' in result) {
      expect(result.status).toBe(400);
      expect(result.error).toMatch(/Geçersiz geri bildirim verisi/i);
    } else {
      fail('Hata nesnesi bekleniyordu.');
    }
    
    expect(mockSaveFeedback).not.toHaveBeenCalled();
  });

  it('Kaydetme fonksiyonu hata fırlatırsa 500 hatası dönmeli', async () => {
    const validData: FeedbackData = {
      type: 'FEATURE_REQUEST',
      message: 'Yeni bir özellik talebinde bulunuyorum.',
    };

    mockSaveFeedback.mockRejectedValue(new Error('Database connection lost'));

    const result = await processFeedback(validData, { saveFeedback: mockSaveFeedback });
    
    if ('error'in result) {
      expect(result.status).toBe(500);
      expect(result.error).toMatch(/sunucu hatası oluştu/i);
    } else {
      fail('Hata nesnesi bekleniyordu.');
    }
  });
}); 
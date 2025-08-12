import { analyzeKeywords } from '@/lib/keywordAnalysisLogic';
import { getJson } from 'serpapi';
import OpenAI from 'openai';

// Manuel mock'u etkinleştir
jest.mock('openai');
jest.mock('serpapi');

// Manuel mock'tan mockCreate fonksiyonunu al ve tipi düzelt
const { mockCreate } = OpenAI as any;

const mockedGetJson = getJson as jest.Mock;

describe('analyzeKeywords Logic', () => {
  const productInfo = {
    name: 'Test Product',
    category: 'Test Category',
    brand: 'Test Brand',
  };

  beforeEach(() => {
    // Her testten önce mock'ları temizle
    jest.clearAllMocks();
    mockCreate.mockClear();
  });

  describe('Free Mode (isFree = true)', () => {
    it('should return keywords based on OpenAI features without calling SerpApi', async () => {
      // OpenAI mock'unu ayarla
      const mockFeatures = 'özellik 1, özellik 2, özellik 3';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: mockFeatures } }],
      });

      const result = await analyzeKeywords(productInfo, true);

      // Sonucu doğrula
      expect(result.keywords).toBeInstanceOf(Array);
      expect(result.keywords.length).toBe(3);
      expect(result.keywords[0].text).toBe('özellik 1');
      expect(mockedGetJson).not.toHaveBeenCalled();
    });

    it('should throw an error if OpenAI fails', async () => {
        mockCreate.mockRejectedValue(new Error('OpenAI API Error'));
        await expect(analyzeKeywords(productInfo, true)).rejects.toThrow('OpenAI API Error');
    });
  });

  describe('Normal Mode (isFree = false)', () => {
    it('should return keywords using both OpenAI and SerpApi, sorted by trend', async () => {
      const mockFeatures = 'pil ömrü, kamera kalitesi';
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: mockFeatures } }],
      });

      mockedGetJson.mockImplementation((params: { q: string }) => {
        if (params.q === 'Test Product pil ömrü') {
          return Promise.resolve({ trend: 85, searchVolume: 1000, related_searches: [] });
        }
        if (params.q === 'Test Product kamera kalitesi') {
          return Promise.resolve({ trend: 95, searchVolume: 1500, related_searches: [] });
        }
        if (params.q === 'Test Product teknik özellikleri') {
          return Promise.resolve({ trend: 75, searchVolume: 500, related_searches: [] });
        }
        return Promise.resolve({ trend: 0, searchVolume: 0, related_searches: [] });
      });

      const result = await analyzeKeywords(productInfo, false);

      // Sonucun anlık görüntüsüyle (snapshot) eşleştiğini doğrula
      expect(result.keywords).toMatchSnapshot();
    });

    it('should throw an error if SerpApi fails', async () => {
        mockCreate.mockResolvedValue({ choices: [{ message: { content: 'feature1' } }] });
        mockedGetJson.mockRejectedValue(new Error('SerpApi Error'));
        await expect(analyzeKeywords(productInfo, false)).rejects.toThrow('SerpApi Error');
    });
  });
}); 
import { prepareArticleGeneration } from '@/lib/articleGenerationLogic';
import { createArticlePrompt } from '@/lib/promptBuilder/articlePrompt';

// OpenAI istemcisinin başlatılmasını engellemek için mock'la
// jest.mock('@/lib/openai'); // Bu artık src/__mocks__/openai.js tarafından otomatik yapılıyor.
// Sadece prompt builder'ı mock'la, çünkü logic fonksiyonumuz artık sadece onu kullanıyor.
jest.mock('@/lib/promptBuilder/articlePrompt');

describe('prepareArticleGeneration Logic', () => {
  const mockCreateArticlePrompt = createArticlePrompt as jest.Mock;

  beforeEach(() => {
    // Her testten önce mock'ları temizle
    jest.clearAllMocks();
  });

  const validParams = {
    productName: 'Test Product',
    brand: 'Test Brand',
    category: 'Test Category',
    keyword: 'test keyword',
  };

  it('should throw an error if validation fails', () => {
    const invalidParams = { ...validParams, productName: '' }; // Geçersiz parametre
    // Fonksiyon artık async olmadığı için toThrow senkron olarak çağrılır
    expect(() => prepareArticleGeneration(invalidParams)).toThrow();
  });

  it('should call createArticlePrompt with correct parameters', () => {
    mockCreateArticlePrompt.mockReturnValue('mocked prompt');
    prepareArticleGeneration(validParams);
    expect(mockCreateArticlePrompt).toHaveBeenCalledWith(validParams);
  });

  it('should return a messages array with system and user roles, and the correct prompt', () => {
    const prompt = 'this is a mocked prompt';
    mockCreateArticlePrompt.mockReturnValue(prompt);

    const { messages } = prepareArticleGeneration(validParams);

    expect(messages).toBeInstanceOf(Array);
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({
      role: 'system',
      content: "You are a helpful assistant that provides responses in HTML format, chunk by chunk.",
    });
    expect(messages[1]).toEqual({
      role: 'user',
      content: prompt,
    });
  });
}); 
import { getAiDetectionResult, AiDetectionApiResponse, processAiDetection } from '@/lib/aiDetectionLogic';
import * as aiDetectionLogic from '@/lib/aiDetectionLogic';
import { detectCache, hashText } from '@/lib/cache';
import * as aiDetectionService from '@/lib/aiDetectionService';
import { AiBlock } from '@/lib/textUtils';

// Mock the openai module to prevent the real client from being instantiated
// jest.mock('@/lib/openai'); // Bu artık src/__mocks__/openai.js tarafından otomatik yapılıyor.
// Mock the entire aiDetectionService module
jest.mock('@/lib/aiDetectionService');

// Create a typed mock for the service function
const mockedDetectAiParagraphs = aiDetectionService.detectAiParagraphs as jest.Mock;

describe('processAiDetection with Clustering', () => {

  beforeEach(() => {
    mockedDetectAiParagraphs.mockClear();
  });

  it('should call detectAiParagraphs and return formatted response with clusters', async () => {
    const text = 'Bu bir AI paragrafı.\n\nBu ise insan yazısı.';
    const paragraphs = ['Bu bir AI paragrafı.', 'Bu ise insan yazısı.'];
    const scores = [0.9, 0.1];
    
    mockedDetectAiParagraphs.mockResolvedValue({ scores });

    const result = await processAiDetection(text) as AiDetectionApiResponse;

    expect(mockedDetectAiParagraphs).toHaveBeenCalledWith(paragraphs);
    expect(result.overall_ai_probability).toBeCloseTo(0.5);
    expect(result.paragraphs).toEqual(paragraphs);
    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]).toEqual({
      start: 0,
      end: 0,
      texts: ['Bu bir AI paragrafı.']
    });
  });

  it('should return an empty array for clusters if no paragraph is above threshold', async () => {
    const text = 'Hepsi insan tarafından yazıldı.';
    const paragraphs = ['Hepsi insan tarafından yazıldı.'];
    const scores = [0.2];
    
    mockedDetectAiParagraphs.mockResolvedValue({ scores });

    const result = await processAiDetection(text) as AiDetectionApiResponse;

    expect(result.clusters).toEqual([]);
    expect(result.overall_ai_probability).toBeCloseTo(0.2);
  });

  it('should return an error if detectAiParagraphs fails', async () => {
    const text = 'Bu metin hataya neden olacak.';
    mockedDetectAiParagraphs.mockResolvedValue({ error: true, scores: [] });

    const result = await processAiDetection(text);
    expect(result).toEqual({ error: 'Error during AI detection', status: 500 });
  });

    it('text verilmezse 400 döner', async () => {
    const result = await processAiDetection();
    expect(result).toEqual({ error: 'Text is required', status: 400 });
    expect(mockedDetectAiParagraphs).not.toHaveBeenCalled();
  });
});

// Note: The 'getAiDetectionResult' tests are now somewhat outdated as they don't account for clustering.
// They would need to be updated to mock 'detectAiParagraphs' and check for the new response shape
// if that caching layer were to be used moving forward. For now, we focus on processAiDetection. 
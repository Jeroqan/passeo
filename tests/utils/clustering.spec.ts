import { clusterAiBlocks, AiBlock } from '@/lib/textUtils';

describe('clusterAiBlocks', () => {

  it('should return an empty array if no paragraphs are provided', () => {
    const result = clusterAiBlocks([], [], 0.5);
    expect(result).toEqual([]);
  });

  it('should not form any blocks if no scores meet the threshold', () => {
    const paragraphs = ['p1', 'p2', 'p3'];
    const scores = [0.1, 0.2, 0.3];
    const threshold = 0.5;
    const result = clusterAiBlocks(paragraphs, scores, threshold);
    expect(result).toEqual([]);
  });

  it('should form a single block if all scores meet the threshold', () => {
    const paragraphs = ['p1', 'p2', 'p3'];
    const scores = [0.6, 0.7, 0.8];
    const threshold = 0.5;
    const expected: AiBlock[] = [
      { start: 0, end: 2, texts: ['p1', 'p2', 'p3'] }
    ];
    const result = clusterAiBlocks(paragraphs, scores, threshold);
    expect(result).toEqual(expected);
  });

  it('should form multiple blocks for separate groups of AI content', () => {
    const paragraphs = ['human1', 'ai1', 'ai2', 'human2', 'ai3', 'human3'];
    const scores = [0.1, 0.8, 0.9, 0.2, 0.7, 0.3];
    const threshold = 0.5;
    const expected: AiBlock[] = [
      { start: 1, end: 2, texts: ['ai1', 'ai2'] },
      { start: 4, end: 4, texts: ['ai3'] }
    ];
    const result = clusterAiBlocks(paragraphs, scores, threshold);
    expect(result).toEqual(expected);
  });

  it('should handle blocks at the beginning and end of the text', () => {
    const paragraphs = ['ai1', 'ai2', 'human1', 'human2', 'ai3', 'ai4'];
    const scores = [0.9, 0.8, 0.1, 0.2, 0.7, 0.6];
    const threshold = 0.5;
    const expected: AiBlock[] = [
      { start: 0, end: 1, texts: ['ai1', 'ai2'] },
      { start: 4, end: 5, texts: ['ai3', 'ai4'] }
    ];
    const result = clusterAiBlocks(paragraphs, scores, threshold);
    expect(result).toEqual(expected);
  });

  it('should handle mismatched array lengths gracefully', () => {
    // scores array is shorter than paragraphs
    const paragraphs = ['p1', 'p2', 'p3'];
    const scores = [0.9, 0.8];
    const threshold = 0.5;
    const expected: AiBlock[] = [
        { start: 0, end: 1, texts: ['p1', 'p2'] }
    ];
    const result = clusterAiBlocks(paragraphs, scores, threshold);
    expect(result).toEqual(expected);
  });

  it('should treat a score equal to the threshold as AI content', () => {
    const paragraphs = ['p1'];
    const scores = [0.5];
    const threshold = 0.5;
    const expected: AiBlock[] = [{ start: 0, end: 0, texts: ['p1'] }];
    const result = clusterAiBlocks(paragraphs, scores, threshold);
    expect(result).toEqual(expected);
  });
}); 
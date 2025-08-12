import { buildArticlePrompt, ArticlePromptParams } from '@/lib/promptBuilder/articlePrompt';

describe('buildArticlePrompt', () => {
  it('should generate the correct prompt with given parameters', () => {
    const params: ArticlePromptParams = {
      productName: 'Süper Akıllı Telefon',
      brand: 'TeknoMarka',
      category: 'Elektronik',
      keyword: 'en iyi akıllı telefon',
    };

    const prompt = buildArticlePrompt(params);

    // Check if all parameters are included in the prompt
    expect(prompt).toContain(params.productName);
    expect(prompt).toContain(params.brand);
    expect(prompt).toContain(params.category);
    expect(prompt).toContain(params.keyword);

    // Use a snapshot to verify the overall structure of the prompt
    expect(prompt).toMatchSnapshot();
  });
}); 
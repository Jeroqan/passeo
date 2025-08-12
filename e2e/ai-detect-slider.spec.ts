import { test, expect } from '@playwright/test';

test.describe('AI Content Tools - Dynamic Threshold', () => {

  test('should dynamically update highlighted paragraphs and clusters when threshold slider changes', async ({ page }) => {
    // 1. Mock the detect API to return a specific set of scores
    await page.route('**/api/ai-content-tools/detect', async route => {
      const responseBody = {
        paragraphs: [
          "Paragraph 1 (Score: 0.05)",
          "Paragraph 2 (Score: 0.12)",
          "Paragraph 3 (Score: 0.20)",
          "Paragraph 4 (Score: 0.08)",
          "Paragraph 5 (Score: 0.15)"
        ],
        // The scores are chosen to test clustering logic
        scores: [0.05, 0.12, 0.20, 0.08, 0.15],
        overall_ai_probability: 0.12, // Dummy value, not tested here
        results: [], // Dummy value, not tested here
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      });
    });

    // 2. Navigate to the page and trigger detection
    await page.goto('/ai-content-tools');
    await page.getByPlaceholder('Metni buraya yapıştırın...').fill('A test text to trigger the mocked API.');
    await page.getByRole('button', { name: 'AI Tespit Et' }).click();
    
    // 3. Verify initial state with default threshold (0.10)
    // Scores >= 0.10 are: 0.12, 0.20, 0.15. That's 3 highlighted paragraphs.
    // Clustering: P2 and P3 are consecutive and >= 0.10, forming one block. P5 is also >= 0.10 but not consecutive, forming a second block.
    // So, we expect 3 highlighted paragraphs and 2 cluster blocks.
    await expect(page.locator('.ai-paragraph-highlight')).toHaveCount(3);
    await expect(page.locator('[data-testid^="ai-block-"]')).toHaveCount(2);

    // 4. Move slider to 0.15 and verify
    // Scores >= 0.15 are: 0.20, 0.15. That's 2 highlighted paragraphs.
    // These are not consecutive, so they form 2 separate blocks.
    const slider = page.locator('#threshold-slider');
    await slider.fill('0.15');
    await expect(page.locator('.ai-paragraph-highlight')).toHaveCount(2);
    await expect(page.locator('[data-testid^="ai-block-"]')).toHaveCount(2);

    // 5. Move slider to 0.25 and verify
    // Scores >= 0.25: none. We expect 0 highlighted paragraphs and 0 clusters.
    await slider.fill('0.25');
    await expect(page.locator('.ai-paragraph-highlight')).toHaveCount(0);
    await expect(page.locator('[data-testid^="ai-block-"]')).toHaveCount(0);
  });

}); 
import { openai } from '@/lib/openai';
import { buildHumanizePrompt } from '@/lib/promptBuilder/humanizePrompt';

export interface HumanizeApiResponse {
  humanizedText: string;
}

export interface ApiError {
  error: string;
  status: number;
}

// Helper function to escape special characters for regex
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function processHumanizeRequest(
  fullText: string | undefined | null,
  selected: string[] | undefined | null
): Promise<HumanizeApiResponse | ApiError> {
  if (!fullText || !selected || !Array.isArray(selected) || selected.length === 0) {
    return { error: 'Tam metin ve seçili paragraflar gereklidir.', status: 400 };
  }

  try {
    // Extract the title part of the text, which should not be rewritten
    const lines = fullText.split('\\n');
    let title = '';
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() !== '') {
            title = lines[i];
            break;
        }
    }

    const humanizePrompt = buildHumanizePrompt({ fullText, selected });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: humanizePrompt }],
      temperature: 0.7,
    });

    const humanizedBody = response.choices[0].message.content?.trim();

    if (!humanizedBody) {
      return { error: 'Modelden geçerli bir yanıt alınamadı.', status: 500 };
    }
    
    // Re-attach the original title to the humanized body
    const humanizedText = [title, humanizedBody].filter(Boolean).join('\\n\\n');
    return { humanizedText };

  } catch (error) {
    console.error('PROCESS_HUMANIZE_ERROR:', error);
    return { error: 'Dahili Sunucu Hatası', status: 500 };
  }
} 
// tests/promptBuilder/humanizePrompt.spec.ts
import { buildHumanizePrompt, HumanizeParams } from '@/lib/promptBuilder/humanizePrompt';

describe('buildHumanizePrompt', () => {
  it('fullText ve seçili paragrafları etiketleyerek doğru prompt oluşturmalı', () => {
    const params: HumanizeParams = {
      fullText: 'Başlık\n\nBirinci paragraf.\n\nİkinci paragraf.',
      selected: ['Birinci paragraf.']
    };

    const prompt = buildHumanizePrompt(params);

    // Rewrite etiketinin doğru uygulandığını kontrol edelim
    expect(prompt).toContain('<rewrite>Birinci paragraf.</rewrite>');
    
    // Etiketlenmiş tam metnin prompt içinde yer aldığını kontrol edelim
    expect(prompt).toContain('Girdi: Başlık\n\n<rewrite>Birinci paragraf.</rewrite>\n\nİkinci paragraf.');
    
    // Seçilmeyen paragrafın etiketlenmediğini kontrol edelim
    expect(prompt).not.toContain('<rewrite>İkinci paragraf.</rewrite>');
  });

  it('oluşturulan prompt için bir snapshot ile eşleşmeli', () => {
    const params: HumanizeParams = {
      fullText: 'Ana Başlık\n\nYeniden yazılacak cümle.\n\nBu cümle olduğu gibi kalacak.\n\nBu da yeniden yazılacak.',
      selected: ['Yeniden yazılacak cümle.', 'Bu da yeniden yazılacak.']
    };
    const prompt = buildHumanizePrompt(params);
    expect(prompt).toMatchSnapshot();
  });
}); 
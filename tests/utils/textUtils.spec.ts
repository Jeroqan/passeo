import { splitIntoParagraphs } from '@/lib/textUtils';

describe('splitIntoParagraphs', () => {
  it('çift boşlukla ayrılmış bölümleri paragraf olarak döndürür', () => {
    const text = 'Birinci paragraf.\n\nİkinci paragraf.\n\nÜçüncü.';
    const paras = splitIntoParagraphs(text);
    expect(paras).toEqual([
      'Birinci paragraf.',
      'İkinci paragraf.',
      'Üçüncü.'
    ]);
  });

  it('başta/sonda fazladan boşlukları kırpar', () => {
    const text = '\n\n  A  \n\n  B  ';
    expect(splitIntoParagraphs(text)).toEqual(['A', 'B']);
  });

  it('tek paragraf metni doğru şekilde döner', () => {
    expect(splitIntoParagraphs('Sadece bir paragraf')).toEqual(['Sadece bir paragraf']);
  });
}); 
export interface HumanizeParams {
  fullText: string;
  selected: string[];
}

// Helper function to escape special characters for regex, moved here for co-location
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tagSelectedText(fullText: string, selected: string[]): string {
  const paragraphs = fullText.split(/\\n\\s*\\n/);
  const uniqueSentences = [...new Set(selected)];

  const taggedParagraphs = paragraphs.map(paragraph => {
    let tempParagraph = paragraph;
    for (const sentence of uniqueSentences) {
      if (paragraph.includes(sentence)) {
        // Tag the sentence within the paragraph
        tempParagraph = tempParagraph.replace(new RegExp(escapeRegExp(sentence), 'g'), `<rewrite>${sentence}</rewrite>`);
      }
    }
    return tempParagraph;
  });

  return taggedParagraphs.join('\\n\\n');
}


export function buildHumanizePrompt({ fullText, selected }: HumanizeParams): string {
  const taggedText = tagSelectedText(fullText, selected);

  return `
Bir e-ticaret sitesinin teknik ürün içerik editörüsün. Sadece <rewrite> etiketleriyle işaretlenmiş alanları yeniden yazacaksın; cümlelerin yapısını değiştirip daha doğal, teknik ve insan eliyle yazılmış gibi sunacaksın. Blog, inceleme veya hikaye anlatımı havası olmasın; ürünle ilgili teknik ve donanım özelliklerini açık, net ve doğrudan anlatımla yaz. Her cümlede ürün adını tekrarlamaktan kaçın. Cümleleri kelime değiştirerek değil, tamamen farklı yapı ve sıralama ile yaz. Bilgi ve özellikler birebir korunmalı, anlam kaybı olmamalı. KURALLAR: - Yalnızca <rewrite> içindeki cümleleri değiştir. - <rewrite> etiketlerini kaldır. - Paragraf ve başlık düzenini aynen koru. İPUÇLARI: - Her cümle akıcı, profesyonel ve teknik dille yazılsın. - Ürün adını az kullan, yerine gerekli olursa "cihaz", "model", "ürün" gibi ifadeleri tercih et. - Kısa, net ve bilgi odaklı cümleler kullan. - Gereksiz sıfatlardan, kişisel yorumlardan kaçın. - Model adı, teknik terimler varsa olduğu gibi koru. - "Kullanıcı" kelimesini kullanmaktan kaçın. ÖRNEK: Girdi: <rewrite>Bu aksiyon kamerası, yüksek çözünürlüklü 4K videolar çekmenizi sağlar. SJCAM SJ4000 Air modeli, 170 derece geniş açılı lens ile donatılmıştır.</rewrite> Çıktı: Yüksek çözünürlüklü 4K video kaydı imkanı sunar. 170 derece geniş açılı lens ile daha kapsamlı görüntüler elde edilir. Şimdi aşağıdaki metni yukarıdaki kurallara uygun şekilde düzenle: --- Girdi: ${taggedText} --- Çıktı:
    `.trim();
} 
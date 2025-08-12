function buildKeywordExtractionPrompt({ productName, brand, category }: { productName: string; brand?: string; category: string; }) {
  const brandLine = brand ? `• Marka: ${brand}` : '';

  return `
Sen ürün özellikleri çıkarmada uzmanlaşmış, nesnel çalışan bir yapay zekâ asistanısın.

Aşağıdaki ürün, gerçek dünyada satışta olan bir üründür.
Lütfen bu ürün için en güncel, teknik özellikleri veya donanım detaylarını yalnızca kısa anahtar kelime şeklinde ve virgülle ayrılmış biçimde listele.

• Ürün Adı: ${productName}
${brandLine}
• Kategori: ${category}

Kurallar:
- Sadece teknik özellikler ve spesifikasyonlar ("hız ayarı", "başlık tipi", "temizleme fırçası" gibi)
- Sayısal değerleri yalnızca doğrudan kullanıcı aramaları için anlamlıysa ("4K video kaydı", "12.000 DPI", "2.0 inç ekran" gibi) dahil edebilirsin. Ancak anlamı bozulmadan mümkünse sayısal olmayan terimlerle ifade etmeye çalış.
- Cümle, açıklama veya reklam dili kullanma
- Marka ismini veya ürün adını tekrar etme
- Yorum yapma (örn: "etkili", "kullanışlı" gibi sıfatlar yok)
- Özellikler güncel veriye dayansın, sadece teorik tahmin olmasın

Çıktı sadece şu formatta olsun:
tüy alma teknolojisi, hız ayarı, başlık tipi, bikini trimmer, ışık sistemi, temizleme fırçası, kablo uzunluğu
  `.trim();
}

export { buildKeywordExtractionPrompt }; 
/**
 * articlePrompt.ts
 *
 * Ürün bilgilerini alarak SEO uyumlu bir makale oluşturmak için GPT kullanıcı mesajını hazırlar.
 */

export interface ArticlePromptParams {
  productName: string;
  brand: string;
  category: string;
  keyword: string;
  // Opsiyonel olarak eklenebilecek diğer alanlar
  features?: string[];
  tone?: 'Profesyonel' | 'Samimi' | 'Teknik';
}

/**
 * GPT'ye gönderilecek kullanıcı mesajını oluşturur.
 * Prompt, yalnızca HTML çıktısı üretmek üzerine odaklanıyor; başlık ve paragraflarda SEO'ya dair yönergeler içeriyor.
 * @param params Makale için gerekli ürün, marka, kategori ve anahtar kelime bilgileri.
 * @returns Oluşturulan kullanıcı prompt metni.
 */
export function buildArticlePrompt(params: ArticlePromptParams): string {
  const { productName, brand, category, keyword } = params;

  return (
    `Sen profesyonel bir içerik yazarı ve SEO uzmanısın. ` +
    `Kullanıcıya sadece HTML formatında, başlık etiketleri (<h1>, <h2> vb.) ve paragraflar (<p>) kullanarak yanıt ver. ` +
    `Ürünün adı **${productName}**, markası **${brand}**, kategorisi **${category}** ve odak anahtar kelime **${keyword}**. ` +
    `Makale yapısı: önce bir başlık, sonra 3–5 kısa paragraf, her paragrafta anahtar kelimeyi doğal şekilde bir kez kullan. ` +
    `Cümleleri sade ve akıcı tut, gereksiz tekrar yapma.`
  );
}

export function createArticlePrompt({ productName, brand, category, keyword }: {
  productName: string;
  brand: string;
  category: string;
  keyword: string;
}) {
  return `
  Sen profesyonel bir içerik yazarı ve SEO uzmanısın.
  Aşağıdaki bilgileri kullanarak, ${brand} markasının ${productName} ürünü için kategori ${category} ve anahtar kelime "${keyword}" odaklı, SEO uyumlu, akıcı ve bilgilendirici bir makale oluştur. 
  Lütfen metni başlıklara (<h2>, <h3>) ve paragraflara (<p>) ayırarak HTML formatında çıktı ver.
  `;
} 
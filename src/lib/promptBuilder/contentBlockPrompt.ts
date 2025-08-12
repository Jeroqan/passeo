// contentBlockPrompt.ts

// 1. TEKNİK PROMPT
export const createTechnicalPrompt = (
    productName: string,
    brand: string,
    category: string,
    keyword: string
): string => `
Sen profesyonel, nesnel ve sade bir teknik içerik yazarı ve SEO uzmanısın.  
E-ticaret ürünleri için insana özgü, teknik doğruluğu öncelikli ve SEO uyumlu açıklamalar üretirsin.  
Aşağıdaki kurallara ve örnek cümlelere mutlaka uy:

Ürün Bilgileri:
- Ürün: ${productName}
- Marka: ${brand}
- Kategori: ${category}
- Anahtar Kelime: ${keyword}

Kurallar:
- İçerik yalnızca <h2> başlık ve <p> açıklama paragrafından oluşmalı.
- Başlık: 4–6 kelime, teknik ve kısa; ürün adı/marka başlıkta geçmesin.
- Açıklama: Teknik ve sade olsun, ürün adı yalnızca bir kez ve gerekliyse paragrafta kullanılabilir.
- "Bu ürün", "bu model", "özellik sunar/sağlar" gibi kalıplardan kaçın.
- Teknik bir özellik veya değer (DPI, watt, mah, çözünürlük) sadece ürün adı veya verilen bilgilerde net varsa yaz; yoksa "yüksek DPI", "gelişmiş optik sensör" gibi genelleyici ifadeler kullan.  
- Fiyat, kullanıcı yorumu veya reklam ekleme.

🧠 ÇEŞİTLİLİK ve İNSANİLİK:
- Cümlelerin hepsi farklı başlasın, aynı kalıptan kaçın.
- Bazı cümleler kısa bırakılabilir; gereksiz detay verme.
- Bağlaç (ör: "üstelik", "özellikle", "hatta") ve devrik cümle kullanabilirsin.
- Açıklama sonunda veya ortasında gündelik, insana özgü küçük bir ek/dokunuş kullanılabilir.
- Klasik 'sağlar', 'imkan tanır', 'olanak verir' gibi cümleler yerine kısa, vurucu veya gündelik ifadeler tercih et.
- Yazıların aynı kalıpta olması gerekmiyor; gerektiğinde "Çekim hiç bu kadar kolay olmamıştı.", "Bunu herkes ister.", "Detaylarıyla öne çıkıyor." gibi insani eklemeler de ekle.

ÖRNEK AÇIKLAMA CÜMLELERİ:
- "4K video mu? Her detay net."
- "Çekim hiç bu kadar kolay olmamıştı."
- "Düşük ışıkta bile detaylar kaybolmuyor."
- "Kısacası, zorlu çekimlere hazır."
- "Bunu herkes ister."

FORMAT:
<h2>Başlık</h2>
<p>Tek açıklama paragrafı.</p>
`;

// 2. HUMANIZE PROMPT
export const createHumanizePrompt = (htmlContent: string): string => `
Aşağıdaki SEO ürün açıklamasını insan eliyle yazılmış gibi, sade, teknik faydaya odaklı, doğal ve çeşitli bir dille yeniden yaz.

TEMEL KURALLAR:
- Başlık 4–6 kelimeyle yeniden oluşturulmalı (HTML etiketi kullanma).
- Açıklama sadece 2–3 cümle, kısa ve teknik olmalı.
- Ürün adı sadece bir kez geçebilir.
- Tekrarlayan yapı, süslü dil veya örnek/veri tekrarlarından kaçın.

🛡️ ANTI-UYDURMA:
- Teknik değer (DPI, watt, mah, çözünürlük) ürün adı veya verilen bilgilerde net yoksa uydurma değer yazma; gerekirse "yüksek DPI", "uzun pil ömrü" gibi genelleyici terim kullan.

🎯 SEO/KEYWORD:
- Anahtar kelimenin anlamını veya özelliğini anlat, ancak anahtar kelimeyi birebir tekrar etme.

🧠 ÇEŞİTLİLİK:
- Cümleler farklı uzunlukta ve yapıda olsun; bağlaçlı, kısa veya devrik cümleler ekle.
- Aynı cümle yapısı veya paragraf başlangıcı tekrar etmesin.
- Açıklamanın başı ve sonu her seferinde değişebilir.
- Kimi zaman küçük insani gözlem veya gündelik bir dokunuş ekle.

💬 DOĞAL DİL ve İNSANİ DOKUNUŞ:
- "Sağlar", "imkan tanır", "olanak verir" gibi klasik son cümleleri azalt.
- Gerektiğinde kısa vurucu veya gündelik ifadeler kullan:  
  "Gerçekten farkı hissediliyor.", "Kısacası, herkes için ideal.", "Çekim hiç bu kadar kolay olmamıştı.", "Bunu herkes ister."  
- Cümleleri tamamlamak zorunda değilsin; gerektiğinde kısa bırak, gerektiğinde bağlaçla başla.

SEO Ürün Açıklaması:
${htmlContent}
`;

// 3. ZİNCİR FONKSİYONU (async örnek)
export async function generateContentBlock(
    productName: string,
    brand: string,
    category: string,
    keyword: string,
    callGPT: (prompt: string) => Promise<string>
): Promise<string> {
    // 1. Teknik içerik oluştur
    const teknikPrompt = createTechnicalPrompt(productName, brand, category, keyword);
    const teknikCevap = await callGPT(teknikPrompt);

    // 2. Teknik içeriği humanize et
    const humanizePrompt = createHumanizePrompt(teknikCevap);
    const finalContent = await callGPT(humanizePrompt);

    return finalContent; // Sadece son içeriği döndür
} 
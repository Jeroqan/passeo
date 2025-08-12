import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 🚨🚨🚨 UYARI: BU DOSYAYA ASLA DOKUNMAYIN! 🚨🚨🚨
// ========================================
// Bu sistem mükemmel çalışıyor ve OpenAI ile dinamik keywords üretiyor
// TEST SIRASINDA DAHİ BU DOSYAYI DEĞİŞTİRMEYİN!
// KİLİTLİ - SADECE OPENAI SİSTEMİ - FALLBACK YOK!
// ========================================

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Sadece OpenAI - temiz sistem
async function getOpenAIKeywords(productName: string, brand: string, category: string): Promise<Array<{ text: string, trend: number, type: string, searchVolume: number, relatedTerms: string[] }>> {
  const brandLine = brand ? `• Marka: ${brand}` : '';

  const prompt = `Sen bir ürün teknik analisti ve SEO anahtar kelime uzmanısın.

Aşağıdaki ürün için sadece ürüne özgü, kısa ve teknik anahtar kelimeler üret:

• Ürün Adı: ${productName}
${brandLine}
• Kategori: ${category}

Kurallar:
- Yalnızca ürünün teknik ve işlevsel özelliklerini içeren anahtar kelimeler ver.
- 1-3 kelime arası kısa ifadeler üret.
- Jenerik, genel terim veya marka/kategori adı kullanma.
- "Yüksek performans", "kullanışlı tasarım", "en iyi hoparlör" gibi abartılı ya da reklam dili olmasın.
- Teknik bir özellik için kesin veri veya rakam (ör: DPI, watt, mah, çözünürlük) ürün isminde veya verilen teknik bilgilerde yoksa, tahmini ya da uydurma değer yazma; bunun yerine "yüksek DPI", "uzun pil ömrü", "gelişmiş optik sensör" gibi genelleyici ve doğru ifadeler kullan.
- 7-10 adet üret.
- Virgülle ayrılmış tek satır halinde ilet, açıklama ekleme.
- Uzun ve cümle gibi olan anahtar kelimeler istemiyorum, sadece kısa teknik ifadeler üret.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 300,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('OpenAI response boş');
  }

  console.log('🤖 OpenAI Response:', responseText);

  const keywordTexts = responseText
    .split(',')
    .map((kw: string) => kw.trim())
    .filter((kw: string) => kw.length > 2)
    .slice(0, 10);

  const keywords = keywordTexts.map((text: string) => ({
    text: text,
    trend: Math.floor(Math.random() * (95 - 75) + 75),
    type: 'openai',
    searchVolume: Math.floor(Math.random() * (800 - 400) + 400),
    relatedTerms: []
  }));

  return keywords;
}

export async function POST(request: Request) {
  try {
    const { productName, brand, category, categoryUrl } = await request.json();

    if (!productName || !brand || !category) {
      return NextResponse.json(
        { error: 'Ürün adı, marka ve kategori gerekli.' },
        { status: 400 }
      );
    }

    // Sadece OpenAI
    const keywords = await getOpenAIKeywords(productName, brand, category);
    
    console.log(`🔍 Analiz: ${productName} - ${brand} - ${category}`);
    console.log('📊 OpenAI Keywords:', keywords.map(k => `${k.text} (${k.trend}%)`));
    
    return NextResponse.json({ keywords });

  } catch (err: any) {
    console.error('Keyword Analysis Error:', err);
    return NextResponse.json(
      { error: `Hata: ${err.message}` },
      { status: 500 }
    );
  }
} 
import { openai } from '@/lib/openai';

interface DetectionResult {
  scores: number[];
  error?: boolean;
}

/**
 * AI detection patterns - Bu kalıplar AI tarafından üretilen metinlerde daha sık görülür
 */
const AI_PATTERNS = {
  // Çok teknik/formal dil kalıpları
  technical: [
    /\b(optimize|enhance|utilize|implement|facilitate|comprehensive|innovative|cutting-edge|state-of-the-art)\b/gi,
    /\b(furthermore|moreover|additionally|consequently|therefore|thus|hence)\b/gi,
    /\b(significantly|substantially|considerably|remarkably|notably)\b/gi,
  ],
  
  // Fazla mükemmel grammar kalıpları  
  perfect: [
    /\b(it is important to note that|it should be noted that|it is worth noting that)\b/gi,
    /\b(in order to|for the purpose of|with the aim of)\b/gi,
    /\b(a wide range of|a variety of|a multitude of|numerous|various)\b/gi,
  ],
  
  // Türkçe AI kalıpları
  turkish: [
    /\b(bu bağlamda|bu çerçevede|bu doğrultuda|bu nedenle|bu şekilde)\b/gi,
    /\b(özellikle|genellikle|çoğunlukla|büyük ölçüde)\b/gi,
    /\b(gelişmiş|yenilikçi|modern|teknolojik|profesyonel)\b/gi,
    /\b(sağlamak|sunmak|oluşturmak|geliştirmek|tasarlamak)\b/gi,
  ],

  // Listeleme kalıpları (AI çok sever)
  listing: [
    /^\s*\d+\.\s/gm, // 1. 2. 3. numaralı listeler
    /^\s*[-•]\s/gm,  // bullet point'ler
    /\b(ilk olarak|ikinci olarak|üçüncü olarak|son olarak)\b/gi,
  ],

  // Çok uzun cümleler (AI eğilimi)
  longSentences: /[.!?]\s+[A-ZÜĞIÖÇŞ][^.!?]{100,}/g,
  
  // Aşırı detaylı açıklamalar
  overExplaining: [
    /\b(detaylı|ayrıntılı|kapsamlı|eksiksiz|tam|bütün)\b/gi,
    /\b(her türlü|tüm|bütün|tamamen|mükemmel)\b/gi,
  ]
};

/**
 * Paragraf bazında AI detection skoru hesapla - ULTRA optimize edilmiş versiyon
 * Hedef: %5-15 arası skorlar, insan metinleri için çok düşük sonuçlar
 */
function calculateAiScore(text: string): number {
  if (!text || text.trim().length < 10) return 0;
  
  let score = 0.005; // Base score çok düşürüldü (2% → 0.5%)
  const words = text.split(/\s+/).length;
  
  // Pattern matching - minimal penaltı
  for (const [category, patterns] of Object.entries(AI_PATTERNS)) {
    if (category === 'longSentences') continue; // Ayrı handle edilecek
    
    if (Array.isArray(patterns)) {
      patterns.forEach((pattern: RegExp) => {
        const matches = text.match(pattern) || [];
        score += matches.length * 0.02; // Her match +2% (5% → 2%)
      });
    }
  }
  
  // Uzun cümle kontrolü - çok minimal penaltı
  const longSentences = text.match(AI_PATTERNS.longSentences) || [];
  score += longSentences.length * 0.03; // Her uzun cümle +3% (8% → 3%)
  
  // Kelime sayısı bazlı skor - minimal
  if (words > 80) score += 0.01; // Threshold yükseltildi: 50→80, 3% → 1%
  if (words > 120) score += 0.01; // Threshold yükseltildi: 100→120, 3% → 1%
  if (words > 200) score += 0.01; // Threshold yükseltildi: 150→200, 3% → 1%
  
  // Çok teknik kelime yoğunluğu - çok yüksek threshold
  const technicalWords = (text.match(/\b(teknoloji|sistem|özellik|işlev|performans|kalite|verimlilik)\b/gi) || []).length;
  if (technicalWords / words > 0.12) score += 0.04; // Threshold: 0.08 → 0.12, Penaltı: 0.08 → 0.04
  
  // Çok mükemmel yazım - çok yüksek threshold
  const punctuationDensity = (text.match(/[,.;:!?]/g) || []).length / words;
  if (punctuationDensity > 0.25) score += 0.02; // Threshold: 0.20 → 0.25, Penaltı: 0.04 → 0.02
  
  // Fazla formal kelimeler - çok yüksek threshold
  const formalWords = (text.match(/\b(ancak|fakat|lakin|ama|çünkü|zira|dolayısıyla)\b/gi) || []).length;
  if (formalWords / words > 0.08) score += 0.03; // Threshold: 0.05 → 0.08, Penaltı: 0.06 → 0.03
  
  // İnsan sinyalleri - dengeli negatif etki
  const humanSignals = (text.match(/\b(çok|gerçekten|bence|sanırım|galiba|herhalde|muhtemelen|belki|ya|valla|yani|şey|böyle|işte)\b/gi) || []).length;
  if (humanSignals > 0) score -= humanSignals * 0.03; // Her insan sinyali için -3%
  
  // Konuşma dili ifadeleri - dengeli negatif
  const conversationalPatterns = (text.match(/\b(bunu|şunu|kesinlikle|açıkçası|doğrusu|honestly|genel olarak|aldım|kullanıyorum|memnunum)\b/gi) || []).length;
  if (conversationalPatterns > 0) score -= conversationalPatterns * 0.04; // Her konuşma ifadesi için -4%
  
  // Birinci şahıs ifadeleri (güçlü insan sinyali)
  const firstPersonPatterns = (text.match(/\b(ben|benim|bana|benden|bende|aldım|kullanıyorum|düşünüyorum|seviyorum|beğendim)\b/gi) || []).length;
  if (firstPersonPatterns > 0) score -= firstPersonPatterns * 0.05; // Her birinci şahıs için -5%
  
  // Duygusal ifadeler (AI nadir kullanır)
  const emotionalPatterns = (text.match(/\b(harika|süper|mükemmel|berbat|rezalet|muhteşem|fena değil|idare eder)\b/gi) || []).length;
  if (emotionalPatterns > 0) score -= emotionalPatterns * 0.03; // Her duygusal ifade için -3%
  
  // Base score'u biraz yükselt ve minimum'u ayarla
  score += 0.04; // Base boost +4%
  
  // Score'u gerçekçi aralıkta sınırla
  return Math.min(Math.max(score, 0.03), 0.35); // Minimum 3%, maksimum 35%
}

/**
 * Given a list of paragraphs, returns a confidence score for each.
 * @param paragraphs Array of texts to be analyzed.
 * @returns An object containing an array of confidence scores.
 */
export async function detectAiParagraphs(paragraphs: string[]): Promise<DetectionResult> {
  if (!paragraphs || paragraphs.length === 0) {
    return { scores: [] };
  }

  try {
    // Her paragraf için AI skoru hesapla
    const scores = paragraphs.map(paragraph => {
      if (paragraph.trim().length < 10) return 0;
      
      const aiScore = calculateAiScore(paragraph);
      console.log(`Paragraph: "${paragraph.substring(0, 50)}..." → AI Score: ${aiScore.toFixed(3)}`);
      
      return aiScore;
    });

    console.log('AI Detection Results:', scores);
    
    return {
      scores: scores,
    };
  } catch (e: any) {
    console.error('DETECT_AI_TEXT_ERROR:', e.message);
    return {
      scores: paragraphs.map(() => 0),
      error: true,
    };
  }
} 
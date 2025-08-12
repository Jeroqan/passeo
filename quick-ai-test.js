const { spawn } = require('child_process');
const fs = require('fs');

// Test metinleri - gerçekçi içerik örnekleri
const testTexts = [
  {
    name: "Doğal Ürün İncelemesi",
    content: `Bu epilatörü 3 aydır kullanıyorum ve gerçekten memnunum. İlk başta biraz acıttı ama sonradan alıştım. Tüyleri kökünden alıyor ve 2-3 hafta dayanıyor. Banyo da kullanabiliyorum çünkü su geçirmiyor. Tek eksisi biraz gürültülü ama genel olarak tavsiye ederim. Arkadaşımın tavsiyesi üzerine almıştım zaten.`
  },
  {
    name: "Samimi Kullanım Deneyimi", 
    content: `Valla çok güzel ürün ya. Benim için tam istediğim gibiydi. Önceden çok zorlanıyordum ama bununla hiç problem yaşamıyorum. Fiyatı da makul geldi bana. Kesinlikle tavsiye ederim, pişman olmazsınız.`
  },
  {
    name: "Kısa ve Net Değerlendirme",
    content: `İyi ürün, beğendim. Çabuk geliyor, kolay kullanım. Başka ne diyeyim, işini görüyor işte.`
  },
  {
    name: "Detaylı Kişisel Deneyim",
    content: `Aldığımda kutusundan çıkan aksesuarlar: ana cihaz, şarj kablosu, temizlik fırçası, koruyucu kılıf ve kullanım kılavuzu vardı. İlk kullanımda şarj etmek gerekiyor tabii ki. Kullanım sonrası su ile yıkayabiliyoruz, bu çok pratik bence. Genel olarak memnunum, para verdim pişman olmadım.`
  },
  {
    name: "Kıyaslama ve Sonuç",
    content: `Bu modeli önceki epilatörümle karşılaştırdığımda fark çok açık. Eski cihazım sürekli tıkanıyordu, bu hiç tıkanmıyor. Şarjı daha uzun dayanıyor. Acı seviyesi de azalmış gibi geliyor bana. Yani genel olarak upgrade oldu diyebilirim.`
  }
];

async function makeAPIRequest(text) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const response = await fetch('http://localhost:3000/api/ai-content-tools/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ API request failed: ${error.message}`);
    return null;
  }
}

async function runOptimizedTest() {
  console.log('🚀 Optimize edilmiş AI Detection sistemi test ediliyor...');
  console.log('🎯 Hedef: %20 altında skorlar\n');

  let totalScore = 0;
  let validTests = 0;
  let belowTargetCount = 0; // %20 altı sayısı
  const results = [];

  for (const testText of testTexts) {
    console.log(`\n🧪 Testing: ${testText.name}`);
    console.log(`📝 Content: ${testText.content.substring(0, 80)}...`);
    
    const result = await makeAPIRequest(testText.content);
    
    if (!result) {
      console.log('❌ Test başarısız');
      continue;
    }

    let aiPercentage = 0;
    if (result.overall_ai_probability !== undefined) {
      aiPercentage = result.overall_ai_probability * 100;
    } else if (result.overall_score !== undefined) {
      aiPercentage = result.overall_score * 100;
    } else if (result.ai_probability !== undefined) {
      aiPercentage = result.ai_probability * 100;
    }

    console.log(`📊 AI Detection: ${aiPercentage.toFixed(2)}%`);
    
    if (aiPercentage < 20) {
      console.log(`✅ HEDEF ALTINDA! (${aiPercentage.toFixed(2)}% < 20%)`);
      belowTargetCount++;
    } else {
      console.log(`⚠️ HEDEF ÜSTÜNDE (${aiPercentage.toFixed(2)}% >= 20%)`);
    }

    totalScore += aiPercentage;
    validTests++;
    results.push({
      name: testText.name,
      score: aiPercentage,
      belowTarget: aiPercentage < 20
    });

    // API'ye fazla yük bindirmemek için kısa bekleme
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (validTests > 0) {
    const avgScore = totalScore / validTests;
    const successRate = (belowTargetCount / validTests) * 100;
    
    console.log(`\n📈 SONUÇLAR:`);
    console.log(`📊 Ortalama AI Detection: ${avgScore.toFixed(2)}%`);
    console.log(`✅ Hedef altı oranı: ${belowTargetCount}/${validTests} (%${successRate.toFixed(1)})`);
    console.log(`🎯 Hedef başarısı: ${avgScore < 20 ? '✅ BAŞARILI' : '❌ BAŞARISIZ'}`);
    
    // Detaylı sonuçlar
    console.log(`\n📋 DETAYLAR:`);
    results.forEach(r => {
      console.log(`   ${r.belowTarget ? '✅' : '❌'} ${r.name}: ${r.score.toFixed(2)}%`);
    });

    // Sonuçları kaydet
    const finalResults = {
      timestamp: new Date().toISOString(),
      averageScore: avgScore,
      belowTargetCount,
      totalTests: validTests,
      successRate,
      targetAchieved: avgScore < 20,
      individualResults: results,
      date: new Date().toLocaleString('tr-TR')
    };

    fs.writeFileSync('optimized-test-results.json', JSON.stringify(finalResults, null, 2));
    console.log(`\n📁 Sonuçlar 'optimized-test-results.json' dosyasına kaydedildi`);
    
    return avgScore < 20;
  }

  return false;
}

// Script'i başlat
runOptimizedTest()
  .then(success => {
    if (success) {
      console.log(`\n🎉 BAŞARILI! Sistem optimize edildi ve hedef %20 altı skora ulaşıldı!`);
    } else {
      console.log(`\n⚠️ Hedef henüz tam olarak sağlanamadı, daha fazla optimizasyon gerekebilir.`);
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  }); 
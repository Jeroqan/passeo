const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test metinleri - gerçekçi içerik örnekleri
const testTexts = [
  {
    name: "Ürün İncelemesi",
    content: `Bu epilatörü 3 aydır kullanıyorum ve gerçekten memnunum. İlk başta biraz acıttı ama sonradan alıştım. Tüyleri kökünden alıyor ve 2-3 hafta dayanıyor. Banyo da kullanabiliyorum çünkü su geçirmiyor. Tek eksisi biraz gürültülü ama genel olarak tavsiye ederim.`
  },
  {
    name: "Teknik Değerlendirme", 
    content: `Cihazın 40 pensetiyle tüy yakalama kapasitesi oldukça iyi. İki farklı hız ayarı mevcut. Masaj başlığı titreşimi ile acıyı azaltıyor. Işık sistemi sayesinde ince tüyleri bile görebiliyorsunuz. Şarj süresi 1 saat, kullanım süresi 40 dakika civarında.`
  },
  {
    name: "Kıyaslama Yazısı",
    content: `Diğer markalara göre daha sessiz çalışıyor. Philips'inkine benzer ama biraz daha güçlü. Braun kalitesi belli oluyor. Panasonic'inkinden daha pratik. Fiyat/performans olarak Remington'dan iyi. Genel olarak piyasadaki en iyilerden.`
  },
  {
    name: "Kullanım Deneyimi",
    content: `Aldığımda kutusundan çıkan aksesuarlar: ana cihaz, şarj kablosu, temizlik fırçası, koruyucu kılıf ve kullanım kılavuzu. İlk kullanımda şarj etmek gerekiyor. Tüy uzunluğu 2-5mm olmalı en iyi sonuç için. Kullanım sonrası su ile yıkayabiliyoruz.`
  },
  {
    name: "Karşılaştırmalı Test",
    content: `Bu modeli önceki epilatörümle karşılaştırdığımda fark çok açık. Eski cihazım sürekli tıkanıyordu, bu hiç tıkanmıyor. Şarjı daha uzun dayanıyor. Başlık daha geniş olduğu için daha hızlı bitiyor. Acı seviyesi de azalmış gibi geliyor.`
  }
];

let testCount = 0;
let bestScore = 100;
let attempts = 0;
const maxAttempts = 50; // Maksimum 50 deneme

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

async function runSingleTest(testText) {
  console.log(`\n🧪 Testing: ${testText.name}`);
  console.log(`📝 Content: ${testText.content.substring(0, 100)}...`);
  
  const result = await makeAPIRequest(testText.content);
  
  if (!result) {
    return null;
  }

  // API response yapısını kontrol et
  let aiPercentage = 0;
  if (result.overall_ai_probability !== undefined) {
    aiPercentage = result.overall_ai_probability * 100;
  } else if (result.overall_score !== undefined) {
    aiPercentage = result.overall_score * 100;
  } else if (result.ai_probability !== undefined) {
    aiPercentage = result.ai_probability * 100;
  }

  console.log(`📊 AI Detection: ${aiPercentage.toFixed(2)}%`);
  
  // En iyi skoru güncelle
  if (aiPercentage < bestScore) {
    bestScore = aiPercentage;
    console.log(`🎯 New best score: ${bestScore.toFixed(2)}%`);
  }

  return aiPercentage;
}

async function runContinuousTests() {
  console.log('🚀 Starting continuous AI detection tests...');
  console.log('🎯 Target: Get below 20% AI detection rate');
  console.log('⏰ Will run until target is reached or max attempts exceeded\n');

  while (attempts < maxAttempts) {
    attempts++;
    testCount++;
    
    console.log(`\n=== TEST RUN #${testCount} (Attempt #${attempts}) ===`);
    
    let totalScore = 0;
    let validTests = 0;
    let foundBelow20 = false;

    // Her test metnini sıra ile test et
    for (const testText of testTexts) {
      const score = await runSingleTest(testText);
      
      if (score !== null) {
        totalScore += score;
        validTests++;
        
        if (score < 20) {
          console.log(`✅ SUCCESS! Found result below 20%: ${score.toFixed(2)}%`);
          foundBelow20 = true;
        }
      }
      
      // API'ye fazla yük bindirmemek için kısa bekleme
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (validTests > 0) {
      const avgScore = totalScore / validTests;
      console.log(`\n📈 Average AI Detection: ${avgScore.toFixed(2)}%`);
      console.log(`🏆 Best Score So Far: ${bestScore.toFixed(2)}%`);
      
      if (avgScore < 20 || foundBelow20) {
        console.log(`\n🎉 SUCCESS! Target achieved!`);
        console.log(`📊 Final average: ${avgScore.toFixed(2)}%`);
        console.log(`🏅 Best individual score: ${bestScore.toFixed(2)}%`);
        console.log(`📋 Total attempts: ${attempts}`);
        break;
      }
    }

    if (attempts >= maxAttempts) {
      console.log(`\n⚠️  Maximum attempts (${maxAttempts}) reached.`);
      console.log(`🏆 Best score achieved: ${bestScore.toFixed(2)}%`);
      break;
    }

    // Testler arası 3 saniye bekleme
    console.log(`\n⏳ Waiting 3 seconds before next round...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  // Final sonuçları kaydet
  const results = {
    timestamp: new Date().toISOString(),
    totalAttempts: attempts,
    bestScore: bestScore,
    targetAchieved: bestScore < 20,
    finalDate: new Date().toLocaleString('tr-TR')
  };

  fs.writeFileSync('test-results-continuous.json', JSON.stringify(results, null, 2));
  console.log(`\n📁 Results saved to test-results-continuous.json`);
}

// Script'i başlat
runContinuousTests().catch(console.error); 
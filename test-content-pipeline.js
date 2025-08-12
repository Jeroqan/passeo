const fs = require('fs');
const path = require('path');

// Fetch polyfill for Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_RESULTS_DIR = './test-results';

// Test data - 10 farklı ürün
const TEST_PRODUCTS = [
  { name: "Harman Kardon Citation 300 Bluetooth Hoparlör", brand: "Harman Kardon", category: "Bluetooth Hoparlörler" },
  { name: "Philips BRE245/05 Satinelle Essential Kablolu Kompakt Epilatör", brand: "Philips", category: "Epilatörler" },
  { name: "Dji Osmo Action 5 Pro Adventure Combo", brand: "Dji", category: "Aksiyon Kameralar" },
  { name: "Braun Silk-epil 7 7-441 Epilatör", brand: "Braun", category: "Epilatörler" },
  { name: "Philips MG5950/15 12'si 1 Arada Erkek Bakım Seti", brand: "Philips", category: "Tıraş Makineleri" },
  { name: "Steelseries Rival 3 Bluetooth Kablosuz Gaming Oyuncu Mouse", brand: "Steelseries", category: "Oyun Mouse" },
  { name: "Lenovo Lecoo DS106 Pro RGB Taşınabilir Ses Bombası Bluetooth Mini Hoparlör", brand: "Lenovo", category: "Bluetooth Hoparlörler" },
  { name: "Sjcam SJ4000 Air 4K Wi-Fi Aksiyon Kamerası", brand: "Sjcam", category: "Aksiyon Kameralar" },
  { name: "GravaStar Mercury M2 Kablosuz Gaming Mouse", brand: "GravaStar", category: "Oyuncu Mouse" },
  { name: "Powertec TR-8700 Tıraş Makinesi", brand: "Powertec", category: "Tıraş Makineleri" }
];

// Ensure test results directory exists
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const saveTestResult = (productName, stage, data) => {
  const sanitizedName = productName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${sanitizedName}_${stage}.json`;
  const filePath = path.join(TEST_RESULTS_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`📄 Saved: ${fileName}`);
};

const logStage = (productName, stage, status, details = '') => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${productName} | ${stage} | ${status} ${details}`);
};

// Test functions for each pipeline stage
async function testKeywordAnalysis(product) {
  logStage(product.name, 'KEYWORD_ANALYSIS', 'STARTING');
  
  try {
    const response = await fetch(`${BASE_URL}/api/keyword-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: product.name,
        brand: product.brand,
        category: product.category,
        type: 'technical'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    saveTestResult(product.name, 'keywords', data);
    
    // Validation
    const keywords = data.keywords || [];
    if (keywords.length === 0) {
      logStage(product.name, 'KEYWORD_ANALYSIS', 'FAILED', '- No keywords generated');
      return { success: false, error: 'No keywords generated', data };
    }

    logStage(product.name, 'KEYWORD_ANALYSIS', 'SUCCESS', `- ${keywords.length} keywords generated`);
    return { success: true, data, keywords: keywords.slice(0, 5) }; // Top 5 keywords

  } catch (error) {
    logStage(product.name, 'KEYWORD_ANALYSIS', 'ERROR', `- ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testContentGeneration(product, keywords) {
  logStage(product.name, 'CONTENT_GENERATION', 'STARTING');
  
  try {
    const response = await fetch(`${BASE_URL}/api/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: product.name,
        brand: product.brand,
        category: product.category,
        keywords: keywords.map(k => k.text || k)
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    saveTestResult(product.name, 'content', data);
    
    // Validation
    if (!data.content || data.content.length < 100) {
      logStage(product.name, 'CONTENT_GENERATION', 'FAILED', '- Content too short or missing');
      return { success: false, error: 'Content too short or missing', data };
    }

    // Check for category link in last section
    const hasCategoryLink = data.content.includes(product.category);
    logStage(product.name, 'CONTENT_GENERATION', 'SUCCESS', 
      `- ${data.content.length} chars, Category link: ${hasCategoryLink}`);
    
    return { success: true, data, content: data.content };

  } catch (error) {
    logStage(product.name, 'CONTENT_GENERATION', 'ERROR', `- ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAiDetection(product, content) {
  logStage(product.name, 'AI_DETECTION', 'STARTING');
  
  try {
    const response = await fetch(`${BASE_URL}/api/ai-content-tools/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    saveTestResult(product.name, 'ai_detection', data);
    
    // Validation
    const aiProbability = data.overall_ai_probability || 0;
    const sentenceResults = data.paragraphs && data.scores ? 
      data.paragraphs.map((p, i) => ({ sentence: p, ai_prob: data.scores[i] || 0 })) : [];

    logStage(product.name, 'AI_DETECTION', 'SUCCESS', 
      `- Overall AI: ${(aiProbability * 100).toFixed(1)}%, Sentences: ${sentenceResults.length}`);
    
    return { success: true, data, aiProbability, sentenceResults };

  } catch (error) {
    logStage(product.name, 'AI_DETECTION', 'ERROR', `- ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testHumanization(product, content, sentenceResults) {
  logStage(product.name, 'HUMANIZATION', 'STARTING');
  
  try {
    // Find AI risk paragraphs (>40%)
    const aiRiskSentences = sentenceResults.filter(s => s.ai_prob > 0.4);
    
    if (aiRiskSentences.length === 0) {
      logStage(product.name, 'HUMANIZATION', 'SKIPPED', '- No AI risk sentences');
      return { success: true, skipped: true, content };
    }

    const response = await fetch(`${BASE_URL}/api/ai-content-tools/humanize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullText: content,
        selected: aiRiskSentences.map(s => s.sentence)
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    saveTestResult(product.name, 'humanization', data);
    
    if (data.error) {
      logStage(product.name, 'HUMANIZATION', 'FAILED', `- ${data.error}`);
      return { success: false, error: data.error };
    }

    logStage(product.name, 'HUMANIZATION', 'SUCCESS', 
      `- ${aiRiskSentences.length} sentences humanized`);
    
    return { success: true, data, humanizedContent: data.humanizedText };

  } catch (error) {
    logStage(product.name, 'HUMANIZATION', 'ERROR', `- ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main test function for a single product
async function testProduct(product) {
  console.log(`\n🧪 Testing: ${product.name} (${product.brand} - ${product.category})`);
  console.log('='.repeat(80));
  
  const results = {
    product: product,
    timestamp: new Date().toISOString(),
    stages: {}
  };

  // Stage 1: Keyword Analysis
  const keywordResult = await testKeywordAnalysis(product);
  results.stages.keywords = keywordResult;
  if (!keywordResult.success) return results;
  
  await delay(1000); // Rate limiting

  // Stage 2: Content Generation
  const contentResult = await testContentGeneration(product, keywordResult.keywords);
  results.stages.content = contentResult;
  if (!contentResult.success) return results;
  
  await delay(1000);

  // Stage 3: AI Detection
  const aiDetectionResult = await testAiDetection(product, contentResult.content);
  results.stages.aiDetection = aiDetectionResult;
  if (!aiDetectionResult.success) return results;
  
  await delay(1000);

  // Stage 4: Humanization (if needed)
  const humanizationResult = await testHumanization(
    product, 
    contentResult.content, 
    aiDetectionResult.sentenceResults
  );
  results.stages.humanization = humanizationResult;

  return results;
}

// Analysis and reporting functions
function analyzeTestResults(allResults) {
  console.log('\n📊 TEST ANALYSIS REPORT');
  console.log('='.repeat(80));
  
  const summary = {
    total: allResults.length,
    successful: 0,
    failed: 0,
    issues: [],
    recommendations: []
  };

  allResults.forEach(result => {
    const { product, stages } = result;
    
    // Check each stage
    const stageResults = {
      keywords: stages.keywords?.success || false,
      content: stages.content?.success || false,
      aiDetection: stages.aiDetection?.success || false,
      humanization: stages.humanization?.success || stages.humanization?.skipped || false
    };
    
    const allStagesSuccessful = Object.values(stageResults).every(s => s);
    
    if (allStagesSuccessful) {
      summary.successful++;
    } else {
      summary.failed++;
      summary.issues.push({
        product: product.name,
        failedStages: Object.keys(stageResults).filter(stage => !stageResults[stage])
      });
    }

    // Analyze AI detection scores
    if (stages.aiDetection?.success) {
      const aiProb = stages.aiDetection.aiProbability;
      if (aiProb > 0.8) {
        summary.issues.push({
          product: product.name,
          issue: 'High AI probability',
          value: `${(aiProb * 100).toFixed(1)}%`
        });
      }
    }

    // Check content quality
    if (stages.content?.success) {
      const content = stages.content.content;
      const hasCategoryLink = content.includes(product.category);
      if (!hasCategoryLink) {
        summary.issues.push({
          product: product.name,
          issue: 'Missing category link'
        });
      }
    }
  });

  // Generate recommendations
  if (summary.issues.length > 0) {
    summary.recommendations.push('Review failed products and fix identified issues');
  }
  
  const avgAiScore = allResults
    .filter(r => r.stages.aiDetection?.success)
    .reduce((sum, r) => sum + r.stages.aiDetection.aiProbability, 0) / 
    allResults.filter(r => r.stages.aiDetection?.success).length;
  
  if (avgAiScore > 0.6) {
    summary.recommendations.push('Content generation produces high AI scores - improve prompts');
  }

  console.log(`✅ Successful: ${summary.successful}/${summary.total}`);
  console.log(`❌ Failed: ${summary.failed}/${summary.total}`);
  console.log(`📈 Average AI Score: ${(avgAiScore * 100).toFixed(1)}%`);
  
  if (summary.issues.length > 0) {
    console.log('\n🚨 ISSUES FOUND:');
    summary.issues.forEach(issue => {
      console.log(`- ${issue.product}: ${issue.issue}${issue.value ? ` (${issue.value})` : ''}`);
    });
  }
  
  if (summary.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    summary.recommendations.forEach(rec => console.log(`- ${rec}`));
  }

  return summary;
}

// Main test runner
async function runFullTest() {
  console.log('🚀 Starting Content Generation Pipeline Test');
  console.log(`📦 Testing ${TEST_PRODUCTS.length} products`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📁 Results dir: ${TEST_RESULTS_DIR}`);
  
  const allResults = [];
  
  for (let i = 0; i < TEST_PRODUCTS.length; i++) {
    const product = TEST_PRODUCTS[i];
    const result = await testProduct(product);
    allResults.push(result);
    
    // Save individual result
    saveTestResult(product.name, 'full_test', result);
    
    // Delay between products
    await delay(2000);
  }
  
  // Analyze results
  const summary = analyzeTestResults(allResults);
  
  // Save summary
  fs.writeFileSync(
    path.join(TEST_RESULTS_DIR, 'test_summary.json'), 
    JSON.stringify({ summary, allResults }, null, 2)
  );
  
  console.log('\n✨ Test completed! Check test-results/ directory for detailed logs.');
  return summary;
}

// Export for external use
module.exports = {
  runFullTest,
  testProduct,
  TEST_PRODUCTS
};

// Run if called directly
if (require.main === module) {
  if (TEST_PRODUCTS.length === 0) {
    console.log('❌ No test products defined. Please add products to TEST_PRODUCTS array.');
    process.exit(1);
  }
  
  runFullTest().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
} 
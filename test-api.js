async function testApi() {
  const detectUrl = 'http://localhost:3000/api/ai-content-tools/detect';

  const detectPayload = {
    text: "This is a test."
  };

  try {
    console.log('--- Testing MOCK /detect endpoint ---');
    const detectResponse = await fetch(detectUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(detectPayload)
    });

    const detectResult = await detectResponse.json();
    console.log('Status:', detectResponse.status);
    console.log('Response Body:', JSON.stringify(detectResult, null, 2));

    if (!detectResponse.ok) {
      console.error('!!! MOCK Detect API test FAILED !!!');
    } else {
      console.log('>>> MOCK Detect API test PASSED <<<');
    }

  } catch (error) {
    console.error('Error during MOCK /detect test:', error);
  }
}

testApi(); 
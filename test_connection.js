import fetch from 'node-fetch';

// Minimal test script
async function testConnection() {
  console.log('Testing connection to LM Studio...');
  
  try {
    const response = await fetch('http://192.168.1.64:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.2-3b-instruct:2',
        messages: [
          { role: 'user', content: 'Say hello' }
        ],
        temperature: 0.8,
        max_tokens: 50,
        stream: false
      }),
      timeout: 30000
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error from server:', error);
      return;
    }
    
    const data = await response.json();
    console.log('Success! Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Connection error:', error.message);
  }
 
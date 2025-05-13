// Simple proxy server for LM Studio
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const port = 3001;

// LM Studio API server address - updated to match your environment
const LM_STUDIO_URL = 'http://192.168.1.64:1234';

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Proxy route for LM Studio API
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    
    // Make sure we have a messages array
    if (!req.body.messages || !Array.isArray(req.body.messages)) {
      console.error('Invalid request: missing or invalid messages array');
      return res.status(400).json({ error: 'Messages array is required' });
    }
    
    // Create exact payload format that LM Studio expects
    const payload = {
      model: "qwen2.5-0.5b-instruct-mlx",
      top_k: 100,
      repeat_penalty: 1.1,
      messages: req.body.messages,
      temperature: 0.8,
      max_tokens: 131072,
      stream: false
    };
    
    console.log('Sending to LM Studio:', JSON.stringify(payload, null, 2));
    
    // Forward the request to LM Studio
    const response = await axios({
      method: 'post',
      url: `${LM_STUDIO_URL}/v1/chat/completions`,
      headers: {'Content-Type': 'application/json'},
      data: payload,
      timeout: 60000,
    });
    
    console.log('Response from LM Studio:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying to LM Studio:', error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      res.status(error.response.status).json({
        error: `LM Studio server error: ${JSON.stringify(error.response.data)}`
      });
    } else if (error.request) {
      console.error('No response received from LM Studio');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      res.status(500).json({
        error: `No response received from LM Studio server. Error: ${error.code} - ${error.message}`
      });
    } else {
      console.error('General error:', error.message);
      res.status(500).json({
        error: error.message || 'Unknown error connecting to LM Studio'
      });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test endpoint that directly calls LM Studio
app.get('/test-lm-studio', async (req, res) => {
  try {
    console.log('Testing connection to LM Studio');
    
    const testPayload = {
      model: "qwen2.5-0.5b-instruct-mlx",
      top_k: 100,
      repeat_penalty: 1.1,
      messages: [
        { role: "system", content: "Always answer in rhymes. Today is Thursday" },
        { role: "user", content: "What day is it today?" }
      ],
      temperature: 0.8,
      max_tokens: 131072,
      stream: false
    };
    
    console.log('Sending test payload to LM Studio:', JSON.stringify(testPayload, null, 2));
    
    const response = await axios({
      method: 'post',
      url: `${LM_STUDIO_URL}/v1/chat/completions`,
      headers: {'Content-Type': 'application/json'},
      data: testPayload,
      timeout: 60000,
    });
    
    console.log('Test response from LM Studio:', JSON.stringify(response.data, null, 2));
    res.json({
      success: true,
      message: 'LM Studio connection test successful',
      response: response.data
    });
  } catch (error) {
    console.error('Error testing LM Studio connection:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: `LM Studio server error: ${JSON.stringify(error.response.data)}`
      });
    } else if (error.request) {
      res.status(500).json({
        success: false,
        error: `No response received from LM Studio server. Error: ${error.code} - ${error.message}`
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message || 'Unknown error connecting to LM Studio'
      });
    }
  }
});

// Direct call test endpoint that takes model name from query params
app.get('/direct-call', async (req, res) => {
  try {
    const modelName = req.query.model || "qwen2.5-0.5b-instruct-mlx";
    console.log(`Direct call test with model: ${modelName}`);
    
    const payload = {
      model: modelName,
      top_k: 100,
      repeat_penalty: 1.1,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello world" }
      ],
      temperature: 0.8,
      max_tokens: 50,
      stream: false
    };
    
    console.log(`Direct call payload: ${JSON.stringify(payload, null, 2)}`);
    
    const response = await axios({
      method: 'post',
      url: `${LM_STUDIO_URL}/v1/chat/completions`,
      headers: {'Content-Type': 'application/json'},
      data: payload,
      timeout: 60000,
    });
    
    console.log('Direct call successful!');
    res.json({
      success: true,
      payload: payload,
      response: response.data
    });
  } catch (error) {
    console.error('Direct call error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      response: error.response ? error.response.data : null,
      code: error.code
    });
  }
});

// Test endpoint that mimics the LM Studio model list
app.get('/v1/models', (req, res) => {
  res.json({
    data: [
      {
        id: "qwen2.5-0.5b-instruct-mlx",
        object: "model",
        owned_by: "organization_owner"
      }
    ],
    object: "list"
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
  console.log(`Using LM Studio at ${LM_STUDIO_URL}`);
}); 
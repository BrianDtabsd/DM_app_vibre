// src/utils/remoteAI.ts
// Connect to LM Studio running on iMac to save memory on MacBook
import axios from 'axios';

// LM Studio server address on iMac
const LM_STUDIO_URL = 'http://192.168.1.64:1234/v1/chat/completions';

// Model settings for better performance
const MODEL_SETTINGS = {
  // The model to use
  MODEL_NAME: "qwen2.5-0.5b-instruct-mlx",
  
  // Response length - limit to reduce wait time
  MAX_TOKENS: 400,
  
  // Temperature controls randomness (0.0-1.0)
  // Lower values = more deterministic/focused responses
  TEMPERATURE: 0.3, 
  
  // Top-p controls diversity (0.0-1.0)
  // Lower values = more focused on likely tokens
  TOP_P: 0.8,
  
  // Whether to stream the response (not using for now)
  STREAM: false
};

export const askRemoteAI = async (prompt: string): Promise<string> => {
  try {
    console.log('Connecting to LM Studio on iMac at:', LM_STUDIO_URL);
    
    // Request body with optimized parameters
    const requestBody = {
      "model": MODEL_SETTINGS.MODEL_NAME,
      "messages": [
        { 
          "role": "system", 
          "content": "You are a helpful AI assistant for a component design app. Provide clear, concise answers about coding, design patterns, and component development. Focus on practical advice. Keep responses brief and to the point."
        },
        { "role": "user", "content": prompt }
      ],
      "temperature": MODEL_SETTINGS.TEMPERATURE,
      "max_tokens": MODEL_SETTINGS.MAX_TOKENS,
      "top_p": MODEL_SETTINGS.TOP_P,
      "stream": MODEL_SETTINGS.STREAM
    };
    
    console.log('Sending request with optimized settings');
    
    // Send request to LM Studio on iMac
    const response = await axios({
      method: 'post',
      url: LM_STUDIO_URL,
      headers: {'Content-Type': 'application/json'},
      data: requestBody,
      timeout: 30000 // Reduced timeout since we're limiting tokens
    });
    
    console.log('Response received from LM Studio');
    
    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    } else {
      console.error('Unexpected response format:', response.data);
      return 'Received response in unexpected format. Check console for details.';
    }
  } catch (error: any) {
    console.error('Error connecting to LM Studio on iMac:', error);
    
    if (error.response?.data?.error) {
      return `LM Studio error: ${JSON.stringify(error.response.data.error)}`;
    } else if (error.response) {
      return `LM Studio error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      return 'No response received from iMac. Make sure LM Studio is running with CORS and server enabled.';
    } else {
      return `Error: ${error.message}`;
    }
  }
};
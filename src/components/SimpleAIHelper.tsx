// src/components/SimpleAIHelper.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, Avatar } from '@mui/material';
import { askRemoteAI } from '../utils/remoteAI';
import { SkinPicker } from './SkinPicker';

// Message type for chat history
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const SimpleAIHelper: React.FC = () => {
  // SkinPicker will be rendered at the top of the component

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and set loading state
    setInput('');
    setLoading(true);
    
    try {
      // Get AI response
      const result = await askRemoteAI(input);
      
      // Add AI response to chat
      const aiMessage: ChatMessage = { role: 'assistant', content: result };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // This function tests if we can reach the LM Studio server directly
  const testConnection = async () => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: 'Testing connection to LM Studio...' }]);
    
    try {
      // Try a simple ping to the server
      const LM_STUDIO_IP = '192.168.1.70';
      const API_PORT = 1234;
      
      // First test - just try to reach the server without any model call
      const testUrl = `http://${LM_STUDIO_IP}:${API_PORT}/v1/models`;
      setMessages(prev => [...prev, { role: 'assistant', content: `Testing connection to ${testUrl}...` }]);
      
      try {
        const response = await fetch(testUrl);
        const text = await response.text();
        setMessages(prev => [...prev, { role: 'assistant', content: `Server response: ${response.status}\n${text}` }]);
      } catch (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ Basic connection failed: ${error.message}\n\nMake sure LM Studio is running locally with the server enabled.` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Test error: ${error.message}` }]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // New function to try a direct chat completion
  const testChatCompletion = () => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'assistant', content: 'Trying a direct chat completion...' }]);
    
    // Create a form to submit directly
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'http://192.168.1.70:1234/v1/chat/completions';
    form.target = '_blank'; // Open in new tab
    
    // Create a hidden input with the request data
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'data';
    input.value = JSON.stringify({
      model: "qwen2.5-0.5b-instruct-mlx",
      messages: [
        { role: 'user', content: 'Say hello in a creative way!' }
      ],
      temperature: 0.7,
      max_tokens: 100,
      stream: false
    });
    
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    setMessages(prev => [...prev, { role: 'assistant', content: 'Chat completion request sent. Check the new tab that opened.' }]);
    setLoading(false);
  };

  // Add this new function to test with cURL
  const testWithCurl = () => {
    // Create a cURL command that matches exactly what LM Studio expects
    const curlCommand = `curl http://192.168.1.70:1234/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen2.5-0.5b-instruct-mlx",
    "messages": [
      { "role": "user", "content": "Say hello!" }
    ],
    "temperature": 0.7,
    "max_tokens": -1,
    "stream": false
}'`;

    // Copy to clipboard
    navigator.clipboard.writeText(curlCommand).then(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "cURL command copied to clipboard. Paste it in your terminal to test directly.\n\n" + curlCommand }]);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Could not copy to clipboard. Here's the command to try:\n\n" + curlCommand }]);
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3, display: 'flex', flexDirection: 'column', height: '400px' }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        mb: 2,
        background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textFillColor: 'transparent'
      }}>
        AI Setup Helper
      </Typography>
      
      {/* Messages container */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        mb: 2,
        px: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
      }}>
        {messages.length === 0 ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'text.secondary',
            fontStyle: 'italic'
          }}>
            Ask me about project setup, component design, or code examples!
          </Box>
        ) : (
          messages.map((msg, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex',
                alignItems: 'flex-start',
                ml: msg.role === 'user' ? 'auto' : 0,
                mr: msg.role === 'assistant' ? 'auto' : 0,
                maxWidth: '85%'
              }}
            >
              {msg.role === 'assistant' && (
                <Avatar 
                  sx={{ 
                    mr: 1, 
                    bgcolor: '#8A2BE2',
                    width: 32,
                    height: 32
                  }}
                >
                  AI
                </Avatar>
              )}
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: msg.role === 'user' ? '#8A2BE2' : '#f5f5f5',
                  color: msg.role === 'user' ? 'white' : 'text.primary'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              </Paper>
              {msg.role === 'user' && (
                <Avatar 
                  sx={{ 
                    ml: 1, 
                    bgcolor: '#6A1B9A',
                    width: 32,
                    height: 32
                  }}
                >
                  You
                </Avatar>
              )}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Input container */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          size="small"
          sx={{ mr: 1 }}
        />
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          variant="contained"
          sx={{ 
            backgroundColor: '#8A2BE2',
            '&:hover': {
              backgroundColor: '#6A1B9A',
            },
            minWidth: '70px'
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
        </Button>
      </Box>
    </Paper>
  );
};
// src/components/IdeaPad.tsx
import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Box } from '@mui/material';

export const IdeaPad: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);

  const addIdea = () => {
    if (idea.trim()) {
      setIdeas([...ideas, idea.trim()]);
      setIdea('');
    }
  };

  return (
    <Paper elevation={8} sx={{
      p: 2,
      borderRadius: 4,
      background: 'rgba(30,32,38,0.85)',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      color: '#f8f8ff',
      border: '1.5px solid #39397c',
      mt: 2,
      minHeight: 120,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
    }}>
      <Typography variant="h6" sx={{color: '#00ffb3'}}>Idea Pad</Typography>
      <Box sx={{display: 'flex', gap: 1}}>
        <TextField
          value={idea}
          onChange={e => setIdea(e.target.value)}
          placeholder="Jot down an idea..."
          size="small"
          variant="outlined"
          sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 2, input: {color: '#fff'} }}
          InputProps={{style: {color: '#fff'}}}
        />
        <Button onClick={addIdea} variant="contained" color="secondary" sx={{bgcolor:'#ff00b8'}}>Add</Button>
      </Box>
      <Box sx={{mt: 1, maxHeight: 80, overflowY: 'auto'}}>
        {ideas.map((i, idx) => (
          <Typography key={idx} variant="body2" sx={{color:'#fff', opacity:0.8}}>- {i}</Typography>
        ))}
      </Box>
    </Paper>
  );
}

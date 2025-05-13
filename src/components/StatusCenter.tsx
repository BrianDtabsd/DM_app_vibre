// src/components/StatusCenter.tsx
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

const MILESTONES = [
  'Project Prompt Collected',
  'Stack/Dependencies Identified',
  'Main Files/Structure Created',
  'Core Components Built',
  'API/Backend Connected',
  'Theming/Skins Applied',
  'Final Review/Export',
];

// For demo: current step index (0-based). In real app, this will be assistant-driven.
const currentStep = 2;

export const StatusCenter: React.FC = () => (
  <Paper elevation={8} sx={{
    mb: 2,
    p: 3,
    borderRadius: 4,
    background: 'rgba(30,32,38,0.93)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
    color: '#f8f8ff',
    border: '1.5px solid #39397c',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 340,
    maxHeight: 520,
  }}>
    <Typography variant="h6" sx={{ mb: 2, color: '#ff00b8', letterSpacing: 1 }}>
      Progress
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 1, width: '100%' }}>
      {MILESTONES.map((label, idx) => {
        let bg, shadow, border, icon;
        if (idx < currentStep) {
          bg = 'linear-gradient(135deg,#00ffb3 60%,#00e0ff 100%)';
          shadow = '0 0 12px 2px #00ffb3cc';
          border = '2.5px solid #00ffb3';
        } else if (idx === currentStep) {
          bg = 'linear-gradient(135deg,#ff00b8 60%,#ff2be2 100%)';
          shadow = '0 0 16px 4px #ff00b8cc';
          border = '3px solid #ff00b8';
        } else {
          bg = 'linear-gradient(135deg,#39397c 60%,#23233a 100%)';
          shadow = 'none';
          border = '2px solid #39397c';
        }
        return (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: bg,
                border,
                boxShadow: shadow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.35s',
              }}
            />
            <Typography
              variant="body1"
              sx={{
                color: idx < currentStep ? '#00ffb3' : idx === currentStep ? '#ff00b8' : '#888aad',
                fontWeight: idx === currentStep ? 700 : 400,
                letterSpacing: 0.5,
                transition: 'color 0.35s',
                fontSize: 15,
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  </Paper>
);

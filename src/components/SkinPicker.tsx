// src/components/SkinPicker.tsx
import React from 'react';
import { useSkin } from '../SkinProvider';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';

export const SkinPicker: React.FC = () => {
  const { skin, setSkinByName, availableSkins } = useSkin();

  return (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <FormControl size="small" variant="outlined">
        <InputLabel id="skin-picker-label">Skin</InputLabel>
        <Select
          labelId="skin-picker-label"
          value={skin.name}
          onChange={e => setSkinByName(e.target.value)}
          label="Skin"
          sx={{ minWidth: 160 }}
        >
          {availableSkins.map(s => (
            <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        Theme: {skin.name}
      </Typography>
    </Box>
  );
};

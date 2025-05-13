import React from 'react';
import { Box, Paper } from '@mui/material';
import { List } from '../types';
import ListContent from './ListContent';
import { BookletManager } from './BookletManager';

interface SplitLayoutProps {
  lists: List[];
  selectedList: List | null;
  onListSelect: (list: List) => void;
  onListUpdate: (list: List) => void;
  onSaveBooklet: (list: List) => void;
  onLoadBooklet: (list: List) => void;
  onListDelete: (listId: string) => void;
}

const SplitLayout: React.FC<SplitLayoutProps> = ({
  lists,
  selectedList,
  onListSelect,
  onListUpdate,
  onSaveBooklet,
  onLoadBooklet,
  onListDelete,
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100%',
      gap: 2,
      overflow: 'hidden'
    }}>
      {/* Left sidebar - Booklet Manager */}
      <Paper
        elevation={2}
        sx={{
          width: '250px',
          flexShrink: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          borderTop: '4px solid',
          borderImage: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%) 1',
        }}
      >
          <BookletManager 
            onLoadBooklet={onLoadBooklet}
            currentList={selectedList}
          isCompact={false}
          onListDelete={onListDelete}
          />
      </Paper>

      {/* Main content area */}
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {selectedList && (
          <ListContent
            list={selectedList}
            onUpdate={onListUpdate}
            isCompact={false}
          />
        )}
      </Box>
    </Box>
  );
};

export default SplitLayout; 
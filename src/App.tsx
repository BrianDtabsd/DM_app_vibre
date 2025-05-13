import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Snackbar, Alert, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { BookletManager } from './components/BookletManager';
import SplitLayout from './components/SplitLayout';
import { MultiView } from './components/MultiView';
import { SimpleAIHelper } from './components/SimpleAIHelper';
import { StatusCenter } from './components/StatusCenter';
import { IdeaPad } from './components/IdeaPad';
import { List } from './types';
import { getLists, saveList, saveBooklet, getSavedBooklets, saveLists } from './utils/storage';

import { SkinProvider } from './SkinProvider';

function App() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isMultiView, setIsMultiView] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);

  // Load saved lists and selected list on startup
  useEffect(() => {
    const savedLists = getLists();
    setLists(savedLists);
    
    // Try to restore the last selected list
    const lastSelectedId = localStorage.getItem('lastSelectedListId');
    if (lastSelectedId) {
      const lastSelected = savedLists.find(list => list.id === lastSelectedId);
      if (lastSelected) {
        setSelectedList(lastSelected);
      } else if (savedLists.length > 0) {
        setSelectedList(savedLists[0]);
      }
    } else if (savedLists.length > 0) {
      setSelectedList(savedLists[0]);
    }
  }, []);

  // Save the selected list ID whenever it changes
  useEffect(() => {
    if (selectedList) {
      localStorage.setItem('lastSelectedListId', selectedList.id);
    }
  }, [selectedList?.id]);

  // Auto-save lists whenever they change
  useEffect(() => {
    saveLists(lists);
  }, [lists]);

  const handleListCreate = (newList: List) => {
    saveList(newList);
    setLists(prevLists => [...prevLists, newList]);
    setSelectedList(newList);
    setSnackbarMessage('List created and saved!');
    setSnackbarOpen(true);
  };

  const handleListUpdate = (updatedList: List) => {
    saveList(updatedList);
    setLists(prevLists =>
      prevLists.map(list => list.id === updatedList.id ? updatedList : list)
    );
    setSelectedList(updatedList);
    setSnackbarMessage('List updated and saved!');
    setSnackbarOpen(true);
  };

  const handleSaveBooklet = (list: List) => {
    try {
      const bookletToSave = {
        ...list,
        savedAt: new Date().toISOString(),
      };
      saveBooklet(bookletToSave);
      setSnackbarMessage('List saved as booklet successfully!');
      setSnackbarOpen(true);
      
      // Trigger storage event for other components
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      setSnackbarMessage('Failed to save list. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleLoadBooklet = (list: List) => {
    setSelectedList(list);
    if (!lists.find(l => l.id === list.id)) {
      saveList(list);
      setLists(prevLists => [...prevLists, list]);
      setSnackbarMessage('Booklet loaded successfully!');
      setSnackbarOpen(true);
    }
  };

  const handleListDelete = (listId: string) => {
    setLists(prevLists => {
      const newLists = prevLists.filter(list => list.id !== listId);
      saveLists(newLists); // Ensure deleted state is saved
      return newLists;
    });
    
    if (selectedList?.id === listId) {
      const remainingLists = lists.filter(list => list.id !== listId);
      setSelectedList(remainingLists.length > 0 ? remainingLists[0] : null);
    }
    
    setSnackbarMessage('List deleted successfully');
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 600, 
              background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent'
            }}>
              Component Designer
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
              Create and save component specifications for your projects
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={() => setHelpDialogOpen(true)} 
              size="small" 
              color="primary"
              sx={{ border: '1px solid', borderColor: '#8A2BE2', color: '#8A2BE2' }}
            >
              <HelpOutlineIcon />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<ViewModuleIcon />}
              onClick={() => setIsMultiView(!isMultiView)}
              sx={{ 
                color: '#8A2BE2', 
                borderColor: '#8A2BE2',
                '&:hover': {
                  borderColor: '#6A1B9A',
                  backgroundColor: 'rgba(138, 43, 226, 0.1)',
                }
              }}
            >
              {isMultiView ? 'Single View' : 'Multi View'}
            </Button>
          </Box>
        </Box>
        
        {!isMultiView && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '3fr 1fr',
              gridTemplateRows: 'auto 2.5fr 1fr', // triple status, double idea pad
              gap: 3,
              minHeight: '80vh',
              alignItems: 'stretch',
            }}
          >
            {/* Chat Window spans 3 columns and all rows */}
            <Box
              sx={{
                gridColumn: '1 / 2',
                gridRow: '1 / 4',
                background: 'rgba(30,32,38,0.85)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
                borderRadius: 4,
                border: '1.5px solid #39397c',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 650, // increased height
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <SimpleAIHelper />
            </Box>
            {/* Status Center at top of right column, triple height */}
            <Box sx={{ gridColumn: '2 / 3', gridRow: '1 / 3', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', height: '100%' }}>
              <StatusCenter />
            </Box>
            {/* Idea Pad at bottom of right column, double height, aligned with chat window bottom */}
            <Box sx={{ gridColumn: '2 / 3', gridRow: '3 / 4', alignSelf: 'end', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
              <IdeaPad />
            </Box>
          </Box>
        )}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {isMultiView ? (
            <MultiView
              onClose={() => setIsMultiView(false)}
              onListUpdate={handleListUpdate}
              onSaveBooklet={handleSaveBooklet}
              currentList={selectedList}
            />
          ) : (
            <SplitLayout
              lists={lists}
              selectedList={selectedList}
              onListSelect={setSelectedList}
              onListUpdate={handleListUpdate}
              onSaveBooklet={handleSaveBooklet}
              onLoadBooklet={handleLoadBooklet}
              onListDelete={handleListDelete}
            />
          )}
        </Box>
      </Container>

      {/* Help Dialog */}
      <Dialog 
        open={helpDialogOpen} 
        onClose={() => setHelpDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}>
          How to Use Component Designer
        </DialogTitle>
        <DialogContent dividers sx={{ pb: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              color: '#8A2BE2', 
              fontWeight: 600 
            }}>
              Working with Lists and Booklets
            </Typography>
            <Typography variant="body2" paragraph>
              This app helps you create, organize, and save component specifications for your projects.
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
              Creating a New List:
            </Typography>
            <Typography variant="body2" paragraph>
              1. Enter component data in the text area (first line = component name, other lines = fields)
              <br />2. Click "Create List" to start working with it
              <br />3. Your component will appear in the main view
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
              Working with Booklets:
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Booklets:</strong> All your saved components appear in the left sidebar
              <br /><strong>Click any booklet:</strong> To load it instantly into the main view
              <br /><strong>Auto-save:</strong> All changes are automatically saved as you work
              <br /><strong>Save as booklet:</strong> Save the current component to your booklet collection
              <br /><strong>Import:</strong> Load a previously exported booklet file
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
              Basic Workflow:
            </Typography>
            <Typography variant="body2">
              1. Create a new list or click a booklet from the sidebar
              <br />2. Edit and refine your component details
              <br />3. All changes are automatically saved as you work
              <br />4. Export booklets to share or backup when needed
            </Typography>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
              Code Export Features:
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>AI Assistant Format:</strong> NEW! Special format designed for use with AI coding assistants
              <br /><strong>Multiple Export Formats:</strong> Export components as TypeScript, JavaScript, Go, Rust, HTML, and more
              <br /><strong>Professional Code:</strong> Generated code includes proper documentation, headers, and metadata
              <br /><strong>Code View:</strong> Preview generated code in the Code View tab
              <br /><strong>Batch Export:</strong> Export multiple components at once from the Booklet Manager
              <br /><strong>Help Guide:</strong> Access the comprehensive export guide via the help icon in Code View
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)} sx={{ color: '#8A2BE2' }}>Got It</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarMessage.includes('success') ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function AppWithSkinProvider() {
  return (
    <SkinProvider>
      <App />
    </SkinProvider>
  );
}

// Original App exported as named export for testing or future use
export { App };
 
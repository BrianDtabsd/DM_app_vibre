import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Paper,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  ContentCopy as DuplicateIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { List as ListType } from '../types';
import { 
  SavedBooklet, 
  getSavedBooklets, 
  saveBooklet, 
  deleteBooklet, 
  exportListToFile,
  importListFromFile,
  exportMultipleListsToZip,
  EXPORT_FORMATS,
} from '../utils/storage';
import { getTimeAgo } from '../utils/date';

// Predefined colors for booklet headers
export const BOOKLET_COLORS = [
  '#8A2BE2', // Primary purple accent color
  '#9D4EFF', // Light purple
  '#6A1B9A', // Dark purple
  '#6554C0', // Deep purple
  '#A7A7A7', // Silver
  '#8777D9', // Lavender
  '#FF5630', // Red/orange
  '#FFAB00', // Amber
  '#00875A', // Teal
  '#0052CC', // Deep blue
];

interface BookletManagerProps {
  onLoadBooklet: (list: ListType) => void;
  currentList: ListType | null;
  isCompact?: boolean;
  onListDelete?: (listId: string) => void;
}

export const BookletManager = ({ onLoadBooklet, currentList, isCompact = false, onListDelete }: BookletManagerProps) => {
  const [booklets, setBooklets] = useState<SavedBooklet[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBooklet, setSelectedBooklet] = useState<SavedBooklet | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [newBookletName, setNewBookletName] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [batchExportDialogOpen, setBatchExportDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [selectedBookletsForExport, setSelectedBookletsForExport] = useState<string[]>([]);
  const [mostRecentBookletId, setMostRecentBookletId] = useState<string | null>(null);

  // Load booklets on mount and when storage changes
  useEffect(() => {
    const loadBooklets = () => {
      const savedBooklets = getSavedBooklets();
      setBooklets(savedBooklets);
      
      // Get most recent booklet ID from localStorage
      const recentId = localStorage.getItem('mostRecentBookletId');
      if (recentId) {
        setMostRecentBookletId(recentId);
      } else if (savedBooklets.length > 0) {
        // If no recent booklet is stored, use the first one
        setMostRecentBookletId(savedBooklets[0].id);
      }
    };

    loadBooklets();
    window.addEventListener('storage', loadBooklets);
    return () => window.removeEventListener('storage', loadBooklets);
  }, []);

  // Set most recent booklet ID in localStorage
  useEffect(() => {
    if (mostRecentBookletId) {
      localStorage.setItem('mostRecentBookletId', mostRecentBookletId);
    }
  }, [mostRecentBookletId]);

  // Load booklet handler - simplified with no feedback
  const handleBookletLoad = (booklet: SavedBooklet) => {
      onLoadBooklet(booklet.list);
      setMostRecentBookletId(booklet.id);
    // No feedback message - removed for faster experience
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, booklet: SavedBooklet) => {
    event.stopPropagation();
    setSelectedBooklet(booklet);
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEditClick = () => {
    if (selectedBooklet) {
      setNewBookletName(selectedBooklet.name);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedBooklet) {
      deleteBooklet(selectedBooklet.id);
      setBooklets(getSavedBooklets());
      
      // Also delete from working lists if onListDelete is provided
      if (onListDelete && selectedBooklet.list.id === currentList?.id) {
        onListDelete(selectedBooklet.list.id);
      }
    }
    handleMenuClose();
  };

  const handleEditSave = () => {
    if (selectedBooklet && newBookletName.trim()) {
      const updatedBooklet: SavedBooklet = {
        ...selectedBooklet,
        name: newBookletName.trim(),
      };
      saveBooklet(updatedBooklet.list);
      setBooklets(getSavedBooklets());
      setEditDialogOpen(false);
    }
  };

  const handleAddBooklet = () => {
    if (newBookletName.trim()) {
      const newList: ListType = {
        id: Date.now().toString(),
        name: newBookletName.trim(),
        items: [],
        createdAt: new Date().toISOString(),
      };
      saveBooklet(newList);
      setBooklets(getSavedBooklets());
      setAddDialogOpen(false);
      setNewBookletName('');
    }
  };

  const handleExportBooklet = () => {
    if (selectedBooklet) {
      exportListToFile(selectedBooklet.list, 'json');
    }
    handleMenuClose();
  };

  const handleDuplicateBooklet = () => {
    if (selectedBooklet) {
      const duplicatedList: ListType = {
        ...selectedBooklet.list,
        id: Date.now().toString(),
        name: `${selectedBooklet.name} (Copy)`,
      };
      saveBooklet(duplicatedList);
      setBooklets(getSavedBooklets());
    }
    handleMenuClose();
  };

  const handleImportBooklet = async () => {
    try {
      const list = await importListFromFile();
      onLoadBooklet(list);
      setImportDialogOpen(false);
      setImportError(null);
    } catch (err) {
      if (err.message !== 'Import cancelled') {
        setImportError(err.message);
      }
    }
  };

  const handleSaveCurrentList = () => {
    if (currentList) {
      saveBooklet(currentList);
      const updatedBooklets = getSavedBooklets();
      setBooklets(updatedBooklets);
      
      // Find the newly saved booklet and set it as most recent
      const savedBooklet = updatedBooklets.find(b => b.list.id === currentList.id);
      if (savedBooklet) {
        setMostRecentBookletId(savedBooklet.id);
      }
    }
  };

  const handleExportCurrentList = () => {
    if (currentList) {
      exportListToFile(currentList, 'json');
    }
  };

  const handleFormatChange = (event: SelectChangeEvent<string>) => {
    setSelectedFormat(event.target.value);
  };

  const handleToggleBookletForExport = (bookletId: string) => {
    setSelectedBookletsForExport(prev => {
      if (prev.includes(bookletId)) {
        return prev.filter(id => id !== bookletId);
      } else {
        return [...prev, bookletId];
      }
    });
  };

  const handleSelectAllBookletsForExport = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedBookletsForExport(booklets.map(b => b.id));
    } else {
      setSelectedBookletsForExport([]);
    }
  };

  const handleBatchExport = async () => {
    const selectedBookletsData = booklets
      .filter(b => selectedBookletsForExport.includes(b.id))
      .map(b => b.list);
    
    if (selectedBookletsData.length > 0) {
      try {
        await exportMultipleListsToZip(selectedBookletsData, selectedFormat);
        setBatchExportDialogOpen(false);
        setSelectedBookletsForExport([]);
      } catch (error) {
        console.error('Batch export failed:', error);
      }
    }
  };

  // Render bookmark list - shared between compact and full views
  const renderBookletList = (compact: boolean) => {
    if (booklets.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No saved booklets yet
          </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              size="small"
              sx={{ mt: 1 }}
            >
              Add Booklet
            </Button>
        </Box>
      );
    }

    return (
      <List dense disablePadding>
        {booklets.map((booklet, index) => {
          const isRecent = booklet.id === mostRecentBookletId;
            return (
              <ListItem
                key={booklet.id}
                disablePadding
                sx={{
                py: 0.75,
                px: compact ? 1.5 : 2,
                borderLeft: `3px solid ${BOOKLET_COLORS[index % BOOKLET_COLORS.length]}`,
                backgroundColor: isRecent ? 'rgba(138, 43, 226, 0.08)' : 'transparent',
                  '&:hover': {
                  backgroundColor: 'rgba(138, 43, 226, 0.04)',
                  cursor: 'pointer',
                  },
                borderBottom: '1px solid',
                borderColor: 'divider',
                position: 'relative', // For better alignment of menu button
                }}
                  onClick={() => handleBookletLoad(booklet)}
                >
                  <Typography
                    noWrap
                    sx={{
                  fontSize: '0.9rem',
                  fontWeight: isRecent ? 500 : 400,
                      flexGrow: 1,
                  pr: 3, // Make room for the menu button
                    }}
                  >
                    {booklet.name}
                  </Typography>
                  <IconButton
                    size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent ListItem click
                  handleMenuOpen(e, booklet);
                }}
                sx={{
                  padding: '2px',
                  position: 'absolute',
                  right: compact ? 8 : 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </ListItem>
            );
        })}
      </List>
    );
  };

  // Render a compact view for the sidebar
  const renderCompactView = () => (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Title row */}
        <Box sx={{
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper', 
      }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            width: '100%', 
            textAlign: 'left', 
            fontWeight: 600,
            color: '#8A2BE2' // Purple accent color
          }}
        >
          Booklets
        </Typography>
        </Box>

      {/* Auto-save notice */}
      <Box sx={{ 
        px: 2,
        py: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <Typography variant="caption" sx={{ 
        display: 'flex', 
        alignItems: 'center',
          fontSize: '0.75rem',
          color: 'text.secondary',
      }}>
          <SaveIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: '#8A2BE2' }} />
          Auto-save enabled
        </Typography>
      </Box>
      
      {/* Action buttons row */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-start', // Left-justify buttons
        alignItems: 'center',
        px: 2,
        py: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Import booklet">
            <IconButton
              size="small"
              onClick={() => setImportDialogOpen(true)}
              sx={{ color: '#8A2BE2' }}
            >
              <UploadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add new booklet">
            <IconButton
              size="small"
              onClick={() => setAddDialogOpen(true)}
              sx={{ color: '#8A2BE2' }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* If current list is loaded and not yet saved as a booklet, show a simple save option */}
      {currentList && !booklets.some(b => b.list.id === currentList.id) && (
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 0.75,
          backgroundColor: 'rgba(138, 43, 226, 0.08)', // Light purple background
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Button 
            size="small" 
            variant="text"
            startIcon={<SaveIcon sx={{ fontSize: '0.875rem' }} />}
            onClick={handleSaveCurrentList}
            sx={{ 
              fontSize: '0.75rem',
              textTransform: 'none',
              color: '#8A2BE2', // Purple accent color
            }}
          >
            Save as booklet
          </Button>
        </Box>
      )}
    
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
      }}>
        {renderBookletList(true)}
      </Box>
    </Box>
  );

  // Render a full-featured view for the main page
  const renderFullView = () => (
    <Paper 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        p: 0,
        mt: 0, // Align top with the ListContent component
      }}
    >
        <Box sx={{
        display: 'flex', 
        flexDirection: 'column',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        {/* Title row */}
        <Box sx={{ 
          py: 1.5,
          px: 2.5,
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              width: '100%', 
              textAlign: 'left',
              fontWeight: 600,
              color: '#8A2BE2' // Purple accent color
            }}
          >
            Booklet Manager
          </Typography>
        </Box>

        {/* Auto-save info row */}
      <Box sx={{ 
          px: 2.5, 
          py: 0.75,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Typography variant="caption" sx={{ 
        display: 'flex', 
        alignItems: 'center',
            fontSize: '0.75rem',
            color: 'text.secondary',
      }}>
            <SaveIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: '#8A2BE2' }} />
            Auto-save enabled • All changes are saved immediately
        </Typography>
        </Box>
        
        {/* Action buttons row */}
        <Box sx={{ 
          px: 2.5, 
          py: 1.25,
          display: 'flex',
          justifyContent: 'flex-start', // Left-justify buttons
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Batch export booklets">
            <IconButton
              size="small"
              onClick={() => setBatchExportDialogOpen(true)}
                sx={{ color: '#8A2BE2' }}
            >
              <ArchiveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import booklet">
            <IconButton
              size="small"
              onClick={() => setImportDialogOpen(true)}
                sx={{ color: '#8A2BE2' }}
            >
              <UploadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add new booklet">
            <IconButton
              size="small"
              onClick={() => setAddDialogOpen(true)}
                sx={{ color: '#8A2BE2' }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Simple button row for current list if not saved as booklet */}
      {currentList && !booklets.some(b => b.list.id === currentList.id) && (
        <Box sx={{ 
          p: 1.5, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          backgroundColor: 'rgba(138, 43, 226, 0.08)', // Light purple background
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {currentList.name}
          </Typography>
            <Button 
              size="small" 
            variant="outlined" 
              startIcon={<SaveIcon />}
              onClick={handleSaveCurrentList}
            sx={{ 
              color: '#8A2BE2',
              borderColor: '#8A2BE2',
              '&:hover': {
                borderColor: '#6A1B9A',
                backgroundColor: 'rgba(138, 43, 226, 0.1)',
              }
            }}
            >
              Save as Booklet
            </Button>
        </Box>
      )}
      
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto',
        px: 0.5, // Add padding to match the ListContent component
      }}>
        {renderBookletList(false)}
      </Box>
    </Paper>
  );

  // Dialogs and Menus
  const renderDialogs = () => (
    <>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedBooklet) handleBookletLoad(selectedBooklet);
          handleMenuClose();
        }}>
          <SaveIcon fontSize="small" sx={{ mr: 1 }} />
          Load Booklet
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleDuplicateBooklet}>
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={handleExportBooklet}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Export
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle sx={{ 
          fontWeight: 600, 
          background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}>
          Rename Booklet
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Booklet Name"
            fullWidth
            value={newBookletName}
            onChange={(e) => setNewBookletName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained" sx={{ 
            background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
            '&:hover': {
              backgroundPosition: 'right center',
              transition: 'all 0.5s ease',
            }
          }} disabled={!newBookletName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle sx={{ 
          fontWeight: 600, 
          background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}>
          Add New Booklet
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Create an empty booklet to fill in later. Name it after the component you're planning to build.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Booklet Name"
            placeholder="e.g., LoginForm, UserProfile, Dashboard"
            fullWidth
            value={newBookletName}
            onChange={(e) => setNewBookletName(e.target.value)}
            helperText="Start with a clear name - you can add details later"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBooklet} variant="contained" sx={{ 
            background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
            '&:hover': {
              backgroundPosition: 'right center',
              transition: 'all 0.5s ease',
            }
          }} disabled={!newBookletName.trim()}>
            Create Empty Booklet
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importDialogOpen} onClose={() => {
        setImportDialogOpen(false);
        setImportError(null);
      }}>
        <DialogTitle sx={{ 
          fontWeight: 600, 
          background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}>
          Import Booklet
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Load a previously exported booklet file (.json format). This will add it to your booklet collection and make it available for editing.
          </Typography>
          {importError && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              Error: {importError}
            </Typography>
          )}
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={handleImportBooklet}
            fullWidth
            sx={{ 
              color: '#8A2BE2',
              borderColor: '#8A2BE2',
              '&:hover': {
                borderColor: '#6A1B9A',
                backgroundColor: 'rgba(138, 43, 226, 0.1)',
              }
            }}
          >
            Choose Booklet File
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setImportDialogOpen(false);
            setImportError(null);
          }}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={batchExportDialogOpen} 
        onClose={() => setBatchExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}>
          Batch Export Booklets
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={selectedFormat}
                label="Export Format"
                onChange={handleFormatChange}
              >
                {Object.entries(EXPORT_FORMATS).map(([key, { extension }]) => (
                  <MenuItem key={key} value={key}>
                    {key.toUpperCase()} ({extension})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedBookletsForExport.length === booklets.length}
                  indeterminate={selectedBookletsForExport.length > 0 && selectedBookletsForExport.length < booklets.length}
                  onChange={handleSelectAllBookletsForExport}
                />
              }
              label="Select All"
            />
          </Box>

          <Box sx={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <List dense>
              {booklets.map((booklet) => (
                <ListItem key={booklet.id} dense>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedBookletsForExport.includes(booklet.id)}
                        onChange={() => handleToggleBookletForExport(booklet.id)}
                        size="small"
                      />
                    }
                    label={booklet.name}
                    sx={{ 
                      m: 0,
                      width: '100%',
                      '& .MuiTypography-root': {
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  />
                </ListItem>
              ))}
              {booklets.length === 0 && (
                <ListItem>
                  <Typography variant="body2" color="text.secondary">
                    No booklets available
                  </Typography>
                </ListItem>
              )}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchExportDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleBatchExport}
            variant="contained"
            disabled={selectedBookletsForExport.length === 0}
            startIcon={<ArchiveIcon />}
            sx={{ 
              background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
              '&:hover': {
                backgroundPosition: 'right center',
                transition: 'all 0.5s ease',
              }
            }}
          >
            Export Selected
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return (
    <>
      {isCompact ? renderCompactView() : renderFullView()}
      {renderDialogs()}
    </>
  );
}; 
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
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { List as ListType } from '../types';
import { SavedBooklet, getSavedBooklets, saveBooklet, deleteBooklet } from '../utils/storage';
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

interface SavedBookletsProps {
  onLoadBooklet: (list: ListType) => void;
  isCompact?: boolean;
}

export const SavedBooklets = ({ onLoadBooklet, isCompact = false }: SavedBookletsProps) => {
  const [booklets, setBooklets] = useState<SavedBooklet[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBooklet, setSelectedBooklet] = useState<SavedBooklet | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [newBookletName, setNewBookletName] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Load booklets on mount and when storage changes
  useEffect(() => {
    const loadBooklets = () => {
      const savedBooklets = getSavedBooklets();
      console.log('Loaded booklets:', savedBooklets);
      setBooklets(savedBooklets);
    };

    loadBooklets();
    window.addEventListener('storage', loadBooklets);
    return () => window.removeEventListener('storage', loadBooklets);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, booklet: SavedBooklet) => {
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

  if (booklets.length === 0) {
    return (
      <Box sx={{ p: isCompact ? 1 : 2, textAlign: 'center' }}>
        <Typography variant={isCompact ? "body2" : "h6"} color="text.secondary" gutterBottom>
          No Saved Booklets
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
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: 2,
        py: 1,
      }}>
        <Typography variant="subtitle2" sx={{ 
          color: '#8A2BE2', 
          fontWeight: 600 
        }}>
          Saved Booklets
        </Typography>
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
      
      <List dense>
        {booklets.map((booklet, index) => (
          <ListItem
            key={booklet.id}
            sx={{
              borderLeft: `4px solid ${BOOKLET_COLORS[index % BOOKLET_COLORS.length]}`,
              '&:hover': {
                backgroundColor: 'rgba(138, 43, 226, 0.04)',
              },
              py: 1,
              px: 1.5,
            }}
          >
            <ListItemText
              primary={booklet.name}
              secondary={getTimeAgo(booklet.savedAt)}
              primaryTypographyProps={{
                variant: 'subtitle2',
                sx: {
                  color: BOOKLET_COLORS[index % BOOKLET_COLORS.length],
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
              secondaryTypographyProps={{
                variant: 'caption',
                sx: {
                  fontSize: '0.75rem',
                },
              }}
              onClick={() => onLoadBooklet(booklet.list)}
              sx={{ cursor: 'pointer' }}
            />
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, booklet)}
              sx={{ ml: 1, color: '#0097C0' }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1, color: '#8A2BE2' }} />
          Rename
        </MenuItem>
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
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddBooklet} variant="contained" sx={{ 
            background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
            '&:hover': {
              backgroundPosition: 'right center',
              transition: 'all 0.5s ease',
            }
          }} disabled={!newBookletName.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 
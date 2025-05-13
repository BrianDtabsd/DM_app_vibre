import React, { useState, useMemo } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  TextField, 
  Typography, 
  Button, 
  IconButton,
  List as MuiList,
  ListItem as MuiListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { List, ListItem } from '../types';

// Predefined color palette for tabs
const TAB_COLORS = [
  '#FF6B6B', // coral red
  '#4ECDC4', // turquoise
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFEEAD', // cream yellow
  '#D4A5A5', // dusty rose
  '#9B59B6', // purple
  '#3498DB', // blue
  '#E67E22', // orange
  '#1ABC9C', // emerald
];

interface ListTabsProps {
  list: List;
  onUpdate: (updatedList: List) => void;
  onSave: (list: List) => void;
}

interface SubListDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (items: string[]) => void;
  itemTitle: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const SubListDialog = ({ open, onClose, onAdd, itemTitle }: SubListDialogProps) => {
  const [items, setItems] = useState('');

  const handleSubmit = () => {
    const itemsList = items.split('\n').filter(item => item.trim() !== '');
    onAdd(itemsList);
    setItems('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Sub-Items to "{itemTitle}"
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={items}
          onChange={(e) => setItems(e.target.value)}
          placeholder="Enter sub-items (one per line)"
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ListTabs = ({ list, onUpdate, onSave }: ListTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const tabColors = useMemo(() => {
    return list.items.map((_, index) => TAB_COLORS[index % TAB_COLORS.length]);
  }, [list.items.length]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleContentChange = (itemId: string, newContent: string) => {
    const updateItemContent = (items: ListItem[]): ListItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, content: newContent };
        }
        if (item.subItems) {
          return { ...item, subItems: updateItemContent(item.subItems) };
        }
        return item;
      });
    };

    onUpdate({
      ...list,
      items: updateItemContent(list.items)
    });
  };

  const handleSubItemContentChange = (parentId: string, subItemId: string, newContent: string) => {
    const updateSubItemContent = (items: ListItem[]): ListItem[] => {
      return items.map(item => {
        if (item.id === parentId && item.subItems) {
          return {
            ...item,
            subItems: item.subItems.map(subItem =>
              subItem.id === subItemId ? { ...subItem, content: newContent } : subItem
            )
          };
        }
        if (item.subItems) {
          return { ...item, subItems: updateSubItemContent(item.subItems) };
        }
        return item;
      });
    };

    onUpdate({
      ...list,
      items: updateSubItemContent(list.items)
    });
  };

  const toggleExpanded = (itemId: string) => {
    const toggleItem = (items: ListItem[]): ListItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.subItems) {
          return { ...item, subItems: toggleItem(item.subItems) };
        }
        return item;
      });
    };

    onUpdate({
      ...list,
      items: toggleItem(list.items)
    });
  };

  const handleAddSubItems = (parentId: string, newSubItems: string[]) => {
    const addSubItems = (items: ListItem[]): ListItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          const newSubItemsList = newSubItems.map(title => ({
            id: crypto.randomUUID(),
            title: title.trim(),
            content: '',
          }));
          
          return {
            ...item,
            subItems: [...(item.subItems || []), ...newSubItemsList],
            isExpanded: true
          };
        }
        if (item.subItems) {
          return { ...item, subItems: addSubItems(item.subItems) };
        }
        return item;
      });
    };

    onUpdate({
      ...list,
      items: addSubItems(list.items)
    });
  };

  const openAddSubItemDialog = (itemId: string) => {
    setSelectedItemId(itemId);
    setDialogOpen(true);
  };

  const renderSubItems = (parentId: string, subItems: ListItem[], color: string) => {
    return (
      <MuiList sx={{ pl: 2 }}>
        {subItems.map((subItem) => (
          <MuiListItem 
            key={subItem.id}
            sx={{ 
              flexDirection: 'column',
              alignItems: 'stretch',
              borderLeft: `2px solid ${color}40`,
              pl: 2,
              mt: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ListItemText primary={subItem.title} />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={subItem.content}
              onChange={(e) => handleSubItemContentChange(parentId, subItem.id, e.target.value)}
              placeholder={`Add notes about ${subItem.title} here...`}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: color,
                  },
                },
              }}
            />
          </MuiListItem>
        ))}
      </MuiList>
    );
  };

  const selectedItem = selectedItemId ? list.items.find(item => item.id === selectedItemId) : null;

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <Typography variant="h6">
            {list.name}
          </Typography>
          <Tooltip title="Creation date">
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {formatDate(list.createdAt)}
            </Typography>
          </Tooltip>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSave(list)}
        >
          Save as Booklet
        </Button>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{
            sx: { backgroundColor: tabColors[activeTab] }
          }}
        >
          {list.items.map((item, index) => (
            <Tab
              key={item.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.title}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddSubItemDialog(item.id);
                    }}
                    sx={{ 
                      ml: 1,
                      color: 'inherit',
                      opacity: 0.7,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
              id={`tab-${index}`}
              sx={{
                '&.Mui-selected': {
                  color: tabColors[index],
                },
                '&:hover': {
                  color: tabColors[index],
                  opacity: 0.8,
                },
                borderBottom: `2px solid ${tabColors[index]}`,
                transition: 'color 0.3s ease, border-color 0.3s ease',
              }}
            />
          ))}
        </Tabs>
      </Box>

      <MuiList>
        {list.items.map((item, index) => (
          <Paper 
            key={item.id} 
            elevation={1} 
            sx={{ 
              mb: 2,
              borderLeft: `4px solid ${tabColors[index % tabColors.length]}`,
            }}
          >
            <MuiListItem
              sx={{
                flexDirection: 'column',
                alignItems: 'stretch',
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: tabColors[index % tabColors.length] }}>
                  {item.title}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => openAddSubItemDialog(item.id)}
                  sx={{ 
                    ml: 2,
                    color: tabColors[index % tabColors.length],
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                value={item.content}
                onChange={(e) => handleContentChange(item.id, e.target.value)}
                placeholder={`Add notes about ${item.title} here...`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: tabColors[index % tabColors.length],
                    },
                  },
                }}
              />

              {item.subItems && item.subItems.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 2, color: tabColors[index % tabColors.length] }}>
                    Sub-Items:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {item.subItems.map((subItem) => (
                      <Box 
                        key={subItem.id}
                        sx={{ 
                          mb: 2,
                          borderLeft: `2px solid ${tabColors[index % tabColors.length]}40`,
                          pl: 2
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          {subItem.title}
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={subItem.content}
                          onChange={(e) => handleSubItemContentChange(item.id, subItem.id, e.target.value)}
                          placeholder={`Add notes about ${subItem.title} here...`}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: tabColors[index % tabColors.length],
                              },
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </MuiListItem>
          </Paper>
        ))}
      </MuiList>

      <SubListDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedItemId(null);
        }}
        onAdd={(items) => {
          if (selectedItemId) {
            handleAddSubItems(selectedItemId, items);
          }
        }}
        itemTitle={selectedItem?.title || ''}
      />
    </Box>
  );
}; 
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List as MUIList,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  ContentCopy as CopyIcon,
  Code as CodeIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
  Download as DownloadIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import { List, ListItem as ListItemType } from '../types';
import { BOOKLET_COLORS } from './SavedBooklets';
import { getSavedBooklets, exportListToFile, EXPORT_FORMATS } from '../utils/storage';
import { CodeView } from './CodeView';

interface ListContentProps {
  list: List;
  onUpdate: (list: List) => void;
  isCompact?: boolean;
}

interface EditDialogProps {
  open: boolean;
  onClose: () => void;
  item: ListItemType | null;
  onSave: (content: string) => void;
}

const EditDialog = ({ open, onClose, item, onSave }: EditDialogProps) => {
  const [content, setContent] = useState(item?.content || '');

  React.useEffect(() => {
    setContent(item?.content || '');
  }, [item]);

  const handleSubmit = () => {
    onSave(content);
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ 
            fontWeight: 600, 
            background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent'
          }}>
            Edit {item?.title}
          </Typography>
          {content && (
            <Tooltip title="Copy text">
              <IconButton onClick={handleCopy} size="small" sx={{ color: '#8A2BE2' }}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          multiline
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          margin="normal"
          label="Content"
          placeholder="Enter content here..."
          InputProps={{
            sx: { 
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ 
          background: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)',
          '&:hover': {
            backgroundPosition: 'right center',
            transition: 'all 0.5s ease',
          }
        }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const ListContent: React.FC<ListContentProps> = ({ list, onUpdate, isCompact = false }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListItemType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'code'>('grid');
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [codeGuideDialogOpen, setCodeGuideDialogOpen] = useState(false);

  const handleToggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleToggleExpandAll = () => {
    const newIsAllExpanded = !isAllExpanded;
    setIsAllExpanded(newIsAllExpanded);
    
    const newExpandedItems: Record<string, boolean> = {};
    
    // Toggle main list
    if (list.originalText) {
      newExpandedItems['main-list'] = newIsAllExpanded;
    }
    
    // Toggle all items and their sub-items
    list.items.forEach(item => {
      // Always expand the main item if it has content or sub-items
      if (item.content || (item.subItems && item.subItems.length > 0)) {
        newExpandedItems[item.id] = newIsAllExpanded;
      }
      
      // Expand sub-items if they have content
      if (item.subItems) {
        item.subItems.forEach(subItem => {
          if (subItem.content) {
            newExpandedItems[subItem.id] = newIsAllExpanded;
          }
        });
      }
    });
    
    setExpandedItems(newExpandedItems);
  };

  const handleEdit = (item: ListItemType) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = (newContent: string) => {
    if (!selectedItem) return;

    const updateItemContent = (items: ListItemType[]): ListItemType[] => {
      return items.map(item => {
        if (item.id === selectedItem.id) {
          return { ...item, content: newContent };
        }
        if (item.subItems) {
          const updatedSubItems = updateItemContent(item.subItems);
          if (updatedSubItems !== item.subItems) {
            return { ...item, subItems: updatedSubItems };
          }
        }
        return item;
      });
    };

    onUpdate({
      ...list,
      items: updateItemContent(list.items),
    });
  };

  const handleCopyOriginalText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Get the color for this list based on its position in the saved booklets
  const listColor = React.useMemo(() => {
    const booklets = getSavedBooklets();
    const index = booklets.findIndex(b => b.list.id === list.id);
    return BOOKLET_COLORS[Math.max(0, index) % BOOKLET_COLORS.length];
  }, [list.id]);

  const OriginalTextDisplay = ({ text, title }: { text: string, title?: string }) => (
    <Paper 
      elevation={1} 
      sx={{ 
        p: isCompact ? 1 : 2, 
        mb: isCompact ? 1 : 3, 
        bgcolor: 'background.default',
        position: 'relative',
        maxWidth: isCompact ? '300px' : 'none',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography 
          variant={isCompact ? "body1" : "subtitle1"} 
          sx={{ 
            color: listColor, 
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {title || 'Original Text'}
        </Typography>
        <Tooltip title="Copy original text">
          <IconButton
            size="small"
            onClick={() => handleCopyOriginalText(text)}
            sx={{ color: '#8A2BE2' }}
          >
            <CopyIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography
        component="pre"
        sx={{
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: isCompact ? '0.8rem' : '0.9rem',
          bgcolor: 'background.paper',
          p: isCompact ? 1 : 2,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
          maxHeight: isCompact ? '150px' : 'none',
          overflowY: 'auto',
        }}
      >
        {text}
      </Typography>
    </Paper>
  );

  const generateCodeView = () => {
    let code = `// ${list.name}\n`;
    if (list.originalText) {
      code += `/*\n${list.originalText}\n*/\n\n`;
    }

    list.items.forEach(item => {
      code += `// ${item.title}\n`;
      if (item.content) {
        code += `/*\n${item.content}\n*/\n`;
      }
      
      if (item.subItems?.length) {
        item.subItems.forEach(subItem => {
          code += `  // ${subItem.title}\n`;
          if (subItem.content) {
            code += `  /*\n  ${subItem.content.split('\n').join('\n  ')}\n  */\n`;
          }
        });
      }
      code += '\n';
    });

    return code;
  };

  const handleCopyCode = async () => {
    try {
      const codeElement = document.querySelector('code');
      if (codeElement) {
        await navigator.clipboard.writeText(codeElement.textContent || '');
      }
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    try {
      const codeElement = document.querySelector('code');
      if (codeElement) {
        exportListToFile(list, 'typescript');
      }
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  const handleExportAll = async () => {
    try {
      // Show a more descriptive message when exporting
      setSnackbarMessage('Exporting all formats. Check your downloads folder.');
      setSnackbarOpen(true);
      
      // Add a slight delay between file downloads to ensure all get saved
      for (const format of Object.keys(EXPORT_FORMATS)) {
        await exportListToFile(list, format);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (err) {
      console.error('Failed to export all formats:', err);
      setSnackbarMessage('Error exporting files. Please try again.');
      setSnackbarOpen(true);
    }
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExportFormat = (format: string) => {
    try {
      exportListToFile(list, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
    handleExportClose();
  };

  const handleShowCodeGuide = () => {
    setCodeGuideDialogOpen(true);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 0,
        borderTop: '4px solid',
        borderImage: 'linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%) 1',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 0,
        py: isCompact ? 1 : 1.5,
        px: isCompact ? 1.5 : 2.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 3,
          minWidth: 0,
          flex: '1 1 auto'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#8A2BE2',
              fontWeight: 600,
              cursor: list.originalText ? 'pointer' : 'default',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: '180px',
              maxWidth: isCompact ? '150px' : '300px'
            }}
            onClick={() => {
              if (list.originalText) {
                handleToggleExpand('main-list');
              }
            }}
          >
            {list.name}
          </Typography>
          <Tabs 
            value={viewMode} 
            onChange={(_, newValue) => setViewMode(newValue)}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                py: 0.5,
                px: 2,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8A2BE2',
              },
            }}
            TabIndicatorProps={{
              style: { backgroundColor: '#8A2BE2' }
            }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Grid View" value="grid" />
            <Tab label="Code View" value="code" />
          </Tabs>
        </Box>
      </Box>

      {/* Auto-save notice row */}
      <Box sx={{ 
        py: 0.75,
        px: isCompact ? 1.5 : 2.5,
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
          Auto-save enabled • All changes are saved immediately
        </Typography>
      </Box>

      {/* Action buttons row */}
      <Box sx={{ 
        py: isCompact ? 0.75 : 1,
        px: isCompact ? 1.5 : 2.5,
        display: 'flex',
        justifyContent: 'flex-start', // Left-justify buttons
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'center',
        }}>
          {viewMode === 'grid' && (
            <Tooltip title={isAllExpanded ? "Collapse all" : "Expand all"}>
              <IconButton
                size="small"
                onClick={handleToggleExpandAll}
                sx={{ color: '#8A2BE2' }}
              >
                {isAllExpanded ? (
                  <UnfoldLessIcon />
                ) : (
                  <UnfoldMoreIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
          {viewMode === 'code' && (
            <>
              <Tooltip title="Copy code">
                <IconButton
                  size="small"
                  onClick={handleCopyCode}
                  sx={{ color: '#8A2BE2' }}
                >
                  <CopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download current format">
                <IconButton
                  size="small"
                  onClick={handleDownload}
                  sx={{ color: '#8A2BE2' }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                size="small"
                onClick={handleExportAll}
                startIcon={<CodeIcon />}
                sx={{ 
                  color: '#8A2BE2',
                  borderColor: '#8A2BE2',
                  '&:hover': {
                    borderColor: '#6A1B9A',
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                  },
                }}
              >
                Export All Formats
              </Button>
              <Tooltip title="Code Export Guide">
                <IconButton
                  size="small"
                  onClick={handleShowCodeGuide}
                  sx={{ color: '#8A2BE2', ml: 1 }}
                >
                  <HelpOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          {list.originalText && viewMode === 'grid' && (
            <IconButton
              size="small"
              onClick={() => handleToggleExpand('main-list')}
              sx={{ color: '#8A2BE2' }}
            >
              {expandedItems['main-list'] ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </IconButton>
          )}
        </Box>
      </Box>

      {list.originalText && viewMode === 'grid' && (
        <Collapse in={expandedItems['main-list']} timeout="auto">
          <Box sx={{ m: 3 }}>
            <OriginalTextDisplay text={list.originalText} title={`Original ${list.name} Text`} />
          </Box>
        </Collapse>
      )}

      <Box sx={{ p: isCompact ? 1.5 : 2.5 }}>
      {viewMode === 'code' ? (
        <CodeView list={list} color={listColor} />
      ) : (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 2,
          width: '100%',
        }}>
          {list.items.map((item) => (
            <Paper
              key={item.id}
              elevation={1}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* Item Header */}
              <Box sx={{
                p: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: listColor,
                      fontWeight: 600,
                    flex: 1,
                  }}
                >
                  {item.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item);
                    }}
                      sx={{ color: '#8A2BE2' }}
                  >
                    <EditIcon />
                  </IconButton>
                  {(item.subItems?.length || item.content) && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExpand(item.id);
                      }}
                        sx={{ color: '#8A2BE2' }}
                    >
                      {expandedItems[item.id] ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Item Content */}
              <Collapse in={expandedItems[item.id]} timeout="auto">
                <Box sx={{ p: 1.5 }}>
                  {item.content && (
                    <OriginalTextDisplay 
                      text={item.content} 
                      title={`Original ${item.title} Text`}
                    />
                  )}

                  {item.subItems && item.subItems.length > 0 && (
                    <Box sx={{ mt: item.content ? 2 : 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: listColor,
                          mb: 1,
                            fontWeight: 600,
                        }}
                      >
                        Sub-Items:
                      </Typography>
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: 1,
                      }}>
                        {item.subItems.map((subItem) => (
                          <Paper
                            key={subItem.id}
                            elevation={0}
                            sx={{
                              p: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              bgcolor: 'background.default',
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: subItem.content ? 1 : 0,
                            }}>
                                <Typography 
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    color: listColor,
                                  }}
                                >
                                {subItem.title}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(subItem);
                                  }}
                                    sx={{ color: '#8A2BE2' }}
                                >
                                  <EditIcon />
                                </IconButton>
                                {subItem.content && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleExpand(subItem.id);
                                    }}
                                      sx={{ color: '#8A2BE2' }}
                                  >
                                    {expandedItems[subItem.id] ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                            <Collapse in={expandedItems[subItem.id]} timeout="auto">
                              {subItem.content && (
                                <Box sx={{ mt: 1 }}>
                                  <OriginalTextDisplay 
                                    text={subItem.content} 
                                    title={`Original ${subItem.title} Text`}
                                  />
                                </Box>
                              )}
                            </Collapse>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Box>
      )}
      </Box>

      <EditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSave={handleSaveEdit}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="info"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={codeGuideDialogOpen}
        onClose={() => setCodeGuideDialogOpen(false)}
        maxWidth="md"
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
          Code Export Guide
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: '#8A2BE2' }}>
              Available Export Formats
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">
                <strong>TypeScript (.ts)</strong>: TypeScript interfaces with JSDoc comments
              </Typography>
              <Typography component="li" variant="body2">
                <strong>JavaScript (.js)</strong>: JavaScript classes with JSDoc documentation
              </Typography>
              <Typography component="li" variant="body2">
                <strong>TSX (.tsx)</strong>: React TypeScript components with interface definitions
              </Typography>
              <Typography component="li" variant="body2">
                <strong>JSON (.json)</strong>: Structured JSON with metadata and component specs
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Go (.go)</strong>: Go structs with idiomatic Go documentation
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Rust (.rs)</strong>: Rust structs with standard Rust documentation patterns
              </Typography>
              <Typography component="li" variant="body2">
                <strong>HTML (.html)</strong>: HTML template with CSS and component structure
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Text (.txt)</strong>: Plain text documentation of component specs
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 500, color: '#8A2BE2' }}>
              Enhanced Features
            </Typography>
            <Typography variant="body2" paragraph>
              All exported code files now include:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">File headers with metadata (creation date, version)</Typography>
              <Typography component="li" variant="body2">Professional documentation in language-native style</Typography>
              <Typography component="li" variant="body2">Comprehensive property descriptions</Typography>
              <Typography component="li" variant="body2">Usage examples where appropriate</Typography>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3, fontWeight: 500, color: '#8A2BE2' }}>
              Tips for Better Code Exports
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2">Provide detailed descriptions in the content fields - they become code documentation</Typography>
              <Typography component="li" variant="body2">Use consistent naming conventions for component properties</Typography>
              <Typography component="li" variant="body2">Add descriptive text to the original component for better file headers</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCodeGuideDialogOpen(false)} 
            sx={{ color: '#8A2BE2' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ListContent; 
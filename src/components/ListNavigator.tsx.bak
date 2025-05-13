import React, { useState } from 'react';
import {
  List as MUIList,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Collapse,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Article as ArticleIcon,
  List as ListIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { List, ListItem } from '../types';
import { BOOKLET_COLORS } from './SavedBooklets';
import { getSavedBooklets } from '../utils/storage';

interface ListNavigatorProps {
  lists: List[];
  selectedList: List | null;
  onListSelect: (list: List) => void;
  onListDelete: (listId: string) => void;
}

const ListNavigator: React.FC<ListNavigatorProps> = ({
  lists,
  selectedList,
  onListSelect,
  onListDelete,
}) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>({});

  // Get colors for lists based on saved booklets
  const listColors = React.useMemo(() => {
    const booklets = getSavedBooklets();
    return lists.reduce((acc, list) => {
      const index = booklets.findIndex(b => b.list.id === list.id);
      acc[list.id] = BOOKLET_COLORS[Math.max(0, index) % BOOKLET_COLORS.length];
      return acc;
    }, {} as Record<string, string>);
  }, [lists]);

  const handleToggleListExpand = (listId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedLists(prev => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  };

  const handleToggleItemExpand = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  if (lists.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No lists available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <MUIList component="nav" dense>
        {lists.map((list) => (
          <Box key={list.id}>
            <ListItemButton
              selected={selectedList?.id === list.id}
              onClick={() => onListSelect(list)}
              sx={{
                pl: 2,
                pr: 1,
                py: 0.75,
                '& .MuiListItemText-root': {
                  margin: 0,
                },
                '& .MuiTypography-root': {
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ListIcon sx={{ fontSize: '1.2rem', color: listColors[list.id] }} />
              </ListItemIcon>
              <ListItemText primary={list.name} />
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                {list.items.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleToggleListExpand(list.id, e)}
                    sx={{ p: 0.5 }}
                  >
                    {expandedLists[list.id] ? (
                      <ExpandLessIcon sx={{ fontSize: '1.2rem' }} />
                    ) : (
                      <ExpandMoreIcon sx={{ fontSize: '1.2rem' }} />
                    )}
                  </IconButton>
                )}
                <Tooltip title="Delete list">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onListDelete(list.id);
                    }}
                    sx={{ 
                      p: 0.5,
                      color: 'error.light',
                      '&:hover': {
                        color: 'error.main',
                      },
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: '1.2rem' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItemButton>

            <Collapse in={expandedLists[list.id]} timeout="auto">
              <MUIList component="div" dense disablePadding>
                {list.items.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItemButton
                      sx={{
                        pl: 4,
                        borderRadius: 1,
                        ml: 2,
                        mb: 0.5,
                        borderLeft: `2px solid ${listColors[list.id]}40`,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: listColors[list.id] }}>
                        <ArticleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 'medium',
                          color: listColors[list.id],
                        }}
                        secondary={item.content ? '(Has content)' : undefined}
                        secondaryTypographyProps={{ 
                          variant: 'caption',
                          sx: { color: '#616161' }
                        }}
                      />
                      {(item.subItems?.length || item.content) && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleToggleItemExpand(item.id, e)}
                          sx={{ color: listColors[list.id] }}
                        >
                          {expandedItems[item.id] ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </IconButton>
                      )}
                    </ListItemButton>

                    <Collapse in={expandedItems[item.id]} timeout="auto">
                      <MUIList component="div" dense disablePadding>
                        {item.content && (
                          <ListItemButton
                            sx={{
                              pl: 6,
                              borderRadius: 1,
                              ml: 4,
                              mb: 0.5,
                              borderLeft: `2px solid ${listColors[list.id]}20`,
                              fontStyle: 'italic',
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36, color: listColors[list.id] }}>
                              <ArticleIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary="Original Text"
                              secondary={item.content.slice(0, 50) + (item.content.length > 50 ? '...' : '')}
                              primaryTypographyProps={{
                                variant: 'body2',
                                color: listColors[list.id],
                                fontStyle: 'italic',
                              }}
                              secondaryTypographyProps={{
                                sx: { 
                                  fontFamily: 'monospace',
                                  fontSize: '0.8rem',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }
                              }}
                            />
                          </ListItemButton>
                        )}
                        {item.subItems?.map((subItem) => (
                          <React.Fragment key={subItem.id}>
                            <ListItemButton
                              onClick={(e) => {
                                if (subItem.content) {
                                  handleToggleItemExpand(subItem.id, e);
                                }
                              }}
                              sx={{
                                pl: 6,
                                borderRadius: 1,
                                ml: 4,
                                mb: 0.5,
                                borderLeft: `2px solid ${listColors[list.id]}20`,
                                cursor: subItem.content ? 'pointer' : 'default',
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36, color: listColors[list.id] }}>
                                <ArticleIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.title}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  fontWeight: 'medium',
                                  color: listColors[list.id],
                                }}
                                secondary={subItem.content ? '(Has content)' : undefined}
                                secondaryTypographyProps={{ 
                                  variant: 'caption',
                                  sx: { color: '#616161' }
                                }}
                              />
                              {subItem.content && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleItemExpand(subItem.id, e);
                                  }}
                                  sx={{ color: listColors[list.id] }}
                                >
                                  {expandedItems[subItem.id] ? (
                                    <ExpandLessIcon fontSize="small" />
                                  ) : (
                                    <ExpandMoreIcon fontSize="small" />
                                  )}
                                </IconButton>
                              )}
                            </ListItemButton>
                            {subItem.content && (
                              <Collapse in={expandedItems[subItem.id]} timeout="auto">
                                <MUIList component="div" dense disablePadding>
                                  <ListItemButton
                                    sx={{
                                      pl: 8,
                                      borderRadius: 1,
                                      ml: 6,
                                      mb: 0.5,
                                      borderLeft: `2px solid ${listColors[list.id]}10`,
                                      fontStyle: 'italic',
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: 36, color: listColors[list.id] }}>
                                      <ArticleIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary="Original Text"
                                      secondary={subItem.content.slice(0, 50) + (subItem.content.length > 50 ? '...' : '')}
                                      primaryTypographyProps={{
                                        variant: 'body2',
                                        color: listColors[list.id],
                                        fontStyle: 'italic',
                                      }}
                                      secondaryTypographyProps={{
                                        sx: { 
                                          fontFamily: 'monospace',
                                          fontSize: '0.8rem',
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                        }
                                      }}
                                    />
                                  </ListItemButton>
                                </MUIList>
                              </Collapse>
                            )}
                          </React.Fragment>
                        ))}
                      </MUIList>
                    </Collapse>
                  </React.Fragment>
                ))}
              </MUIList>
            </Collapse>
          </Box>
        ))}
      </MUIList>
    </Box>
  );
};

export default ListNavigator; 
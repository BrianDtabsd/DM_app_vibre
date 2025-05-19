// /home/ubuntu/DM_app_vibre_clone/src/components/DataModelViewer.tsx
import React from "react";
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Chip } from "@mui/material";
// Removed DataRelationship from import as it's an inline type within DataEntity
import { ParsedDataModel, DataEntity, DataEntityAttribute } from "../parser/types"; 

interface DataModelViewerProps {
  parsedDataModel: ParsedDataModel | null | undefined;
}

// Define the inline type for a relationship object for clarity if needed, or use it directly.
interface RelationshipDetail {
  toEntity: string;
  type: string;
  description?: string;
}

const DataModelViewer: React.FC<DataModelViewerProps> = ({ parsedDataModel }) => {
  if (!parsedDataModel || Object.keys(parsedDataModel).length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, my: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Data Model
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No data model information has been parsed or provided yet.
        </Typography>
      </Paper>
    );
  }

  const { dataEntities, dataStorageNotes, parsingIssues } = parsedDataModel;

  return (
    <Paper elevation={1} sx={{ p: 2, my: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Parsed Data Model
      </Typography>

      {parsingIssues && parsingIssues.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" color="error" gutterBottom>
            Parsing Issues:
          </Typography>
          <List dense disablePadding>
            {parsingIssues.map((issue, index) => (
              <ListItem key={index} disableGutters sx={{ pl: 1 }}>
                <ListItemText primary={`- ${issue}`} primaryTypographyProps={{ variant: "body2", color: "error.main" }} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
        </Box>
      )}

      {dataEntities && dataEntities.length > 0 ? (
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Data Entities:
          </Typography>
          {dataEntities.map((entity: DataEntity, index: number) => (
            <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                {entity.name}
              </Typography>
              {entity.description && (
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{mb:1}}>
                  {entity.description}
                </Typography>
              )}
              <Typography variant="subtitle2" gutterBottom sx={{mt:1}}>
                Attributes:
              </Typography>
              {entity.attributes && entity.attributes.length > 0 ? (
                <List dense disablePadding sx={{mb:1}}>
                  {entity.attributes.map((attr: DataEntityAttribute, attrIndex: number) => (
                    <ListItem key={attrIndex} disableGutters>
                      <ListItemText 
                        primary={`${attr.name}: ${attr.dataType}`}
                        secondary={
                          <>
                            {attr.isRequired && <Chip label="Required" size="small" sx={{ mr: 0.5 }} />}
                            {attr.isPrimaryKey && <Chip label="Primary Key" size="small" color="primary" sx={{ mr: 0.5 }} />}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ml:2}}>
                  No attributes defined.
                </Typography>
              )}

              {entity.relationships && entity.relationships.length > 0 && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{mt:1}}>
                    Relationships:
                  </Typography>
                  <List dense disablePadding>
                    {/* Use the inline RelationshipDetail type or the structure directly */}
                    {entity.relationships.map((rel: RelationshipDetail, relIndex: number) => (
                      <ListItem key={relIndex} disableGutters>
                        <ListItemText 
                          primary={`${rel.type} to ${rel.toEntity}`}
                          secondary={rel.description || ""}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Paper>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{mb:2}}>
          No data entities have been defined or parsed.
        </Typography>
      )}

      {dataStorageNotes && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Data Storage Notes:
          </Typography>
          <Typography variant="body2" sx={{whiteSpace: "pre-wrap"}}>
            {dataStorageNotes}
          </Typography>
        </Box>
      )}
      
      {(!dataEntities || dataEntities.length === 0) && !dataStorageNotes && (!parsingIssues || parsingIssues.length === 0) && (
         <Typography variant="body2" color="text.secondary">
          The data model section is currently empty.
        </Typography>
      )}

    </Paper>
  );
};

export default DataModelViewer;


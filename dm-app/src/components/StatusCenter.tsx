// src/components/StatusCenter.tsx
import React, { useState } from "react";
import { Paper, Typography, Box, Button, Stack, IconButton, CircularProgress } from "@mui/material"; // Added CircularProgress
import { Print, CloudDownload, Visibility, Build } from "@mui/icons-material"; // Added Build for Scaffolding
import { CollectedProjectSpec, ChatMessage, SCRIPT_STAGES, ScriptStage, ProjectArtifact } from "./SimpleAIHelper";
import { ParsedProjectSpecification } from "../parser/types.js"; // Import for parsed spec type

const MILESTONES = [
  "Project Prompt Collected",
  "Stack/Dependencies Identified",
  "Main Files/Structure Created", // This could be where scaffolding artifact appears
  "Core Components Built",
  "API/Backend Connected",
  "Theming/Skins Applied",
  "Final Review/Export",
];

interface StatusCenterProps {
  collectedProjectSpec: CollectedProjectSpec;
  messages: ChatMessage[];
  currentScriptStage: ScriptStage; 
  projectArtifacts: ProjectArtifact[];
  parsedSpecForScaffolding: ParsedProjectSpecification | null; // New prop
  onScaffoldProject: () => Promise<void>; // New prop
  isScaffolding: boolean; // New prop
  scaffoldingError: string | null; // New prop
  scaffoldedProjectZipUrl: string | null; // New prop
}

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

const downloadFile = (filename: string, contentOrUrl: string, mimeType: string, isUrl: boolean = false) => {
  const link = document.createElement("a");
  if (isUrl) {
    link.href = contentOrUrl; // For URLs, this is the direct path to the file
  } else {
    const blob = new Blob([contentOrUrl], { type: mimeType });
    link.href = URL.createObjectURL(blob);
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (!isUrl) {
    URL.revokeObjectURL(link.href); 
  }
};

export const StatusCenter: React.FC<StatusCenterProps> = ({ 
  collectedProjectSpec,
  messages,
  currentScriptStage,
  projectArtifacts,
  parsedSpecForScaffolding,
  onScaffoldProject,
  isScaffolding,
  scaffoldingError,
  scaffoldedProjectZipUrl
}) => {
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<number | null>(null);

  const appName = collectedProjectSpec.appName || "DM_App_Project";
  const currentDate = formatDate(new Date());

  const handleDownloadSpecJson = () => {
    const parsedSpecArtifact = projectArtifacts.find(artifact => artifact.title === "Parsed Project Specification" && artifact.format === "json");
    let contentToDownload: string;
    let filename: string;

    if (parsedSpecArtifact && parsedSpecArtifact.content) {
      filename = `${appName}_Parsed_Specification_${currentDate}.json`;
      contentToDownload = typeof parsedSpecArtifact.content === "string" 
                            ? parsedSpecArtifact.content 
                            : JSON.stringify(parsedSpecArtifact.content, null, 2);
    } else {
      filename = `${appName}_Raw_Specification_${currentDate}.json`;
      contentToDownload = JSON.stringify(collectedProjectSpec, null, 2);
      console.warn("Parsed specification artifact not found, downloading raw specification.");
    }
    downloadFile(filename, contentToDownload, "application/json");
  };

  const handleDownloadLogMarkdown = () => {
    const filename = `${appName}_ProjectLog_${currentDate}.md`;
    let markdownContent = `# Project Log for ${appName}\n\nDate: ${currentDate}\n\n`;
    messages.forEach(msg => {
      const speaker = msg.role === "user" ? "USER" : "VIBRE";
      const timestamp = msg.timestamp ? msg.timestamp.toLocaleString() : "No timestamp";
      markdownContent += `**${speaker}** (${timestamp}):\n${msg.content}\n\n---\n\n`;
    });
    markdownContent += `## Final Specification Summary\n\n\
\
${JSON.stringify(collectedProjectSpec, null, 2)}\
\
`;
    downloadFile(filename, markdownContent, "text/markdown");
  };

  let currentMilestoneIndex = 0;
  if (currentScriptStage === SCRIPT_STAGES.BASIC_INFO_COMPLETE || currentScriptStage === SCRIPT_STAGES.CONVERSATION_ENDED) {
    currentMilestoneIndex = MILESTONES.indexOf("Project Prompt Collected");
  } else {
    const stageKey = Object.keys(SCRIPT_STAGES).find(key => SCRIPT_STAGES[key as keyof typeof SCRIPT_STAGES] === currentScriptStage);
    if (stageKey) {
        const stageIndex = Object.keys(SCRIPT_STAGES).indexOf(stageKey);
        if (stageIndex > 0 && stageIndex <= MILESTONES.length) {
            currentMilestoneIndex = stageIndex -1; 
        } else if (Object.keys(collectedProjectSpec).length > 0) {
            currentMilestoneIndex = 0; 
        }
    }
  }
  if (currentMilestoneIndex < 0) currentMilestoneIndex = 0;

  const handleMilestoneClick = (index: number) => {
    if (selectedMilestoneIndex === index) {
      setSelectedMilestoneIndex(null);
    } else {
      setSelectedMilestoneIndex(index);
    }
  };

  const renderArtifactContent = (artifact: ProjectArtifact) => {
    let contentToRender: string;
    if (typeof artifact.content === "string") {
      contentToRender = artifact.content;
    } else {
      contentToRender = JSON.stringify(artifact.content, null, 2);
    }
    if (artifact.format === "markdown" || artifact.format === "json" || artifact.type === "parsed_spec") {
      return <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "#C0C0C0", fontFamily: "monospace", fontSize: "0.85rem" }}>{contentToRender}</Typography>;
    }
    return <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "#C0C0C0", fontFamily: "monospace", fontSize: "0.85rem" }}>{contentToRender}</Typography>;
  };

  return (
    <Paper 
      elevation={8} 
      sx={{
        p: 3,
        borderRadius: "16px",
        background: "rgba(25, 28, 36, 0.95)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        color: "#E0E0E0",
        border: "1px solid #FF00B8",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        minHeight: 400,
        overflowY: "auto",
      }}
    >
      <Box sx={{ width: "100%", flexShrink: 0}}>
        <Typography 
          variant="h5"
          sx={{ 
            mb: 3, 
            color: "#FF00B8",
            letterSpacing: 1.2,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Project Progress
        </Typography>
        
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, width: "100%", mb: 3 }}>
          {MILESTONES.map((label, idx) => {
            let indicatorColor, textColor, fontWeight, cursorStyle, hoverBg;
            const isSelected = selectedMilestoneIndex === idx;

            if (idx < currentMilestoneIndex) {
              indicatorColor = "#00FFB3";
              textColor = "#00FFB3";
              fontWeight = 400;
            } else if (idx === currentMilestoneIndex) {
              indicatorColor = "#FF00B8";
              textColor = "#FF00B8";
              fontWeight = "bold";
            } else {
              indicatorColor = "#4A4E69";
              textColor = "#9A9EBF";
              fontWeight = 400;
            }
            cursorStyle = "pointer";
            hoverBg = isSelected ? "rgba(255, 0, 184, 0.2)" : "rgba(74, 78, 105, 0.3)";

            return (
              <Box 
                key={label} 
                onClick={() => handleMilestoneClick(idx)}
                sx={{
                  display: "flex", 
                  alignItems: "center", 
                  gap: 2, 
                  width: "100%", 
                  p: 0.75,
                  borderRadius: "8px",
                  cursor: cursorStyle,
                  backgroundColor: isSelected ? "rgba(255, 0, 184, 0.15)" : "transparent",
                  border: isSelected ? "1px solid #FF00B8" : "1px solid transparent",
                  transition: "background-color 0.2s ease-in-out, border-color 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: hoverBg,
                  }
                }}
              >
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor: indicatorColor,
                    border: `2px solid ${indicatorColor}`,
                    boxShadow: idx === currentMilestoneIndex ? `0 0 12px 2px ${indicatorColor}99` : "none",
                    transition: "all 0.35s",
                  }}
                />
                <Typography
                  variant="body1" 
                  sx={{
                    color: textColor,
                    fontWeight: fontWeight,
                    letterSpacing: 0.5,
                    transition: "color 0.35s",
                  }}
                >
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {selectedMilestoneIndex !== null && (
        <Box sx={{ mt: 1, mb: 3, p: 2, border: "1px solid #4A4E69", borderRadius: "12px", background: "rgba(35, 38, 46, 0.7)", flexShrink: 0 }}>
          <Typography variant="h6" sx={{ color: "#FF00B8", mb: 1.5, fontWeight: "bold" }}>
            {MILESTONES[selectedMilestoneIndex]}
          </Typography>
          
          {MILESTONES[selectedMilestoneIndex] === "Project Prompt Collected" && collectedProjectSpec && (
            <Box mb={2}>
              <Typography variant="subtitle1" sx={{ color: "#00E0FF", mb: 1}}>Project Specification Summary:</Typography>
              {Object.entries(collectedProjectSpec).map(([key, value]) => {
                if (!value) return null;
                const displayKey = key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
                return (
                  <Typography key={key} variant="body2" sx={{ mb: 0.75, color: "#C0C0C0"}}>
                    <strong style={{ color: "#E0E0E0" }}>{displayKey}:</strong> {String(value)}
                  </Typography>
                );
              })}
              {Object.keys(collectedProjectSpec).length === 0 && (
                 <Typography variant="body2" sx={{color: "#9A9EBF"}}>No specification details collected for this stage yet.</Typography>
              )}
            </Box>
          )}

          <Typography variant="subtitle1" sx={{ color: "#00E0FF", mb: 1, mt: MILESTONES[selectedMilestoneIndex] === "Project Prompt Collected" ? 2 : 0 }}>Stage Artifacts:</Typography>
          {projectArtifacts && projectArtifacts.filter(artifact => artifact.milestoneStage === MILESTONES[selectedMilestoneIndex!]).length > 0 ? (
            projectArtifacts
              .filter(artifact => artifact.milestoneStage === MILESTONES[selectedMilestoneIndex!])
              .map(artifact => (
                <Paper key={artifact.id} elevation={2} sx={{ p: 1.5, mb: 1.5, background: "rgba(45, 48, 56, 0.8)", borderRadius: "8px" }}>
                  <Typography variant="body1" sx={{ fontWeight: "bold", color: "#E0E0E0", mb: 0.5 }}>{artifact.title}</Typography>
                  {renderArtifactContent(artifact)}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <IconButton size="small" title="View Details" sx={{color: "#00E0FF"}} onClick={() => alert(`Viewing: ${artifact.title}`)}><Visibility fontSize="small" /></IconButton>
                    <IconButton size="small" title="Download Artifact" sx={{color: "#00E0FF"}} onClick={() => {
                      const contentToDownload = typeof artifact.content === "string" ? artifact.content : JSON.stringify(artifact.content, null, 2);
                      downloadFile(`${appName}_${artifact.title.replace(/\s+/g, ".")}_${currentDate}.${artifact.format || "txt"}`, contentToDownload, "text/plain");
                    }}><CloudDownload fontSize="small" /></IconButton>
                    <IconButton size="small" title="Print Artifact" sx={{color: "#00E0FF"}} onClick={() => alert("Print functionality to be implemented.")}><Print fontSize="small" /></IconButton>
                  </Stack>
                </Paper>
              ))
          ) : (
            <Typography variant="body2" sx={{color: "#9A9EBF"}}>
              No specific artifacts generated for this stage yet.
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid #4A4E69", width: "100%", flexShrink: 0 }}> 
        <Typography variant="subtitle1" sx={{ mb: 2, color: "#E0E0E0", textAlign: "center", fontWeight: "500" }}>
          Export & Actions
        </Typography>
        <Stack spacing={1.5} direction="column" alignItems="stretch">
          <Button 
            variant="outlined" 
            onClick={handleDownloadSpecJson}
            size="medium"
            startIcon={<CloudDownload />}
            sx={{ 
              color: "#00E0FF",
              borderColor: "#00E0FF",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "500",
              "&:hover": { 
                borderColor: "#00FFB3", 
                backgroundColor: "rgba(0, 224, 255, 0.1)",
                boxShadow: "0 0 8px 1px #00E0FF99"
              } 
            }}
          >
            Download Specification (JSON)
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleDownloadLogMarkdown}
            size="medium"
            startIcon={<CloudDownload />}
            sx={{ 
              color: "#00E0FF", 
              borderColor: "#00E0FF", 
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "500",
              "&:hover": { 
                borderColor: "#00FFB3", 
                backgroundColor: "rgba(0, 224, 255, 0.1)",
                boxShadow: "0 0 8px 1px #00E0FF99"
              } 
            }}
          >
            Download Conversation Log (MD)
          </Button>

          {/* Scaffolding Button and Status */}
          <Button 
            variant="contained" 
            onClick={onScaffoldProject}
            size="medium"
            startIcon={isScaffolding ? <CircularProgress size={20} color="inherit" /> : <Build />}
            disabled={!parsedSpecForScaffolding || isScaffolding}
            sx={{ 
              color: isScaffolding ? "#000" : "#FFFFFF",
              backgroundColor: "#FF00B8",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
              py: 1.2,
              "&:hover": { 
                backgroundColor: "#D4009B",
                boxShadow: "0 0 12px 2px #FF00B899"
              },
              "&.Mui-disabled": {
                backgroundColor: "#4A4E69",
                color: "#9A9EBF"
              }
            }}
          >
            {isScaffolding ? "Scaffolding Project..." : "Scaffold Project Code"}
          </Button>
          {scaffoldingError && (
            <Typography variant="caption" color="error" sx={{ textAlign: "center", mt: 1}}>
              Error: {scaffoldingError}
            </Typography>
          )}
          {scaffoldedProjectZipUrl && !isScaffolding && (
            <Button 
              variant="outlined"
              size="medium"
              startIcon={<CloudDownload />}
              onClick={() => downloadFile(`${appName}_ScaffoldedProject_${currentDate}.zip`, scaffoldedProjectZipUrl, "application/zip", true)}
              sx={{ 
                mt: 1,
                color: "#00FFB3", 
                borderColor: "#00FFB3", 
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "500",
                "&:hover": { 
                  borderColor: "#00E0FF", 
                  backgroundColor: "rgba(0, 255, 179, 0.1)",
                  boxShadow: "0 0 8px 1px #00FFB399"
     
(Content truncated due to size limit. Use line ranges to read in chunks)
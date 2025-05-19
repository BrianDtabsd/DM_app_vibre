// src/components/SimpleAIHelper.tsx
import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, Button, Paper, Typography, CircularProgress, Avatar } from "@mui/material";
import { askRemoteAI } from "../utils/remoteAI";
import { parseProjectSpecification } from "../parser/parserEngine"; // Import the parser
import { ParsedProjectSpecification } from "../parser/types"; // Import parser types

// --- Begin Vibre Integration --- 

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface CollectedProjectSpec {
  appName?: string;
  appPurpose?: string;
  targetAudience?: string;
  problemSolved?: string;
  technicalStack?: string[];
  platform?: string; // e.g., "web", "mobile", "desktop"
  hostingEnvironment?: string;
  databaseType?: string;
  apisToIntegrate?: Array<{ name: string; purpose: string }>;
  mainPages?: Array<{ name: string; purpose: string; keyComponents: string[]; userFlows?: string[] }>;
  overallLayoutDescription?: string;
  navigationStyle?: string; // e.g., "sidebar", "top-menu", "tabs"
  dataEntities?: Array<{
    name: string;
    description?: string;
    attributes: Array<{
      name: string;
      dataType: string; // e.g., "string", "number", "boolean", "date", "reference"
      isRequired?: boolean;
      isPrimaryKey?: boolean;
    }>;
    relationships?: Array<{ toEntity: string; type: string; description?: string }>;
  }>;
  dataStorageNotes?: string;
  overallStyle?: string; // e.g., "minimalist", "modern", "playful"
  colorPalette?: Array<{ name: string; hexCode: string }>;
  typography?: {
    primaryFont?: string;
    secondaryFont?: string;
  };
  inspirationAppsOrSites?: string[];
  brandingElements?: string; // e.g., logo description, mascot ideas
  // ... other fields will be added as we progress through the script
}

// Define ProjectArtifact interface (as per dm_app_progress_tracker_artifact_storage_plan.md)
export interface ProjectArtifact {
  id: string; // unique identifier
  type: "note" | "file_info" | "code_snippet" | "readme_section" | "setup_guide_link" | "generated_file_path" | "parsed_spec"; // Added parsed_spec type
  title: string;
  content: string | ParsedProjectSpecification; // Allow content to be ParsedProjectSpecification
  timestamp: Date;
  milestoneStage: string; // Link to a MILESTONES label
  format?: "markdown" | "javascript" | "json" | "text"; // Optional: for rendering/download
}

export const SCRIPT_STAGES = {
  GREETING: "GREETING",
  AWAITING_USER_AFTER_GREETING: "AWAITING_USER_AFTER_GREETING",
  ASK_APP_NAME: "ASK_APP_NAME",
  ASK_APP_PURPOSE: "ASK_APP_PURPOSE",
  ASK_TARGET_AUDIENCE: "ASK_TARGET_AUDIENCE",
  ASK_PROBLEM_SOLVED: "ASK_PROBLEM_SOLVED",
  BASIC_INFO_COMPLETE: "BASIC_INFO_COMPLETE",
  CONVERSATION_ENDED: "CONVERSATION_ENDED"
} as const;

export type ScriptStage = typeof SCRIPT_STAGES[keyof typeof SCRIPT_STAGES];

const vibreScriptedPrompts: Record<ScriptStage, string | ((spec: CollectedProjectSpec) => string)> = {
  [SCRIPT_STAGES.GREETING]: 
    "Hi there! I'm Vibre, your AI assistant for the DM App. I'm here to help you plan out your new application idea, step by step. My goal is to gather all the key decisions from you now, so we can set up a solid foundation for your project and minimize common pitfalls for new coders.\n\nTo help plan your app, I'll be asking you about a few key areas:\n*   **Basic App Information:** (like the app's name and purpose)\n*   **Technical Considerations:** (high-level thoughts on how it might be built)\n*   **Pages and Components:** (the different screens and elements in your app)\n*   **Data Model:** (the information your app will manage)\n*   **Design Preferences:** (your general ideas on look and feel)\n\nWe'll go through these step by step. And remember, you can review and change any of your answers at the end of our entire conversation.\n\nReady to start? (You can type 'yes' or anything to begin!)",
  [SCRIPT_STAGES.ASK_APP_NAME]: 
    "Great! First things first, what name are you thinking of for your application? Even a temporary name is fine for now. And remember, we can always revisit this later if a better idea comes up!",
  [SCRIPT_STAGES.ASK_APP_PURPOSE]: (spec) => 
    `Okay, '${spec.appName}' it is! Now, in 1-2 sentences, what is the main purpose of your app? What will it help users do? For example, a to-do list app helps users organize their tasks.`,
  [SCRIPT_STAGES.ASK_TARGET_AUDIENCE]: (spec) =>
    `That sounds useful! Who is the primary target audience for '${spec.appName}'? For instance, is it for students, busy professionals, hobbyists, or a general audience? Knowing this helps in tailoring the app.`,
  [SCRIPT_STAGES.ASK_PROBLEM_SOLVED]: (spec) =>    `Understood. And what specific problem does '${spec.appName}' solve for these ${spec.targetAudience || 'users'}? Thinking about the core problem helps define the app's value. For example, a recipe app might solve the problem of 'I don't know what to cook tonight.'`,
  [SCRIPT_STAGES.BASIC_INFO_COMPLETE]: (spec) =>
    `Excellent! We've covered the basic information for '${spec.appName}'. That gives us a great starting point! We can now move to the next section or you can ask me any questions. What would you like to do next?`,
  [SCRIPT_STAGES.CONVERSATION_ENDED]: "The structured interview part is complete. Feel free to ask any other questions!",
  [SCRIPT_STAGES.AWAITING_USER_AFTER_GREETING]: "" 
};

// --- End Vibre Integration --- 

interface SimpleAIHelperProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  collectedProjectSpec: CollectedProjectSpec;
  setCollectedProjectSpec: React.Dispatch<React.SetStateAction<CollectedProjectSpec>>;
  currentScriptStage: ScriptStage;
  setCurrentScriptStage: React.Dispatch<React.SetStateAction<ScriptStage>>;
  addProjectArtifact: (artifact: ProjectArtifact) => void; // Added prop for adding artifacts
}

export const SimpleAIHelper: React.FC<SimpleAIHelperProps> = ({
  messages,
  setMessages,
  collectedProjectSpec,
  setCollectedProjectSpec,
  currentScriptStage,
  setCurrentScriptStage,
  addProjectArtifact // Destructure the new prop
}) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (currentScriptStage === SCRIPT_STAGES.GREETING && messages.length === 0) {
      const initialPrompt = vibreScriptedPrompts[SCRIPT_STAGES.GREETING] as string;
      setMessages([{ role: "assistant", content: initialPrompt, timestamp: new Date() }]);
      setCurrentScriptStage(SCRIPT_STAGES.AWAITING_USER_AFTER_GREETING);
    }
  }, [currentScriptStage, messages, setMessages, setCurrentScriptStage]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userMessageContent = input.trim();
    const newUserMessage: ChatMessage = { role: "user", content: userMessageContent, timestamp: new Date() };
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    let nextStage = currentScriptStage;
    let specUpdate = { ...collectedProjectSpec };
    let vibreResponseText = "";

    switch (currentScriptStage) {
      case SCRIPT_STAGES.AWAITING_USER_AFTER_GREETING:
        vibreResponseText = vibreScriptedPrompts[SCRIPT_STAGES.ASK_APP_NAME] as string;
        nextStage = SCRIPT_STAGES.ASK_APP_NAME;
        break;
      case SCRIPT_STAGES.ASK_APP_NAME:
        specUpdate.appName = userMessageContent;
        vibreResponseText = (vibreScriptedPrompts[SCRIPT_STAGES.ASK_APP_PURPOSE] as (spec: CollectedProjectSpec) => string)(specUpdate);
        nextStage = SCRIPT_STAGES.ASK_APP_PURPOSE;
        break;
      case SCRIPT_STAGES.ASK_APP_PURPOSE:
        specUpdate.appPurpose = userMessageContent;
        vibreResponseText = (vibreScriptedPrompts[SCRIPT_STAGES.ASK_TARGET_AUDIENCE] as (spec: CollectedProjectSpec) => string)(specUpdate);
        nextStage = SCRIPT_STAGES.ASK_TARGET_AUDIENCE;
        break;
      case SCRIPT_STAGES.ASK_TARGET_AUDIENCE:
        specUpdate.targetAudience = userMessageContent;
        vibreResponseText = (vibreScriptedPrompts[SCRIPT_STAGES.ASK_PROBLEM_SOLVED] as (spec: CollectedProjectSpec) => string)(specUpdate);
        nextStage = SCRIPT_STAGES.ASK_PROBLEM_SOLVED;
        break;
      case SCRIPT_STAGES.ASK_PROBLEM_SOLVED:
        specUpdate.problemSolved = userMessageContent;
        vibreResponseText = (vibreScriptedPrompts[SCRIPT_STAGES.BASIC_INFO_COMPLETE] as (spec: CollectedProjectSpec) => string)(specUpdate);
        nextStage = SCRIPT_STAGES.BASIC_INFO_COMPLETE; 
        console.log("Collected Spec (Basic Info):", specUpdate);
        
        // Add summary artifact
        addProjectArtifact({
            id: `spec-summary-${Date.now()}`,
            type: "note",
            title: "Basic Project Info Summary (Raw)",
            content: `App Name: ${specUpdate.appName}\nPurpose: ${specUpdate.appPurpose}\nAudience: ${specUpdate.targetAudience}\nProblem Solved: ${specUpdate.problemSolved}`,
            timestamp: new Date(),
            milestoneStage: "Project Prompt Collected",
            format: "markdown"
        });

        // Call the parser and add its output as an artifact
        try {
          const parsedSpecification = parseProjectSpecification(specUpdate);
          console.log("Parsed Specification:", parsedSpecification);
          addProjectArtifact({
            id: `parsed-spec-${Date.now()}`,
            type: "parsed_spec", // New artifact type
            title: "Parsed Project Specification (Basic Info)",
            content: parsedSpecification, // Store the whole parsed object
            timestamp: new Date(),
            milestoneStage: "Project Prompt Collected", // Or a new milestone like "Specification Parsed"
            format: "json" // Indicate it's structured data
          });
        } catch (parseError) {
          console.error("Error parsing project specification:", parseError);
          addProjectArtifact({
            id: `parser-error-${Date.now()}`,
            type: "note",
            title: "Parser Error",
            content: `Failed to parse project specification: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
            timestamp: new Date(),
            milestoneStage: "Project Prompt Collected",
            format: "text"
          });
        }
        break;
      case SCRIPT_STAGES.BASIC_INFO_COMPLETE:
        try {
          const result = await askRemoteAI(userMessageContent);
          vibreResponseText = result;
        } catch (error) {
          console.error(error);
          vibreResponseText = "Sorry, I encountered an error trying to process that. Please try again.";
        }
        nextStage = SCRIPT_STAGES.CONVERSATION_ENDED;
        break;
      default:
        console.warn(`Unhandled script stage: ${currentScriptStage}. Sending to remote AI.`);
        try {
          const result = await askRemoteAI(userMessageContent);
          vibreResponseText = result;
        } catch (error) {
          console.error(error);
          vibreResponseText = "Sorry, I encountered an error. Please try again.";
        }
        nextStage = SCRIPT_STAGES.CONVERSATION_ENDED; 
        break;
    }

    setCollectedProjectSpec(specUpdate);
    setCurrentScriptStage(nextStage);

    if (vibreResponseText) {
      const newVibreMessage: ChatMessage = { role: "assistant", content: vibreResponseText, timestamp: new Date() };
      setMessages(prev => [...prev, newVibreMessage]);
    }
    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        mb: 2,
        background: "linear-gradient(135deg, #8A2BE2 0%, #A7A7A7 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        textFillColor: "transparent"
      }}>
        Vibre AI Planner
      </Typography>
      
      <Box sx={{ flex: 1, overflowY: "auto", mb: 2, px: 1, display: "flex", flexDirection: "column", gap: 1.5, overscrollBehaviorY: "contain" }}>
        {messages.map((msg, index) => (
          <Box 
            key={index} 
            sx={{ 
              display: "flex",
              alignItems: "flex-start",
              ml: msg.role === "user" ? "auto" : 0,
              mr: msg.role === "assistant" ? "auto" : 0,
              maxWidth: "85%"
            }}
          >
            {msg.role === "assistant" && (
              <Avatar sx={{ mr: 1, bgcolor: "#8A2BE2", width: 32, height: 32 }}>AI</Avatar>
            )}
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, backgroundColor: msg.role === "user" ? "#8A2BE2" : "#f5f5f5", color: msg.role === "user" ? "white" : "text.primary" }}>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{msg.content}</Typography>
            </Paper>
            {msg.role === "user" && (
              <Avatar sx={{ ml: 1, bgcolor: "#6A1B9A", width: 32, height: 32 }}>You</Avatar>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={currentScriptStage === SCRIPT_STAGES.AWAITING_USER_AFTER_GREETING ? "Type 'yes' or anything to start..." : "Your response..."}
          disabled={loading || currentScriptStage === SCRIPT_STAGES.GREETING}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          size="small"
          sx={{ mr: 1 }}
        />
        <Button 
          onClick={handleSubmit} 
          disabled={loading || currentScriptStage === SCRIPT_STAGES.GREETING}
          variant="contained"
          sx={{ backgroundColor: "#8A2BE2", "&:hover": { backgroundColor: "#6A1B9A" }, minWidth: "70px" }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Send"}
        </Button>
      </Box>
    </Paper>
  );
};
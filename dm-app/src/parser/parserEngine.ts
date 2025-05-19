// /home/ubuntu/DM_app_vibre_clone/src/parser/parserEngine.ts

import { CollectedProjectSpec } from "../components/SimpleAIHelper.js";
import {
  ParsedProjectSpecification,
  // ParsedBasicAppInfo, // Not directly used here, imported by basicAppInfoParser
  // ParsedTechnicalRequirements, // Not directly used here, imported by respective parsers
  // ParsedPagesAndLayout,
  // ParsedDataModel,
  // ParsedDesignPreferences,
} from "./types.js";
import { parseBasicAppInfo } from "./basicAppInfoParser.js";
import { parseTechnicalRequirements } from "./technicalRequirementsParser.js";
import { parsePagesAndLayout } from "./pagesAndLayoutParser.js";
import { parseDataModel } from "./dataModelParser.js";
import { parseDesignPreferences } from "./designPreferencesParser.js";

export function parseProjectSpecification(
  spec: CollectedProjectSpec
): ParsedProjectSpecification {
  const parsingTimestamp = new Date();
  let overallStatus: "complete" | "partial" | "errors" | "not_started" = "not_started";
  const errorSummary: string[] = [];
  let sectionsAttempted = 0;
  let sectionsSuccessfullyParsed = 0;

  const parsedSpec: ParsedProjectSpecification = {
    metadata: {
      parsingTimestamp,
      originalCollectedSpec: { ...spec },
    },
    basicInfo: null,
    technicalRequirements: null,
    pagesAndLayout: null,
    dataModel: null,
    designPreferences: null,
    overallParsingStatus: "not_started",
    parsingErrorSummary: [],
  };

  // --- 1. Parse Basic App Info ---
  if (spec.appName || spec.appPurpose || spec.targetAudience || spec.problemSolved) {
    sectionsAttempted++;
    const parsedBasicInfo = parseBasicAppInfo(spec);
    parsedSpec.basicInfo = parsedBasicInfo;
    if (parsedBasicInfo.parsingIssues && parsedBasicInfo.parsingIssues.length > 0) {
      errorSummary.push(...parsedBasicInfo.parsingIssues.map(issue => `Basic Info: ${issue}`));
    } else {
      sectionsSuccessfullyParsed++;
    }
  }

  // --- 2. Parse Technical Requirements ---
  // Check if any relevant fields exist for this section
  if (spec.technicalStack || spec.platform || spec.hostingEnvironment || spec.databaseType || spec.apisToIntegrate) {
    sectionsAttempted++;
    const parsedTechReqs = parseTechnicalRequirements(spec);
    parsedSpec.technicalRequirements = parsedTechReqs;
    if (parsedTechReqs.parsingIssues && parsedTechReqs.parsingIssues.length > 0) {
      errorSummary.push(...parsedTechReqs.parsingIssues.map(issue => `Technical Requirements: ${issue}`));
    } else {
      sectionsSuccessfullyParsed++;
    }
  }

  // --- 3. Parse Pages and Layout ---
  if (spec.mainPages || spec.overallLayoutDescription || spec.navigationStyle) {
    sectionsAttempted++;
    const parsedPages = parsePagesAndLayout(spec);
    parsedSpec.pagesAndLayout = parsedPages;
    if (parsedPages.parsingIssues && parsedPages.parsingIssues.length > 0) {
      errorSummary.push(...parsedPages.parsingIssues.map(issue => `Pages & Layout: ${issue}`));
    } else {
      sectionsSuccessfullyParsed++;
    }
  }

  // --- 4. Parse Data Model ---
  if (spec.dataEntities || spec.dataStorageNotes) {
    sectionsAttempted++;
    const parsedData = parseDataModel(spec);
    parsedSpec.dataModel = parsedData;
    if (parsedData.parsingIssues && parsedData.parsingIssues.length > 0) {
      errorSummary.push(...parsedData.parsingIssues.map(issue => `Data Model: ${issue}`));
    } else {
      sectionsSuccessfullyParsed++;
    }
  }

  // --- 5. Parse Design Preferences ---
  if (spec.overallStyle || spec.colorPalette || spec.typography || spec.inspirationAppsOrSites || spec.brandingElements) {
    sectionsAttempted++;
    const parsedDesign = parseDesignPreferences(spec);
    parsedSpec.designPreferences = parsedDesign;
    if (parsedDesign.parsingIssues && parsedDesign.parsingIssues.length > 0) {
      errorSummary.push(...parsedDesign.parsingIssues.map(issue => `Design Preferences: ${issue}`));
    } else {
      sectionsSuccessfullyParsed++;
    }
  }

  // --- Determine Overall Status ---
  if (errorSummary.length > 0) {
    overallStatus = "errors";
  } else if (sectionsAttempted === 0) {
    overallStatus = "not_started";
  } else if (sectionsSuccessfullyParsed === sectionsAttempted && sectionsAttempted > 0) {
    overallStatus = "complete";
  } else if (sectionsSuccessfullyParsed > 0 && sectionsSuccessfullyParsed < sectionsAttempted) {
    overallStatus = "partial"; // Some sections parsed, but not all attempted ones, and had errors
  } else if (sectionsSuccessfullyParsed > 0 ) {
    overallStatus = "partial"; // Some sections parsed successfully, others might not have been attempted or had errors
  } else if (sectionsAttempted > 0 && sectionsSuccessfullyParsed === 0 && errorSummary.length === 0) {
    // This case implies sections were attempted, but no data was actually parsed successfully (e.g. all optional fields were empty)
    // and no explicit parsing issues were raised. Could be considered 'partial' or a more specific status.
    // For now, let's stick to 'partial' if anything was attempted but not fully 'complete'.
    overallStatus = "partial"; 
  }
  
  // If no sections were attempted but there were errors (should not happen with current logic but as a safeguard)
  if (sectionsAttempted === 0 && errorSummary.length > 0) {
    overallStatus = "errors";
  }

  parsedSpec.overallParsingStatus = overallStatus;
  parsedSpec.parsingErrorSummary = errorSummary;

  return parsedSpec;
}


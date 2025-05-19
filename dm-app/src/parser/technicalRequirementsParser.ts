// /home/ubuntu/DM_app_vibre_clone/src/parser/technicalRequirementsParser.ts

import { CollectedProjectSpec } from "../components/SimpleAIHelper.js";
import { ParsedTechnicalRequirements } from "./types.js";

export function parseTechnicalRequirements(
  spec: Partial<Pick<CollectedProjectSpec, "technicalStack" | "platform" | "hostingEnvironment" | "databaseType" | "apisToIntegrate">> // Use relevant fields from CollectedProjectSpec
): ParsedTechnicalRequirements {
  const parsingIssues: string[] = [];
  const parsedTechReqs: ParsedTechnicalRequirements = {};

  // Example: Basic parsing logic - this will need to be much more sophisticated
  if (spec.technicalStack && spec.technicalStack.length > 0) {
    parsedTechReqs.techStack = spec.technicalStack;
  } else {
    // parsingIssues.push("Technical stack is not specified.");
  }

  if (spec.platform) {
    parsedTechReqs.platform = spec.platform;
  } else {
    // parsingIssues.push("Platform is not specified.");
  }
  
  if (spec.hostingEnvironment) {
    parsedTechReqs.hostingEnvironment = spec.hostingEnvironment;
  }

  if (spec.databaseType) {
    parsedTechReqs.databaseType = spec.databaseType;
  }

  if (spec.apisToIntegrate) {
    // This would need more complex parsing if apisToIntegrate is a string needing processing
    // For now, assuming it's already in a somewhat structured format or will be by Vibre
    parsedTechReqs.apisToIntegrate = spec.apisToIntegrate as any; // Cast as any for now, refine later
  }

  // Add more parsing logic for other fields as they are defined in CollectedProjectSpec

  if (parsingIssues.length > 0) {
    parsedTechReqs.parsingIssues = parsingIssues;
  }

  return parsedTechReqs;
}


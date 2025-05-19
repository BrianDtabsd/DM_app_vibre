// /home/ubuntu/DM_app_vibre_clone/src/parser/basicAppInfoParser.ts

import { CollectedProjectSpec } from "../components/SimpleAIHelper.js";
import { ParsedBasicAppInfo } from "./types.js";

export function parseBasicAppInfo(
  spec: Pick<CollectedProjectSpec, "appName" | "appPurpose" | "targetAudience" | "problemSolved">
): ParsedBasicAppInfo {
  const parsingIssues: string[] = [];

  if (!spec.appName) {
    parsingIssues.push("App name is missing.");
  }
  if (!spec.appPurpose) {
    parsingIssues.push("App purpose is missing.");
  }
  // Target audience and problemSolved are good to have but might be optional initially
  // depending on how strict we want the parsing to be.
  // For now, we'll just note if they are missing but not treat as hard errors for this basic parser.
  if (!spec.targetAudience) {
    // parsingIssues.push("Target audience is not specified.");
  }
  if (!spec.problemSolved) {
    // parsingIssues.push("Problem solved by the app is not specified.");
  }

  const parsedInfo: ParsedBasicAppInfo = {
    name: spec.appName || null,
    purposeStatement: spec.appPurpose || null,
    primaryAudience: spec.targetAudience || null,
    problemToSolve: spec.problemSolved || null,
  };

  if (parsingIssues.length > 0) {
    parsedInfo.parsingIssues = parsingIssues;
  }

  return parsedInfo;
}


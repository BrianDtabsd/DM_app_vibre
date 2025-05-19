// /home/ubuntu/DM_app_vibre_clone/src/parser/designPreferencesParser.ts

import { CollectedProjectSpec } from "../components/SimpleAIHelper.js";
import { ParsedDesignPreferences } from "./types.js";

export function parseDesignPreferences(
  spec: Partial<Pick<CollectedProjectSpec, "overallStyle" | "colorPalette" | "typography" | "inspirationAppsOrSites" | "brandingElements">> // Use relevant fields
): ParsedDesignPreferences {
  const parsingIssues: string[] = [];
  const parsedDesignPrefs: ParsedDesignPreferences = {};

  // Placeholder for parsing logic
  // Example:
  // if (spec.overallStyle) {
  //   parsedDesignPrefs.overallStyle = spec.overallStyle;
  // }
  // if (spec.colorPalette) {
  //   parsedDesignPrefs.colorPalette = spec.colorPalette.map(color => ({ ...color }));
  // }
  // if (spec.typography) {
  //   parsedDesignPrefs.typography = { ...spec.typography };
  // }
  // if (spec.inspirationAppsOrSites) {
  //   parsedDesignPrefs.inspirationAppsOrSites = spec.inspirationAppsOrSites;
  // }
  // if (spec.brandingElements) {
  //   parsedDesignPrefs.brandingElements = spec.brandingElements;
  // }

  if (parsingIssues.length > 0) {
    parsedDesignPrefs.parsingIssues = parsingIssues;
  }

  return parsedDesignPrefs;
}


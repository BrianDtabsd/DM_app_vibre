// /home/ubuntu/DM_app_vibre_clone/src/scaffolder/test_scaffolder.ts
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url"; // Added for ES module __dirname equivalent
import { scaffoldProject } from "./scaffolderEngine.js";
import { ScaffolderOptions } from "./types.js";
import { ParsedProjectSpecification, CollectedProjectSpec, PageDetail } from "../parser/types.js";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Test Data ---
const commonBasicInfo = {
  purposeStatement: "To demonstrate scaffolding enhancements",
  primaryAudience: "Developers",
  problemToSolve: "Manual project setup with pages and routing",
};

const commonTechnicalRequirements = {
  techStack: ["React", "Vite", "TypeScript"],
  platform: "web",
};

const testSpecNoPages: ParsedProjectSpecification = {
  metadata: {
    parsingTimestamp: new Date(),
    originalCollectedSpec: { appName: "AppNoPages" } as CollectedProjectSpec,
  },
  basicInfo: { name: "AppNoPages", ...commonBasicInfo },
  technicalRequirements: commonTechnicalRequirements,
  pagesAndLayout: null, // No pages
  dataModel: null,
  designPreferences: null,
  overallParsingStatus: "partial",
};

const testSpecSinglePage: ParsedProjectSpecification = {
  metadata: {
    parsingTimestamp: new Date(),
    originalCollectedSpec: { appName: "AppSinglePage" } as CollectedProjectSpec,
  },
  basicInfo: { name: "AppSinglePage", ...commonBasicInfo },
  technicalRequirements: commonTechnicalRequirements,
  pagesAndLayout: {
    mainPages: [
      { name: "Dashboard", purpose: "Main dashboard", keyComponents: ["SummaryWidget", "ChartComponent"] },
    ],
    // layoutStyle: "sidebar",
  },
  dataModel: null,
  designPreferences: null,
  overallParsingStatus: "partial",
};

const testSpecMultiPage: ParsedProjectSpecification = {
  metadata: {
    parsingTimestamp: new Date(),
    originalCollectedSpec: { appName: "AppMultiPage" } as CollectedProjectSpec,
  },
  basicInfo: { name: "AppMultiPage", ...commonBasicInfo },
  technicalRequirements: commonTechnicalRequirements,
  pagesAndLayout: {
    mainPages: [
      { name: "Home", purpose: "Landing page", keyComponents: ["HeroSection", "CallToAction"] },
      { name: "About Us", purpose: "Company information", keyComponents: ["TeamBio", "CompanyHistory"] },
      { name: "Contact", purpose: "Contact form and details", keyComponents: ["ContactForm", "MapEmbed"] },
    ],
    // layoutStyle: "navbar-footer",
  },
  dataModel: null,
  designPreferences: null,
  overallParsingStatus: "partial",
};

// --- Test Runner ---
async function runScaffoldingTest(spec: ParsedProjectSpecification, testName: string) {
  const projectName = spec.basicInfo?.name || `default-scaffold-${testName}`;
  const projectPath = path.resolve(`/home/ubuntu/test-scaffolded-${projectName.toLowerCase()}`);

  console.log(`\n--- Starting Test: ${testName} ---`);
  console.log(`Attempting to scaffold project at: ${projectPath}`);

  if (fs.existsSync(projectPath)) {
    console.log(`Cleaning up existing directory: ${projectPath}`);
    await fs.promises.rm(projectPath, { recursive: true, force: true });
  }

  const options: ScaffolderOptions = {
    projectName,
    projectPath,
    targetStack: "react-vite-ts",
    parsedSpec: spec,
  };

  const result = scaffoldProject(options);
  console.log("\n--- Scaffolding Result ---");
  console.log(JSON.stringify(result, null, 2));

  if (result.success && result.projectPath) {
    console.log(`\nProject ${projectName} scaffolded successfully at ${result.projectPath}`);
    console.log("Please check the directory for the generated files.");
    // Add specific file content checks here if needed for validation
    if (spec.pagesAndLayout?.mainPages && spec.pagesAndLayout.mainPages.length > 1) {
        const packageJsonPath = path.join(result.projectPath, "package.json");
        const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8");
        if (!packageJsonContent.includes("react-router-dom")) {
            console.error("TEST FAILED: react-router-dom not found in package.json for multi-page app.");
        }
        const appTsxPath = path.join(result.projectPath, "src/App.tsx");
        const appTsxContent = fs.readFileSync(appTsxPath, "utf-8");
        if (!appTsxContent.includes("react-router-dom")) {
            console.error("TEST FAILED: react-router-dom imports not found in App.tsx for multi-page app.");
        }
    }

  } else {
    console.error("\nScaffolding failed.");
  }
  console.log(`--- Finished Test: ${testName} ---\n`);
}

async function runAllTests() {
  await runScaffoldingTest(testSpecNoPages, "NoPages");
  await runScaffoldingTest(testSpecSinglePage, "SinglePage");
  await runScaffoldingTest(testSpecMultiPage, "MultiPage");
}

runAllTests().catch(error => {
  console.error("Error during scaffolding test execution:", error);
});


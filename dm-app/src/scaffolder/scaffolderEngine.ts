// /home/ubuntu/DM_app_vibre_clone/src/scaffolder/scaffolderEngine.ts

import * as fs from 'fs';
import * as path from 'path';
import { ScaffolderOptions, ScaffoldingResult, ScaffoldFile, ScaffoldDirectory } from "./types.js";
import { ParsedProjectSpecification, PageDetail } from "../parser/types.js"; // Ensure PageDetail is imported

// --- Helper Functions ---

/**
 * Ensures a directory exists. If it doesn't, it's created.
 * @param dirPath Absolute path to the directory.
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Writes a file to the specified path.
 * @param projectRootPath Absolute path to the project root.
 * @param file The ScaffoldFile object defining the file to write.
 */
function writeFile(projectRootPath: string, file: ScaffoldFile): void {
  const filePath = path.join(projectRootPath, file.path);
  const fileContent = typeof file.content === 'function' ? file.content() : file.content;
  ensureDirectoryExists(path.dirname(filePath)); // Ensure parent directory exists
  fs.writeFileSync(filePath, fileContent);
  console.log(`Created file: ${filePath}`);
}

/**
 * Normalizes a name to be suitable for file names and component names (PascalCase).
 * @param name The original name string.
 */
function normalizeName(name: string): string {
  if (!name) return 'UnnamedComponent';
  return name
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}


// --- Core Scaffolding Logic ---

/**
 * Main function to scaffold a new project based on the provided options.
 * @param options The ScaffolderOptions defining the project to scaffold.
 * @returns A ScaffoldingResult indicating success or failure.
 */
export function scaffoldProject(options: ScaffolderOptions): ScaffoldingResult {
  const { projectPath, projectName, targetStack, parsedSpec } = options;
  const errors: string[] = [];

  console.log(`Starting scaffolding for project: ${projectName} at ${projectPath}`);

  try {
    // 1. Create the root project directory
    ensureDirectoryExists(projectPath);

    // 2. Based on targetStack, call specific scaffolding logic
    if (targetStack === "react-vite-ts") {
      scaffoldReactViteTs(projectPath, parsedSpec);
    } else {
      errors.push(`Unsupported target stack: ${targetStack}`);
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `Scaffolding encountered errors for project ${projectName}.`,
        errors,
      };
    }

    return {
      success: true,
      projectPath,
      message: `Project ${projectName} scaffolded successfully at ${projectPath}`,
    };

  } catch (error: any) {
    console.error(`Critical error during scaffolding: ${error.message}`, error);
    return {
      success: false,
      message: `A critical error occurred during scaffolding: ${error.message}`,
      errors: [error.message],
    };
  }
}

/**
 * Scaffolds a React + Vite + TypeScript project.
 * @param projectRootPath Absolute path to the project root.
 * @param spec The parsed project specification.
 */
function scaffoldReactViteTs(projectRootPath: string, spec: ParsedProjectSpecification): void {
  const appName = spec.basicInfo?.name || "my-vite-app";
  const mainPages = spec.pagesAndLayout?.mainPages || [];
  const needsRouting = mainPages.length > 1;

  // Define base directories to create
  const directories: ScaffoldDirectory[] = [
    { path: "public" },
    { path: "src" },
    { path: "src/assets" },
    { path: "src/components" },
  ];

  if (mainPages.length > 0) {
    directories.push({ path: "src/pages" });
  }

  directories.forEach(dir => {
    ensureDirectoryExists(path.join(projectRootPath, dir.path));
  });

  // Define base files to create
  const files: ScaffoldFile[] = [
    // package.json
    {
      path: "package.json",
      content: () => {
        const basePackageJson = {
          name: appName.toLowerCase().replace(/\s+/g, '-'),
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: {
            dev: "vite",
            build: "tsc && vite build",
            lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
            preview: "vite preview"
          },
          dependencies: {
            react: "^18.2.0",
            "react-dom": "^18.2.0"
          },
          devDependencies: {
            "@types/react": "^18.2.15",
            "@types/react-dom": "^18.2.7",
            "@typescript-eslint/eslint-plugin": "^6.0.0",
            "@typescript-eslint/parser": "^6.0.0",
            "@vitejs/plugin-react": "^4.0.3",
            eslint: "^8.45.0",
            "eslint-plugin-react-hooks": "^4.6.0",
            "eslint-plugin-react-refresh": "^0.4.3",
            typescript: "^5.0.2",
            vite: "^4.4.5"
          }
        };
        if (needsRouting) {
          (basePackageJson.dependencies as any)["react-router-dom"] = "^6.22.0";
        }
        return JSON.stringify(basePackageJson, null, 2);
      }
    },
    // vite.config.ts
    {
      path: "vite.config.ts",
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
`
    },
    // tsconfig.json
    {
      path: "tsconfig.json",
      content: () => JSON.stringify({
        compilerOptions: {
          target: "ES2020",
          useDefineForClassFields: true,
          lib: ["ES2020", "DOM", "DOM.Iterable"],
          module: "ESNext",
          skipLibCheck: true,
          moduleResolution: "bundler",
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx",
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ["src"],
        references: [{ path: "./tsconfig.node.json" }]
      }, null, 2)
    },
    // tsconfig.node.json
    {
        path: "tsconfig.node.json",
        content: () => JSON.stringify({
            compilerOptions: {
              composite: true,
              skipLibCheck: true,
              module: "ESNext",
              moduleResolution: "bundler",
              allowSyntheticDefaultImports: true
            },
            include: ["vite.config.ts"]
          }, null, 2)
    },
    // .eslintrc.cjs
    {
        path: ".eslintrc.cjs",
        content: `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}`
    },
    // .gitignore
    {
      path: ".gitignore",
      content: `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# parcel-bundler cache files
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# Docusaurus build output
.docusaurus

# SvelteKit build output
.svelte-kit

# Remix build output
.cache
build
public/build

# Vite build output
dist
dist-ssr

# Temp files from playwright
test-results/
playwright-report/

# IDE files
.idea
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
*.sublime-workspace

# macOS files
.DS_Store
`
    },
    // public/index.html
    {
      path: "public/index.html",
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName} (Vite + React + TS)</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
    },
    // public/vite.svg
    {
        path: "public/vite.svg",
        content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">V</text></svg>`
    },
    // src/main.tsx
    {
      path: "src/main.tsx",
      content: () => {
        let mainTsxContent = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
`;
        if (needsRouting) {
          mainTsxContent += `import { BrowserRouter } from 'react-router-dom';
`;
        }
        mainTsxContent += `
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
`;
        if (needsRouting) {
          mainTsxContent += `    <BrowserRouter>
      <App />
    </BrowserRouter>
`;
        } else {
          mainTsxContent += `    <App />
`;
        }
        mainTsxContent += `  </React.StrictMode>,
)
`;
        return mainTsxContent;
      }
    },
    // src/App.tsx
    {
      path: "src/App.tsx",
      content: () => {
        const pageImports = mainPages.map(page => {
          const pageComponentName = normalizeName(page.name);
          return `import ${pageComponentName} from './pages/${pageComponentName}';`;
        }).join('\n');

        const navLinks = mainPages.map(page => {
          const pageComponentName = normalizeName(page.name);
          const path = pageComponentName === 'Home' ? '/' : `/${pageComponentName.toLowerCase()}`;
          return `            <li><Link to="${path}">${page.name}</Link></li>`;
        }).join('\n');

        const routes = mainPages.map(page => {
          const pageComponentName = normalizeName(page.name);
          const path = pageComponentName === 'Home' ? '/' : `/${pageComponentName.toLowerCase()}`;
          return `            <Route path="${path}" element={<${pageComponentName} />} />`;
        }).join('\n');

        if (needsRouting) {
          return `import { Routes, Route, Link } from 'react-router-dom';
${pageImports}
import './App.css';

function App() {
  return (
    <>
      <nav>
        <ul>
${navLinks}
        </ul>
      </nav>
      <hr />
      <Routes>
${routes}
      </Routes>
    </>
  );
}

export default App;
`;
        } else if (mainPages.length === 1) {
          // Single page app, render the single page directly or a simplified App
          const singlePageName = normalizeName(mainPages[0].name);
          return `import ${singlePageName} from './pages/${singlePageName}';
import './App.css';

function App() {
  return (
    <${singlePageName} />
  );
}

export default App;
`;
        } else {
          // Default App.tsx content if no pages or no routing
          return `import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React: ${appName}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App;
`;
        }
      }
    },
    // src/index.css
    {
        path: "src/index.css",
        content: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`
    },
    // src/App.css
    {
        path: "src/App.css",
        content: `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}
`
    },
    // src/vite-env.d.ts
    {
      path: "src/vite-env.d.ts",
      content: `/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
`
    },
    // src/assets/react.svg
    {
        path: "src/assets/react.svg",
        content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11.5 -10.23174 23 20.46348">
  <title>React Logo</title>
  <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
  <g stroke="#61DAFB" stroke-width="1" fill="none">
    <ellipse rx="11" ry="4.2"/>
    <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
    <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
  </g>
</svg>`
    }
  ];

  // Generate page and component files based on spec
  const allKeyComponents = new Set<string>();

  if (mainPages.length > 0) {
    const pagesDir = path.join(p
(Content truncated due to size limit. Use line ranges to read in chunks)
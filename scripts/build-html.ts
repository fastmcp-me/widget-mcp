#!/usr/bin/env tsx

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "fs";
import { join, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";

// Get script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

function escapeString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function findHtmlFiles(dir: string): string[] {
  const files: string[] = [];

  try {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Recursively search subdirectories
        files.push(...findHtmlFiles(fullPath));
      } else if (stat.isFile() && extname(entry) === ".html") {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error);
  }

  return files;
}

function generateTypeScriptExports(): void {
  console.log("🔍 Searching for HTML files...");

  // Find all HTML files in the project (excluding node_modules)
  const htmlFiles = findHtmlFiles(join(projectRoot, "html"));

  if (htmlFiles.length === 0) {
    console.log("ℹ️  No HTML files found");
    return;
  }

  console.log(`📄 Found ${htmlFiles.length} HTML file(s):`);
  htmlFiles.forEach((file) => console.log(`  - ${file}`));

  // Generate TypeScript exports
  const exports: string[] = [];
  const typeExports: string[] = [];

  htmlFiles.forEach((filePath) => {
    const content = readFileSync(filePath, "utf-8");
    const relativePath = filePath.replace(projectRoot + "/", "");
    const fileName = basename(filePath, ".html");

    // Create a valid TypeScript variable name
    const varName = fileName.replace(/[^a-zA-Z0-9]/g, "_").replace(/^(\d)/, "_$1"); // Ensure it doesn't start with a number

    const capitalizedVarName = varName.charAt(0).toUpperCase() + varName.slice(1);

    exports.push(`// Generated from ${relativePath}`);
    exports.push(`export const ${varName}Html = \`${escapeString(content)}\`;`);
    exports.push("");

    typeExports.push(`  ${varName}Html: string;`);
  });

  // Create the main export file
  const tsContent = `// Auto-generated file - DO NOT EDIT MANUALLY
// Generated on ${new Date().toISOString()}
// Run 'npm run build:html' to regenerate

${exports.join("\n")}

// Type-safe object with all HTML content
export const htmlContent = {
${htmlFiles
  .map((filePath) => {
    const fileName = basename(filePath, ".html");
    const varName = fileName.replace(/[^a-zA-Z0-9]/g, "_").replace(/^(\d)/, "_$1");
    return `  ${varName}Html,`;
  })
  .join("\n")}
} as const;

// Type definition
export type HtmlContent = {
${typeExports.join("\n")}
};
`;

  const outputPath = join(projectRoot, "generated", "html.ts");

  // Create directory if it doesn't exist
  const outputDir = dirname(outputPath);
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }

  writeFileSync(outputPath, tsContent);

  console.log(`✅ Generated TypeScript exports at: ${outputPath}`);
  console.log(`📦 You can now import with: import { timerHtml } from './generated/html.js';`);
}

// Run the script
generateTypeScriptExports();

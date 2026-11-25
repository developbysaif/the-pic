import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const srcDir = path.resolve('src');

function getFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getFiles(fullPath, files);
    } else if (
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.d.ts')
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getFiles(srcDir);
console.log(`Found ${allFiles.length} TypeScript files to convert.`);

let convertedCount = 0;

for (const filePath of allFiles) {
  // If it's src/types/index.ts, we can just delete it
  if (filePath.endsWith(path.join('src', 'types', 'index.ts'))) {
    fs.unlinkSync(filePath);
    console.log(`Deleted types file: ${filePath}`);
    continue;
  }

  const isTsx = filePath.endsWith('.tsx');
  const newExt = isTsx ? '.jsx' : '.js';
  const newPath = filePath.slice(0, -path.extname(filePath).length) + newExt;

  const content = fs.readFileSync(filePath, 'utf8');

  // Transpile TypeScript to JavaScript while preserving JSX
  const transpileResult = ts.transpileModule(content, {
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      removeComments: false,
    },
    fileName: path.basename(filePath),
  });

  let jsCode = transpileResult.outputText;

  // Clean up any remaining empty imports or unused type imports from @/types
  jsCode = jsCode
    .replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\s*\n?/g, '')
    .replace(/import\s+type\s+[^;]+;\s*\n?/g, '')
    .replace(/import\s*\{[^}]*\}\s*from\s*['"]@\/types['"];?\s*\n?/g, '')
    .replace(/import\s+[^;]*from\s*['"]@\/types['"];?\s*\n?/g, '');

  fs.writeFileSync(newPath, jsCode, 'utf8');
  fs.unlinkSync(filePath);
  convertedCount++;
  console.log(`Converted: ${path.relative(srcDir, filePath)} -> ${path.relative(srcDir, newPath)}`);
}

// Clean up types directory if empty
const typesDir = path.join(srcDir, 'types');
if (fs.existsSync(typesDir) && fs.readdirSync(typesDir).length === 0) {
  fs.rmdirSync(typesDir);
  console.log('Removed empty src/types directory.');
}

console.log(`Successfully converted ${convertedCount} files to JavaScript/JSX.`);

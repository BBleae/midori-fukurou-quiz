import * as fs from 'fs';
import * as path from 'path';

function isLeafDirectory(dirPath: string): boolean {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return !entries.some(entry => entry.isDirectory());
}

function hasJsonFiles(dirPath: string): boolean {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries.some(entry => 
    entry.isFile() && 
    entry.name.endsWith('.json') && 
    entry.name !== 'all.json'
  );
}

function getJsonFiles(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter(entry => 
      entry.isFile() && 
      entry.name.endsWith('.json') && 
      entry.name !== 'all.json'
    )
    .map(entry => path.join(dirPath, entry.name));
}

function mergeJsonFiles(dirPath: string): void {
  const jsonFiles = getJsonFiles(dirPath);
  
  if (jsonFiles.length === 0) {
    return;
  }

  const mergedData: any[] = [];
  
  for (const filePath of jsonFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);
      
      if (Array.isArray(jsonData)) {
        mergedData.push(...jsonData);
      } else {
        mergedData.push(jsonData);
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
  
  if (mergedData.length > 0) {
    const allJsonPath = path.join(dirPath, 'all.json');
    fs.writeFileSync(allJsonPath, JSON.stringify(mergedData, null, 2), 'utf-8');
    console.log(`Created ${allJsonPath} with ${mergedData.length} items from ${jsonFiles.length} files`);
  }
}

function processDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  // Process subdirectories first (depth-first)
  for (const entry of entries) {
    if (entry.isDirectory() && 
        entry.name !== 'node_modules' && 
        entry.name !== '.git' && 
        !entry.name.startsWith('.')) {
      const subDirPath = path.join(dirPath, entry.name);
      processDirectory(subDirPath);
    }
  }
  
  // Check if current directory is a leaf directory with JSON files
  if (isLeafDirectory(dirPath) && hasJsonFiles(dirPath)) {
    mergeJsonFiles(dirPath);
  }
}

function generateAllJsonFiles(): void {
  const workspacePath = process.env.WORKSPACE;
  
  if (!workspacePath) {
    console.error('WORKSPACE environment variable is not set');
    process.exit(1);
  }
  
  if (!fs.existsSync(workspacePath)) {
    console.error(`Workspace path does not exist: ${workspacePath}`);
    process.exit(1);
  }
  
  const quizPath = path.join(workspacePath, 'quiz');
  
  if (!fs.existsSync(quizPath)) {
    console.error(`Quiz directory does not exist: ${quizPath}`);
    process.exit(1);
  }
  
  console.log(`Processing directories in: ${quizPath}`);
  processDirectory(quizPath);
  console.log('Finished processing all directories');
}

generateAllJsonFiles();
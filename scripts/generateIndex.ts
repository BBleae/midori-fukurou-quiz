import * as fs from 'fs';
import * as path from 'path';

interface QuestionItem {
  title: string;
  analysis?: string;
  rightAnswer: string;
  options: string[];
}

interface QuestionSection {
  title: string;
  items: QuestionItem[];
}

interface QuizIndex {
  filePath: string;
  sectionIndex: number;
  itemIndex: number;
  question: string;
}

function getAllJsonFiles(dir: string): string[] {
  const files: string[] = [];

  function traverseDirectory(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json') &&
        entry.name !== 'index.json' &&
        entry.name !== 'tsconfig.json' &&
        entry.name !== 'package.json' &&
        entry.name !== 'all.json' &&
        entry.name !== 'package-lock.json') {
        files.push(fullPath);
      }
    }
  }

  traverseDirectory(dir);
  return files;
}

function generateIndex(): void {
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

  const jsonFiles = getAllJsonFiles(quizPath);
  const index: QuizIndex[] = [];

  for (const filePath of jsonFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const quizData: QuestionSection[] = JSON.parse(fileContent);

      for (let sectionIndex = 0; sectionIndex < quizData.length; sectionIndex++) {
        const section = quizData[sectionIndex];
        if (!section) {
          continue
        }
        if (section.items && Array.isArray(section.items)) {
          for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
            const item = section.items[itemIndex];
            if (!item) {
              continue
            }
            index.push({
              filePath: path.relative(quizPath, filePath),
              sectionIndex,
              itemIndex,
              question: item.title
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }

  const indexPath = path.join(workspacePath, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');

  console.log(`Generated index with ${index.length} questions from ${jsonFiles.length} files`);
  console.log(`Index saved to: ${indexPath}`);
}

generateIndex();
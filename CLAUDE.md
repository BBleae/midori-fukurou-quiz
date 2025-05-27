# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a quiz database for Midori Fukurou Mod (緑フクロウMod) containing many quiz like JLPT N2 practice questions from 2014-2024. The repository uses Bun as the runtime and TypeScript for scripting.

## Common Commands

```bash
# Generate quiz index from all JSON files in quiz/ directory
WORKSPACE=/path/to/workspace bun scripts/generateIndex.ts

# Run with current directory as workspace
WORKSPACE=$PWD bun scripts/generateIndex.ts
```

## Architecture

### Quiz Data Structure
- **Location**: `quiz/japanese/jlpt/n2/*.json`
- **Format**: Array of question sections, each containing:
  - `title`: Section description (e.g., "問題1 _____の言葉の読み方...")
  - `items`: Array of individual questions with:
    - `title`: Question text with `<u>underlined</u>` target words
    - `options`: Array of 4 answer choices
    - `rightAnswer`: Correct answer index (string: "0", "1", "2", "3")
    - `analysis`: Chinese translation and explanation

### Index Generation System
- **Script**: `scripts/generateIndex.ts`
- **Output**: `index.json` - searchable index of all questions
- **Index Structure**: Each entry contains:
  - `filePath`: Relative path from quiz/ directory
  - `sectionIndex`: Section number within file
  - `itemIndex`: Question number within section
  - `question`: Question text for search

### Automated Workflow
- GitHub Action (`.github/workflows/generate-index.yml`) automatically regenerates index when:
  - JSON files in `quiz/` are modified
  - `generateIndex.ts` script is updated
- Uses Bun runtime in CI environment

## File Filtering Rules

The index generator excludes these JSON files:
- `index.json` (generated output)
- `tsconfig.json`, `package.json`, `package-lock.json` (config files)

## TypeScript Interfaces

Key types defined in `generateIndex.ts`:
- `QuestionItem`: Individual question structure
- `QuestionSection`: Section containing multiple questions  
- `QuizIndex`: Index entry for search/navigation
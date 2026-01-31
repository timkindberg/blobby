#!/usr/bin/env node
// Quick script to export questions from session DDCK
import { execSync } from 'child_process';
import fs from 'fs';

const sessionId = 'jh7a2f3erbyb7vkd4s9n66y2sx807h5g';

console.log('Fetching questions from production...');
const output = execSync(
  `npx convex run questions:listBySession '{"sessionId":"${sessionId}"}' --prod`,
  { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
);

// Parse the output (skip npm warnings)
const lines = output.split('\n').filter(line => !line.includes('npm warn'));
const jsonStr = lines.join('\n').trim();
const questions = JSON.parse(jsonStr);

// Transform to clean format
const cleaned = questions.map(q => ({
  text: q.text,
  options: q.options.map(o => o.text),
  correctIndex: q.correctOptionIndex,
  timeLimit: q.timeLimit
}));

// Save to file
const filename = 'ddck-questions-backup.json';
fs.writeFileSync(filename, JSON.stringify(cleaned, null, 2));

console.log(`✅ Saved ${cleaned.length} questions to ${filename}`);

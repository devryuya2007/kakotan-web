#!/usr/bin/env node
// Simple frequency analysis over extracted text files.
// Reads all .txt under data/extracted and outputs CSV to stdout.

import { promises as fs } from 'fs';
import path from 'path';

const INPUT_DIR = path.resolve('data/extracted');

function tokenize(text) {
  // Keep only A–Z letters and apostrophes inside words, collapse others to space
  return text
    .toLowerCase()
    .replace(/[^a-z'\s]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(w => /[a-z]/.test(w));
}

async function readAllTxtFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries.filter(e => e.isFile() && e.name.endsWith('.txt'));
  const contents = await Promise.all(
    files.map(f => fs.readFile(path.join(dir, f.name), 'utf8'))
  );
  return contents.join('\n');
}

function count(tokens) {
  const map = new Map();
  for (const t of tokens) {
    map.set(t, (map.get(t) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

async function main() {
  try {
    await fs.access(INPUT_DIR);
  } catch {
    console.error(`Missing input dir: ${INPUT_DIR}`);
    console.error('Create it and put extracted .txt files inside.');
    process.exit(1);
  }

  const text = await readAllTxtFiles(INPUT_DIR);
  const tokens = tokenize(text);
  const freqs = count(tokens);

  // CSV header
  console.log('word,count');
  for (const [word, cnt] of freqs) {
    console.log(`${word},${cnt}`);
  }
}

main();


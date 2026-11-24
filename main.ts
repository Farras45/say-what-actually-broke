// Say What Actually Broke — make.fun entry.
//
// Writes one single-line error message to $MAKEFUN_OUTPUT_DIR/entry.txt
// (default /output). The line is a fixed, deterministic string: no clock
// reads, no randomness, no network access, no environment secrets.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: one line that says what actually broke, in plain words a
// veteran SRE would respect — the failure, the cause, and what to do next.
const ENTRY =
  "Error: the database is down. A developer deployed a migration on Friday at 4:47 PM and it is still running. Please try again on Monday.";

const MIN_LENGTH = 1;
const MAX_LENGTH = 200;

// Count characters the way a reader counts them: by code point, so an
// astral character is one character, not two UTF-16 code units.
function charCount(text: string): number {
  return [...text].length;
}

// The gate requires UTF-8 text of 1-200 characters, not only whitespace,
// on a single line with no control characters. Fail loudly if the entry
// ever drifts outside those bounds, instead of writing a bad file.
function validateEntry(text: string): void {
  const length = charCount(text);
  if (length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new Error(
      `entry must be ${MIN_LENGTH}-${MAX_LENGTH} characters, got ${length}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of text) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
      throw new Error("entry must not contain control characters");
    }
  }
}

function main(): void {
  validateEntry(ENTRY);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
}

main();

import { promises as fs } from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "prompts.jsonl");

export interface PromptLogEntry {
  timestamp: string;
  input: Record<string, unknown>;
  prompt: string;
  response: string;
}

export async function logPrompt(
  input: Record<string, unknown>,
  prompt: string,
  response: string
): Promise<void> {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    const entry: PromptLogEntry = {
      timestamp: new Date().toISOString(),
      input,
      prompt,
      response,
    };
    await fs.appendFile(LOG_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch (err) {
    console.error("Prompt log write failed:", err);
  }
}

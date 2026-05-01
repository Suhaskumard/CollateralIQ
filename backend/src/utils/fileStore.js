/**
 * Generic JSON-file persistence utility.
 * Creates a typed store backed by a single flat JSON file.
 *
 * Usage:
 *   const store = createStore('portfolio.json');
 *   const all   = await store.read();
 *   await store.write([...all, newItem]);
 */
import fs   from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const DATA_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..', '..', 'data'
);

// Ensure data directory exists on module load
await fs.mkdir(DATA_DIR, { recursive: true }).catch(() => {});

export function createStore(filename) {
  const filePath = path.join(DATA_DIR, filename);

  async function read() {
    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async function write(data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  return { read, write };
}

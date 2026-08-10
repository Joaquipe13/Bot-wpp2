import fs from 'fs';
import path from 'path';

export function getFoldersInPath(dir: string): string[] {
  const fullPath = path.resolve(dir);
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

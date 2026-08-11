import path from 'path';
import { DB_PATH } from '../db/database';

export const MEMES_DIR = path.join(path.dirname(DB_PATH), 'memes');

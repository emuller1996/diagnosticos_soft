import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';

const UPLOAD_DIR = path.resolve('uploads/croquis');
const PUBLIC_PREFIX = '/uploads/croquis';

const sanitize = (value) => String(value || 'sin-dato').replace(/[^a-zA-Z0-9_-]/g, '_');

export const saveCroquisAsWebP = async (buffer, { documento, id }) => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `croquis_${sanitize(documento)}_${sanitize(id)}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(filepath);

  const { size } = await fs.stat(filepath);
  return { url: `${PUBLIC_PREFIX}/${filename}`, sizeBytes: size, filename };
};

export const deleteCroquisFile = async (url) => {
  if (!url || !url.startsWith(PUBLIC_PREFIX + '/')) return;
  const filename = path.basename(url);
  const filepath = path.join(UPLOAD_DIR, filename);
  await fs.unlink(filepath).catch(() => {});
};

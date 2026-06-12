import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';

const DEFAULT_UPLOAD_ROOT = 'uploads/anexos';
const DEFAULT_PUBLIC_PREFIX = '/uploads/anexos';

const sanitize = (value) => String(value || 'sin-dato').replace(/[^a-zA-Z0-9_-]/g, '_');

export const nextFotoNumber = (existingFotos = []) => {
  const re = /foto_(\d+)\.webp$/i;
  const nums = existingFotos
    .map((f) => (f && f.url) || '')
    .map((u) => re.exec(u))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10))
    .filter((n) => Number.isFinite(n));
  return (nums.length ? Math.max(...nums) : 0) + 1;
};

export const saveAnexoFotoAsWebP = async (buffer, { key, number, rootPath = DEFAULT_UPLOAD_ROOT, publicPrefix = DEFAULT_PUBLIC_PREFIX }) => {
  const safeKey = sanitize(key);
  const folder = path.resolve(rootPath, safeKey);
  await fs.mkdir(folder, { recursive: true });
  const filename = `foto_${number}.webp`;
  const filepath = path.join(folder, filename);

  await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(filepath);

  const { size } = await fs.stat(filepath);
  return {
    url: `${publicPrefix}/${safeKey}/${filename}`,
    sizeBytes: size,
    filename,
  };
};

export const deleteAnexoFotoFile = async (url) => {
  if (!url || !url.startsWith('/uploads/')) return;
  
  // Convert URL '/uploads/category/key/file.webp' to 'uploads/category/key/file.webp'
  const relPath = url.startsWith('/') ? url.substring(1) : url;
  const filepath = path.resolve(relPath);
  
  await fs.unlink(filepath).catch(() => {});
};

const DEFAULTS = { maxWidth: 1280, maxHeight: 1280, quality: 0.7 };

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
    img.onload = () => resolve(img);
    img.src = src;
  });

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

export const compressImageToWebP = async (file, options = {}) => {
  if (!file?.type?.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen.');
  }
  const { maxWidth, maxHeight, quality } = { ...DEFAULTS, ...options };

  const sourceUrl = await readFileAsDataUrl(file);
  const img = await loadImage(sourceUrl);

  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('No se pudo convertir la imagen a WebP.'))),
      'image/webp',
      quality
    );
  });

  const dataUrl = await blobToDataUrl(blob);
  return {
    dataUrl,
    width,
    height,
    sizeBytes: blob.size,
    originalSizeBytes: file.size,
  };
};

export const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

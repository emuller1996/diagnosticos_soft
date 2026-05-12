import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';

const CANVAS_MAX_WIDTH = 600;
const CANVAS_MAX_HEIGHT = 220;
const CANVAS_MIN_WIDTH = 280;
const CANVAS_MIN_HEIGHT = 160;

const computeCanvasSize = () => {
  // Espacio reservado por padding del dialog (~ 48px cada lado) y márgenes internos
  const availableW = (typeof window !== 'undefined' ? window.innerWidth : CANVAS_MAX_WIDTH) - 64;
  const width = Math.max(CANVAS_MIN_WIDTH, Math.min(availableW, CANVAS_MAX_WIDTH));
  // Mantener un aspect ratio ~2.7:1 (600/220)
  const height = Math.max(CANVAS_MIN_HEIGHT, Math.min(Math.round(width / (CANVAS_MAX_WIDTH / CANVAS_MAX_HEIGHT)), CANVAS_MAX_HEIGHT));
  return { width, height };
};

const SignatureDialog = ({ open, title, initialDataUrl, onCancel, onSave }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sigRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [canvasSize, setCanvasSize] = useState(computeCanvasSize);

  useEffect(() => {
    if (!open) return;
    const onResize = () => setCanvasSize(computeCanvasSize());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  useEffect(() => {
    if (!open || !sigRef.current) return;
    sigRef.current.clear();
    if (initialDataUrl) {
      sigRef.current.fromDataURL(initialDataUrl);
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  }, [open, initialDataUrl, canvasSize]);

  const handleClear = () => {
    sigRef.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) return;
    const source = sigRef.current.getCanvas();
    const flat = document.createElement('canvas');
    flat.width = source.width;
    flat.height = source.height;
    const ctx = flat.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, flat.width, flat.height);
    ctx.drawImage(source, 0, 0);
    const dataUrl = flat.toDataURL('image/webp', 0.85);
    onSave(dataUrl);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullScreen={isMobile} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Dibuje la firma con el mouse o el dedo (en pantalla táctil).
        </Typography>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            backgroundColor: '#fff',
            display: 'inline-block',
            maxWidth: '100%',
          }}
        >
          <SignatureCanvas
            ref={sigRef}
            penColor="#000"
            canvasProps={{
              width: canvasSize.width,
              height: canvasSize.height,
              style: { display: 'block', touchAction: 'none' },
            }}
            onEnd={() => setIsEmpty(false)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ flexWrap: 'wrap', gap: 1, px: 2, py: 1.5 }}>
        <Button onClick={handleClear} color="inherit" sx={{ minHeight: { xs: 44, sm: 36 } }}>
          Limpiar
        </Button>
        <Button onClick={onCancel} sx={{ minHeight: { xs: 44, sm: 36 } }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isEmpty}
          sx={{ minHeight: { xs: 44, sm: 36 } }}
        >
          Guardar Firma
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureDialog;

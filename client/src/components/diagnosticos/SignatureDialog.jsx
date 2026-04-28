import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 220;

const SignatureDialog = ({ open, title, initialDataUrl, onCancel, onSave }) => {
  const sigRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (!open || !sigRef.current) return;
    sigRef.current.clear();
    if (initialDataUrl) {
      sigRef.current.fromDataURL(initialDataUrl);
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  }, [open, initialDataUrl]);

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
    <Dialog open={open} onClose={onCancel} maxWidth="md">
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
          }}
        >
          <SignatureCanvas
            ref={sigRef}
            penColor="#000"
            canvasProps={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              style: { display: 'block', touchAction: 'none' },
            }}
            onEnd={() => setIsEmpty(false)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClear} color="inherit">Limpiar</Button>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={isEmpty}>
          Guardar Firma
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureDialog;

import express from 'express';
import CaracterizacionPescaController from '../controllers/caracterizacionPescaController.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', CaracterizacionPescaController.getAll);
router.post('/', CaracterizacionPescaController.create);
router.put('/:id', CaracterizacionPescaController.update);
router.post('/:id/anexo-foto', upload.single('file'), CaracterizacionPescaController.uploadAnexoFoto);
router.delete('/:id/anexo-foto/:fotoIndex', CaracterizacionPescaController.deleteAnexoFoto);

export default router;
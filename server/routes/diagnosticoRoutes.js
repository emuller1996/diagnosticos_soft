import express from 'express';
import * as diagnosticoController from '../controllers/diagnosticoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', diagnosticoController.getAllDiagnosticos);
router.get('/:id', diagnosticoController.getDiagnosticoById);
router.post('/', diagnosticoController.createDiagnostico);
router.put('/:id', diagnosticoController.updateDiagnostico);
router.delete('/:id', diagnosticoController.deleteDiagnostico);
router.patch('/:id/inactivate', diagnosticoController.inactivateDiagnostico);
router.post('/:id/croquis', upload.single('croquis'), diagnosticoController.uploadCroquis);

export default router;
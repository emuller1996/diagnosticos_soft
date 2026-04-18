import express from 'express';
import * as diagnosticoController from '../controllers/diagnosticoController.js';

const router = express.Router();

router.get('/', diagnosticoController.getAllDiagnosticos);
router.get('/:id', diagnosticoController.getDiagnosticoById);
router.post('/', diagnosticoController.createDiagnostico);
router.put('/:id', diagnosticoController.updateDiagnostico);
router.delete('/:id', diagnosticoController.deleteDiagnostico);
router.patch('/:id/inactivate', diagnosticoController.inactivateDiagnostico);

export default router;
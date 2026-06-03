import express from 'express';
import CaracterizacionPescaController from '../controllers/caracterizacionPescaController.js';

const router = express.Router();

router.get('/', CaracterizacionPescaController.getAll);
router.post('/', CaracterizacionPescaController.create);
router.put('/:id', CaracterizacionPescaController.update);

export default router;
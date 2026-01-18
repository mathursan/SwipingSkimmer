import { Router } from 'express';
import { serviceController } from '../controllers/serviceController';

const router = Router();

router.get('/', (req, res) => serviceController.list(req, res));
router.get('/:id', (req, res) => serviceController.getById(req, res));
router.post('/', (req, res) => serviceController.create(req, res));
router.put('/:id', (req, res) => serviceController.update(req, res));
router.delete('/:id', (req, res) => serviceController.delete(req, res));

export default router;

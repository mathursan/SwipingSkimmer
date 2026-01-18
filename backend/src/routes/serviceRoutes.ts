import { Router } from 'express';
import { serviceController } from '../controllers/serviceController';

const router = Router();

router.get('/', (req, res) => serviceController.list(req, res));
router.get('/:id', (req, res) => serviceController.getById(req, res));
router.post('/', (req, res) => serviceController.create(req, res));
router.put('/:id', (req, res) => serviceController.update(req, res));
router.delete('/:id', (req, res) => serviceController.delete(req, res));
router.post('/:id/complete', (req, res) => serviceController.complete(req, res));
router.post('/:id/skip', (req, res) => serviceController.skip(req, res));
router.post('/:id/start', (req, res) => serviceController.start(req, res));

export default router;

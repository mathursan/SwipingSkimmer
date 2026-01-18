import { Router } from 'express';
import { recurringServiceController } from '../controllers/recurringServiceController';

const router = Router();

router.get('/', (req, res) => recurringServiceController.list(req, res));
router.post('/', (req, res) => recurringServiceController.create(req, res));
router.get('/:id', (req, res) => recurringServiceController.getById(req, res));
router.put('/:id', (req, res) => recurringServiceController.update(req, res));
router.delete('/:id', (req, res) => recurringServiceController.delete(req, res));
router.post('/:id/activate', (req, res) => recurringServiceController.activate(req, res));
router.post('/:id/deactivate', (req, res) => recurringServiceController.deactivate(req, res));

export default router;

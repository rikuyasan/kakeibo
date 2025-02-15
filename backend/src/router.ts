import express from 'express';
import { showController } from './Controllers/ShowController';
import { newController } from './Controllers/NewController';
import { editController } from './Controllers/EditController';
import { deleteController } from './Controllers/DeleteController';

const router = express.Router();

router.get('/api/v1/show', showController);
router.post('/api/v1/new', newController);
router.put('/api/v1/edit', editController);
router.delete('/api/v1/delete', deleteController);
router.post('/api/v1/batch', );

export default router;
import { Router } from 'express';
import fileController from '../controllers/file.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { uploadSingle } from '../utils/upload.utils';

const router = Router();

router.use(authMiddleware);

router.post('/upload', uploadSingle, fileController.upload);
router.get('/', fileController.getFiles);
router.get('/:id', fileController.getFileById);
router.delete('/:id', fileController.deleteFile);

export default router;
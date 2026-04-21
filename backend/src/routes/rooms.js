import { Router } from 'express';
import { body } from 'express-validator';
import { getRooms, getRoom, createRoom, updateRoom, deleteRoom, getOwnerRooms } from '../controllers/roomController.js';
import { auth, isOwner } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = Router();

router.get('/', getRooms);
router.get('/owner', auth, isOwner, getOwnerRooms);
router.get('/:id', getRoom);
router.post('/', auth, isOwner, upload.array('images', 5), [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('description').notEmpty().withMessage('Description required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('roomType').isIn(['single', 'double', 'triple', 'dormitory']).withMessage('Invalid room type'),
  body('locality').notEmpty().withMessage('Locality required'),
  body('gender').isIn(['male', 'female', 'any']).withMessage('Invalid gender'),
  body('ownerName').notEmpty().withMessage('Owner name required'),
  body('ownerPhone').notEmpty().withMessage('Owner phone required')
], createRoom);

router.put('/:id', auth, isOwner, upload.array('images', 5), updateRoom);
router.delete('/:id', auth, isOwner, deleteRoom);

export default router;

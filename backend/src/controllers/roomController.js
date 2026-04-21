import { validationResult } from 'express-validator';
import Room from '../models/Room.js';

export const getRooms = async (req, res) => {
  try {
    const { locality, roomType, gender, minPrice, maxPrice } = req.query;
    const filter = {};
    if (locality) filter.locality = new RegExp(locality, 'i');
    if (roomType) filter.roomType = roomType;
    if (gender) filter.gender = gender;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const rooms = await Room.find(filter).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, price, roomType, locality, amenities, gender, ownerName, ownerPhone } = req.body;
    const images = req.files ? req.files.map(f => f.path) : [];
    const room = await Room.create({
      title, description, price, roomType, locality, amenities, gender, images, ownerName, ownerPhone, owner: req.user.id
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

    const updates = req.body;
    if (req.files && req.files.length) updates.images = req.files.map(f => f.path);
    const updated = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    await room.deleteOne();
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOwnerRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

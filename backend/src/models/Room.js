import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  roomType: { type: String, enum: ['single', 'double', 'triple', 'dormitory'], required: true },
  locality: { type: String, required: true },
  amenities: [{ type: String }],
  gender: { type: String, enum: ['male', 'female', 'any'], required: true },
  images: [{ type: String }],
  ownerName: { type: String, required: true },
  ownerPhone: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);

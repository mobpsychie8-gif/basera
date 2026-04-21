import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Room from './models/Room.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/basera';

const rooms = [
  {
    title: 'Cozy Single Room Near Dal Lake',
    description: 'A well-furnished single room with attached bathroom, just 5 minutes walk from Dal Lake. Peaceful locality with beautiful views. Includes bed, wardrobe, and study table. Suitable for students or working professionals.',
    price: 5500,
    roomType: 'single',
    locality: 'Dal Gate',
    amenities: ['wifi', 'food', 'water', 'heater'],
    gender: 'male',
    images: [],
    ownerName: 'Ghulam Ahmad',
    ownerPhone: '9419001234'
  },
  {
    title: 'Spacious Double Sharing Room - Jawahar Nagar',
    description: 'Large double-sharing room in a prime locality near Jawahar Nagar market. Two beds with mattresses, shared bathroom, and common kitchen access. Great for students attending nearby coaching centers.',
    price: 4500,
    roomType: 'double',
    locality: 'Jawahar Nagar',
    amenities: ['wifi', 'food', 'parking', 'laundry', 'water'],
    gender: 'male',
    images: [],
    ownerName: 'Mohammad Ashraf',
    ownerPhone: '9419002345'
  },
  {
    title: 'Girls PG with Meals - Sonwar',
    description: 'Safe and secure paying guest accommodation for girls near Sonwar. Includes breakfast and dinner, 24/7 water supply, and CCTV security. Walking distance to commercial area.',
    price: 7000,
    roomType: 'double',
    locality: 'Sonwar',
    amenities: ['wifi', 'food', 'security', 'water', 'laundry', 'ac'],
    gender: 'female',
    images: [],
    ownerName: 'Naseema Begum',
    ownerPhone: '9419003456'
  },
  {
    title: 'Budget Triple Room in Rajbagh',
    description: 'Affordable triple-sharing room in Rajbagh, ideal for students. Three beds with storage, common bathroom, and kitchen. Close to bus stand and market.',
    price: 3500,
    roomType: 'triple',
    locality: 'Rajbagh',
    amenities: ['wifi', 'water', 'power', 'kitchen'],
    gender: 'any',
    images: [],
    ownerName: 'Farooq Wani',
    ownerPhone: '9419004567'
  },
  {
    title: 'Premium AC Room - Hyderpora',
    description: 'Fully air-conditioned single room with attached bathroom in Hyderpora. Modern furnishings, 24/7 power backup, and high-speed WiFi. Perfect for working professionals.',
    price: 9000,
    roomType: 'single',
    locality: 'Hyderpora',
    amenities: ['wifi', 'ac', 'tv', 'fridge', 'power', 'water', 'security', 'parking'],
    gender: 'male',
    images: [],
    ownerName: 'Imran Khan',
    ownerPhone: '9419005678'
  },
  {
    title: 'Student Dormitory - Bemina',
    description: 'Dormitory-style accommodation for 6 students in Bemina, near the university. Bunk beds with individual lockers, common study hall, and mess facility. Very budget-friendly.',
    price: 2500,
    roomType: 'dormitory',
    locality: 'Bemina',
    amenities: ['wifi', 'food', 'water', 'power', 'security'],
    gender: 'male',
    images: [],
    ownerName: 'Abdul Rashid',
    ownerPhone: '9419006789'
  },
  {
    title: 'Ladies Hostel Room - Batmaloo',
    description: 'Clean and well-maintained room in a ladies-only hostel at Batmaloo. Curfew at 9 PM, warden on premises. Includes meals and laundry service. Near city center.',
    price: 6000,
    roomType: 'double',
    locality: 'Batmaloo',
    amenities: ['wifi', 'food', 'security', 'water', 'laundry', 'heater'],
    gender: 'female',
    images: [],
    ownerName: 'Rifat Ara',
    ownerPhone: '9419007890'
  },
  {
    title: 'Modern Studio Room - Lal Chowk',
    description: 'Modern studio-style room in the heart of Lal Chowk. Private entrance, kitchenette, and bathroom. Fully furnished with TV, fridge, and AC. Ideal for young professionals.',
    price: 12000,
    roomType: 'single',
    locality: 'Lal Chowk',
    amenities: ['wifi', 'ac', 'tv', 'fridge', 'kitchen', 'power', 'water', 'security', 'parking', 'laundry'],
    gender: 'any',
    images: [],
    ownerName: 'Sajad Bhat',
    ownerPhone: '9419008901'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Room.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create an owner user for seeding
    const owner = await User.create({
      name: 'Demo Owner',
      email: 'owner@basera.com',
      password: 'password123',
      phone: '9419000000',
      role: 'owner'
    });
    console.log('Created owner user:', owner.email);

    // Create a seeker user
    const seeker = await User.create({
      name: 'Demo Seeker',
      email: 'seeker@basera.com',
      password: 'password123',
      phone: '9419000001',
      role: 'seeker'
    });
    console.log('Created seeker user:', seeker.email);

    // Create rooms
    const roomDocs = rooms.map(r => ({ ...r, owner: owner._id }));
    await Room.insertMany(roomDocs);
    console.log(`Seeded ${rooms.length} rooms`);

    console.log('\nSeed complete! Login credentials:');
    console.log('  Owner:  owner@basera.com / password123');
    console.log('  Seeker: seeker@basera.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();

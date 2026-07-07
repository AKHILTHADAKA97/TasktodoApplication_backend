import mongoose from 'mongoose';

const run = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';
  console.log(`Connecting to ${mongoUri}...`);
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  const collection = db.collection('users');

  console.log('Listing indexes on users collection:');
  const indexes = await collection.indexes();
  console.log(JSON.stringify(indexes, null, 2));

  // Check if firebaseUID_1 index exists
  const hasFirebaseUIDIndex = indexes.some(idx => idx.name === 'firebaseUID_1');
  if (hasFirebaseUIDIndex) {
    console.log('Dropping firebaseUID_1 index...');
    await collection.dropIndex('firebaseUID_1');
    console.log('Successfully dropped firebaseUID_1 index.');
  } else {
    console.log('firebaseUID_1 index does not exist.');
  }

  await mongoose.disconnect();
  console.log('Disconnected.');
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});

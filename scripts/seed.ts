// ===========================================
// DATABASE SEEDING SCRIPT
// Run with: npm run seed
// ===========================================

import dotenv from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import { Question } from '../src/models';

dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const MONGODB_URI = (process.env.MONGODB_URI || process.env.MONGO_URL) as string;

const round1Questions = [
  { gridIndex: 0, contestId: '231', problemIndex: 'A', name: 'Team', points: 10, url: 'https://codeforces.com/problemset/problem/231/A' },
  { gridIndex: 1, contestId: '705', problemIndex: 'A', name: 'Hulk', points: 10, url: 'https://codeforces.com/problemset/problem/705/A' },
  { gridIndex: 2, contestId: '50', problemIndex: 'A', name: 'Domino piling', points: 10, url: 'https://codeforces.com/problemset/problem/50/A' },
  { gridIndex: 3, contestId: '236', problemIndex: 'A', name: 'Boy or Girl', points: 10, url: 'https://codeforces.com/problemset/problem/236/A' },
  { gridIndex: 4, contestId: '339', problemIndex: 'A', name: 'Helpful Maths', points: 10, url: 'https://codeforces.com/problemset/problem/339/A' },
  { gridIndex: 5, contestId: '200', problemIndex: 'B', name: 'Drinks', points: 10, url: 'https://codeforces.com/problemset/problem/200/B' },
  { gridIndex: 6, contestId: '486', problemIndex: 'A', name: 'Calculating Function', points: 10, url: 'https://codeforces.com/problemset/problem/486/A' },
  { gridIndex: 7, contestId: '1352', problemIndex: 'A', name: 'Sum of Round Numbers', points: 10, url: 'https://codeforces.com/problemset/problem/1352/A' },
  { gridIndex: 8, contestId: '116', problemIndex: 'A', name: 'Tram', points: 10, url: 'https://codeforces.com/problemset/problem/116/A' },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Question.deleteMany({});
    console.log('Cleared existing questions');

    const questions = await Question.insertMany(round1Questions);
    console.log(`Inserted ${questions.length} questions`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();

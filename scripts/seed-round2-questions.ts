// ===========================================
// ROUND 2 TOURNAMENT QUESTIONS SEED SCRIPT
// Run with: npx tsx scripts/seed-tournament-questions.ts
// ===========================================

import dotenv from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Round2Question from '../src/models/Round2Question';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI as string;


const ROUND_1_QUESTIONS = {
  // Quarterfinals - Side A Questions (4)
  sideA: [
    { contestId: '1900', problemIndex: 'A', name: 'Cover in Water', url: 'https://codeforces.com/contest/1900/problem/A' },
    { contestId: '1900', problemIndex: 'B', name: 'Laura and Operations', url: 'https://codeforces.com/contest/1900/problem/B' },
    { contestId: '1899', problemIndex: 'A', name: 'Game with Integers', url: 'https://codeforces.com/contest/1899/problem/A' },
    { contestId: '1899', problemIndex: 'B', name: 'Unique Bid Auction', url: 'https://codeforces.com/contest/1899/problem/B' },
  ],
  // Quarterfinals - Side B Questions (4)
  sideB: [
    { contestId: '1898', problemIndex: 'B', name: 'Ela\'s Fitness and target', url: 'https://codeforces.com/contest/1898/problem/B' },
    { contestId: '1896', problemIndex: 'A', name: 'Jagged Swaps', url: 'https://codeforces.com/contest/1896/problem/A' },
    { contestId: '1896', problemIndex: 'B', name: 'Chip and Ribbon', url: 'https://codeforces.com/contest/1896/problem/B' },
    { contestId: '1895', problemIndex: 'A', name: 'Treasure Chest', url: 'https://codeforces.com/contest/1895/problem/A' },
  ],
};

const ROUND_2_QUESTIONS = {
  // Semifinals - Side A Questions (4)
  sideA: [
    { contestId: '1891', problemIndex: 'A', name: 'Sorting with Twos', url: 'https://codeforces.com/contest/1891/problem/A' },
    { contestId: '1891', problemIndex: 'B', name: 'Deja Vu', url: 'https://codeforces.com/contest/1891/problem/B' },
    { contestId: '1890', problemIndex: 'A', name: 'Doremy\'s Paint 3', url: 'https://codeforces.com/contest/1890/problem/A' },
    { contestId: '1890', problemIndex: 'B', name: 'Qingshan Loves Strings', url: 'https://codeforces.com/contest/1890/problem/B' },
  ],
  // Semifinals - Side B Questions (4)
  sideB: [
    { contestId: '1883', problemIndex: 'A', name: 'Morning', url: 'https://codeforces.com/contest/1883/problem/A' },
    { contestId: '1883', problemIndex: 'B', name: 'Chemistry', url: 'https://codeforces.com/contest/1883/problem/B' },
    { contestId: '1882', problemIndex: 'A', name: 'Increasing Sequence', url: 'https://codeforces.com/contest/1882/problem/A' },
    { contestId: '1882', problemIndex: 'B', name: 'Sets and Union', url: 'https://codeforces.com/contest/1882/problem/B' },
  ],
};

const ROUND_3_QUESTIONS = {
  // Finals - Side A Questions (4)
  sideA: [
    { contestId: '1881', problemIndex: 'B', name: 'Three Threadlets', url: 'https://codeforces.com/contest/1881/problem/B' },
    { contestId: '1879', problemIndex: 'A', name: 'Rigged!', url: 'https://codeforces.com/contest/1879/problem/A' },
    { contestId: '1879', problemIndex: 'B', name: 'Chips on the Board', url: 'https://codeforces.com/contest/1879/problem/B' },
    { contestId: '1877', problemIndex: 'A', name: 'Goals of Victory', url: 'https://codeforces.com/contest/1877/problem/A' }
  ],
  // Finals - Side B Questions (4)
  sideB: [
    { contestId: '1875', problemIndex: 'A', name: 'Jellyfish and Undertale', url: 'https://codeforces.com/contest/1875/problem/A' },
    { contestId: '1875', problemIndex: 'B', name: 'Jellyfish and Game', url: 'https://codeforces.com/contest/1875/problem/B' },
    { contestId: '1873', problemIndex: 'A', name: 'Short Sort', url: 'https://codeforces.com/contest/1873/problem/A' },
    { contestId: '1873', problemIndex: 'B', name: 'Good Kid', url: 'https://codeforces.com/contest/1873/problem/B' },
  ],
};

async function seedRound2Questions() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Clearing existing tournament questions...');
    await Round2Question.deleteMany({});
    console.log('   ✓ Cleared\n');

    async function seedRoundQuestions(roundNumber: number, roundName: string, questions: { sideA: any[], sideB: any[] }) {
      console.log(`📝 Seeding Round ${roundNumber} (${roundName}) questions...`);
      
      for (const q of questions.sideA) {
        await Round2Question.create({
          roundNumber,
          side: 'A',
          contestId: q.contestId,
          problemIndex: q.problemIndex,
          name: q.name,
          url: q.url,
        });
      }
      console.log(`   ✓ Side A: ${questions.sideA.length} questions`);
      
      for (const q of questions.sideB) {
        await Round2Question.create({
          roundNumber,
          side: 'B',
          contestId: q.contestId,
          problemIndex: q.problemIndex,
          name: q.name,
          url: q.url,
        });
      }
      console.log(`   ✓ Side B: ${questions.sideB.length} questions\n`);
    }

    await seedRoundQuestions(1, 'Quarterfinals', ROUND_1_QUESTIONS);
    await seedRoundQuestions(2, 'Semifinals', ROUND_2_QUESTIONS);
    await seedRoundQuestions(3, 'Finals', ROUND_3_QUESTIONS);

    const totalR1 = ROUND_1_QUESTIONS.sideA.length + ROUND_1_QUESTIONS.sideB.length;
    const totalR2 = ROUND_2_QUESTIONS.sideA.length + ROUND_2_QUESTIONS.sideB.length;
    const totalR3 = ROUND_3_QUESTIONS.sideA.length + ROUND_3_QUESTIONS.sideB.length;
    
    console.log('═══════════════════════════════════════════════');
    console.log('✅ Tournament Questions Seeded Successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log(`Round 1 (Quarterfinals): ${totalR1} questions (${ROUND_1_QUESTIONS.sideA.length} Side A, ${ROUND_1_QUESTIONS.sideB.length} Side B)`);
    console.log(`Round 2 (Semifinals):    ${totalR2} questions (${ROUND_2_QUESTIONS.sideA.length} Side A, ${ROUND_2_QUESTIONS.sideB.length} Side B)`);
    console.log(`Round 3 (Finals):        ${totalR3} questions (${ROUND_3_QUESTIONS.sideA.length} Side A, ${ROUND_3_QUESTIONS.sideB.length} Side B)`);
    console.log(`Total:                   ${totalR1 + totalR2 + totalR3} questions`);
    console.log('═══════════════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedRound2Questions();

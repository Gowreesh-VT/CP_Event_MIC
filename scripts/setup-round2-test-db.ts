// ===========================================
// ROUND 2 TEST DATABASE SETUP SCRIPT
// Run with: npx tsx scripts/setup-round2-test-db.ts
// ===========================================

import dotenv from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI as string;

const TEST_DB_NAME = 'Round2-test';

async function setupRound2TestDatabase() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const testDb = mongoose.connection.useDb(TEST_DB_NAME);
        console.log(`📁 Using database: ${TEST_DB_NAME}\n`);

        // ==========================================
        // Create Round 2 Collections
        // ==========================================
        console.log('Creating Round 2 tournament collections...\n');

        // Collection 1: round2stages
        console.log('  → Creating round2stages collection...');
        try {
            await testDb.createCollection('round2stages', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['roundNumber', 'roundName', 'status', 'duration'],
                        properties: {
                            roundNumber: {
                                bsonType: 'int',
                                minimum: 1,
                                maximum: 3,
                                description: 'Stage number (1=Quarters, 2=Semis, 3=Finals)'
                            },
                            roundName: {
                                bsonType: 'string',
                                enum: ['Quarterfinals', 'Semifinals', 'Finals'],
                                description: 'Display name of the round'
                            },
                            matchIds: {
                                bsonType: 'array',
                                items: { bsonType: 'objectId' },
                                description: 'References to Match documents'
                            },
                            status: {
                                bsonType: 'string',
                                enum: ['pending', 'active', 'completed'],
                                description: 'Current status of the round'
                            },
                            duration: {
                                bsonType: 'int',
                                description: 'Time limit in seconds (default: 1800)'
                            },
                            startTime: {
                                bsonType: 'date',
                                description: 'When round officially started'
                            },
                            endTime: {
                                bsonType: 'date',
                                description: 'When round ended'
                            }
                        }
                    }
                }
            });
            console.log('    ✓ Created round2stages collection');
        } catch (error: any) {
            if (error.code === 48) {
                console.log('    ⚠ Collection already exists, dropping and recreating...');
                await testDb.collection('round2stages').drop();
                await testDb.createCollection('round2stages');
                console.log('    ✓ Recreated round2stages collection');
            }
        }

        // Collection 2: matches
        console.log('  → Creating matches collection...');
        try {
            await testDb.createCollection('matches', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['roundNumber', 'sideA_teamIds', 'sideB_teamIds', 
                                   'sideA_handles', 'sideB_handles', 'scoreA', 'scoreB', 'status', 
                                   'questionPoolA', 'questionPoolB', 'duration'],
                        properties: {
                            roundNumber: {
                                bsonType: 'int',
                                minimum: 1,
                                maximum: 3
                            },
                            sideA_teamIds: {
                                bsonType: 'array',
                                items: { bsonType: 'objectId' },
                                description: 'Array of Team._id for Side A'
                            },
                            sideB_teamIds: {
                                bsonType: 'array',
                                items: { bsonType: 'objectId' },
                                description: 'Array of Team._id for Side B'
                            },
                            sideA_handles: {
                                bsonType: 'array',
                                items: { bsonType: 'string' },
                                description: 'Codeforces handles for Side A'
                            },
                            sideB_handles: {
                                bsonType: 'array',
                                items: { bsonType: 'string' },
                                description: 'Codeforces handles for Side B'
                            },
                            scoreA: {
                                bsonType: 'int',
                                description: 'Side A current score'
                            },
                            scoreB: {
                                bsonType: 'int',
                                description: 'Side B current score'
                            },
                            status: {
                                bsonType: 'string',
                                enum: ['waiting', 'active', 'completed']
                            },
                            winningSide: {
                                bsonType: 'string',
                                enum: ['A', 'B']
                            },
                            questionPoolA: {
                                bsonType: 'array',
                                items: { bsonType: 'objectId' },
                                description: 'Questions for Side A'
                            },
                            questionPoolB: {
                                bsonType: 'array',
                                items: { bsonType: 'objectId' },
                                description: 'Questions for Side B'
                            },
                            duration: {
                                bsonType: 'int',
                                description: 'Time limit in seconds'
                            },
                            startTime: { bsonType: 'date' },
                            endTime: { bsonType: 'date' }
                        }
                    }
                }
            });
            console.log('    ✓ Created matches collection');
        } catch (error: any) {
            if (error.code === 48) {
                console.log('    ⚠ Collection already exists, dropping and recreating...');
                await testDb.collection('matches').drop();
                await testDb.createCollection('matches');
                console.log('    ✓ Recreated matches collection');
            }
        }

        // Collection 3: matchsubmissions
        console.log('  → Creating matchsubmissions collection...');
        try {
            await testDb.createCollection('matchsubmissions', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['matchId', 'side', 'teamId', 'codeforcesHandle', 'questionId', 
                                   'contestId', 'problemIndex', 'submissionId', 'verdict', 'points', 
                                   'timestamp', 'processed'],
                        properties: {
                            matchId: { bsonType: 'objectId' },
                            side: {
                                bsonType: 'string',
                                enum: ['A', 'B']
                            },
                            teamId: { bsonType: 'objectId' },
                            codeforcesHandle: {
                                bsonType: 'string',
                                description: 'CF handle that made the submission'
                            },
                            questionId: { bsonType: 'objectId' },
                            contestId: { bsonType: 'string' },
                            problemIndex: { bsonType: 'string' },
                            submissionId: {
                                bsonType: 'long',
                                description: 'Codeforces submission ID (unique)'
                            },
                            verdict: { bsonType: 'string' },
                            points: {
                                bsonType: 'int',
                                description: 'Points awarded (+10, -5, 0)'
                            },
                            timestamp: { bsonType: 'date' },
                            processed: {
                                bsonType: 'bool',
                                description: 'Whether score has been applied'
                            }
                        }
                    }
                }
            });

            await testDb.collection('matchsubmissions').createIndex(
                { submissionId: 1 }, 
                { unique: true }
            );
            console.log('    ✓ Created matchsubmissions collection with unique index');
        } catch (error: any) {
            if (error.code === 48) {
                console.log('    ⚠ Collection already exists, dropping and recreating...');
                await testDb.collection('matchsubmissions').drop();
                await testDb.createCollection('matchsubmissions');
                await testDb.collection('matchsubmissions').createIndex(
                    { submissionId: 1 }, 
                    { unique: true }
                );
                console.log('    ✓ Recreated matchsubmissions collection');
            }
        }

        console.log('  → Creating round2questions collection...');
        try {
            await testDb.createCollection('round2questions', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['roundNumber', 'side', 'contestId', 'problemIndex', 'name', 'url'],
                        properties: {
                            roundNumber: {
                                bsonType: 'int',
                                minimum: 1,
                                maximum: 3
                            },
                            side: {
                                bsonType: 'string',
                                enum: ['A', 'B'],
                                description: 'Which side this question belongs to'
                            },
                            contestId: { bsonType: 'string' },
                            problemIndex: { bsonType: 'string' },
                            name: { bsonType: 'string' },
                            url: { bsonType: 'string' }
                        }
                    }
                }
            });

            await testDb.collection('round2questions').createIndex(
                { contestId: 1, problemIndex: 1 },
                { unique: true }
            );
            await testDb.collection('round2questions').createIndex(
                { roundNumber: 1, side: 1 }
            );
            console.log('    ✓ Created round2questions collection with indexes');
        } catch (error: any) {
            if (error.code === 48) {
                console.log('    ⚠ Collection already exists, dropping and recreating...');
                await testDb.collection('round2questions').drop();
                await testDb.createCollection('round2questions');
                await testDb.collection('round2questions').createIndex(
                    { contestId: 1, problemIndex: 1 },
                    { unique: true }
                );
                await testDb.collection('round2questions').createIndex(
                    { roundNumber: 1, side: 1 }
                );
                console.log('    ✓ Recreated round2questions collection');
            }
        }

        console.log('\n');

        // ==========================================
        // Step 3: Create Indexes for Performance
        // ==========================================
        console.log('Step 3: Creating additional indexes...\n');


        await testDb.collection('matches').createIndex({ roundNumber: 1 }, { unique: true });
        await testDb.collection('matches').createIndex({ status: 1 });
        console.log('  ✓ Created indexes on matches collection');

        await testDb.collection('matchsubmissions').createIndex({ matchId: 1, processed: 1 });
        await testDb.collection('matchsubmissions').createIndex({ teamId: 1, timestamp: -1 });
        console.log('  ✓ Created indexes on matchsubmissions collection');


        await testDb.collection('round2stages').createIndex({ roundNumber: 1 }, { unique: true });
        console.log('  ✓ Created indexes on round2stages collection');

        console.log('\n');

        // ==========================================
        // Summary
        // ==========================================
        console.log('═══════════════════════════════════════════════');
        console.log('✅ Round 2 Test Database Setup Complete!');
        console.log('═══════════════════════════════════════════════');
        console.log(`Database: ${TEST_DB_NAME}`);
        console.log('\nCollections created:');
        console.log('     - round2stages');
        console.log('     - matches');
        console.log('     - matchsubmissions');
        console.log('     - round2questions');
        console.log('\n📍 Connection string:');
        console.log(`   ${MONGODB_URI.replace(/\/[^/]+(\?|$)/, `/${TEST_DB_NAME}$1`)}`);
        console.log('═══════════════════════════════════════════════\n');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Setup failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

setupRound2TestDatabase();

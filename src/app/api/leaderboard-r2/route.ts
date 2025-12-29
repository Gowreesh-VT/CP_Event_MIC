// ===========================================
// LEADERBOARD API - Round 2
// ===========================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db';
import { TeamScoreR2, Team } from '@/models';
import type { LeaderboardResponse, LeaderboardEntry } from '@/types';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.hasRound2Access) {
            return NextResponse.json<LeaderboardResponse>(
                { success: false, error: 'Access denied to Round 2 leaderboard' },
                { status: 403 }
            );
        }

        await connectDB();

        const teamScores = await TeamScoreR2.find({}).lean();

        const teams = await Team.find({}).lean();
        const teamMap = new Map(teams.map(t => [t._id.toString(), t]));

        const leaderboard: LeaderboardEntry[] = teamScores
            .map((score) => {
                const team = teamMap.get(score.teamId);
                if (!team) return null;

                return {
                    rank: 0,
                    teamName: team.teamName,
                    score: score.currentScore,
                    lastSubmissionTime: score.lastSubmissionTime,
                };
            })
            .filter((entry): entry is LeaderboardEntry => entry !== null);

        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            
            const timeA = a.lastSubmissionTime ? new Date(a.lastSubmissionTime).getTime() : Infinity;
            const timeB = b.lastSubmissionTime ? new Date(b.lastSubmissionTime).getTime() : Infinity;
            return timeA - timeB;
        });

        let currentRank = 1;
        for (let i = 0; i < leaderboard.length; i++) {
            if (i > 0 && leaderboard[i].score < leaderboard[i - 1].score) {
                currentRank = i + 1;
            }
            leaderboard[i].rank = currentRank;
        }

        return NextResponse.json<LeaderboardResponse>({
            success: true,
            leaderboard,
        });
    } catch (error) {
        console.error('Round 2 Leaderboard API error:', error);
        return NextResponse.json<LeaderboardResponse>(
            { success: false, error: 'Failed to fetch Round 2 leaderboard' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';
import { processMatchSubmissions } from '@/services/TugOfWarScores';
import { fetchUserSubmissions } from '@/services/codeforcesService';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * POST /api/Round-2/sync
 * Sync Codeforces submissions and update match scores
 * 
 * AUTO-POLLING: Frontend polls this endpoint every 30 seconds during active matches
 * Body: { matchId: string, teamId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { matchId, teamId } = body;
    
    if (!matchId) {
      return NextResponse.json(
        { error: 'matchId is required' },
        { status: 400 }
      );
    }

    const match = await Match.findById(matchId);
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    if (teamId) {
      const allTeamIds = [...match.sideA_teamIds, ...match.sideB_teamIds].map(id => id.toString());
      if (!allTeamIds.includes(teamId)) {
        return NextResponse.json(
          { error: 'Team is not part of this match' },
          { status: 403 }
        );
      }

      const rateLimitKey = `tournament-sync:${teamId}`;
      const isAllowed = await checkRateLimit(rateLimitKey, 10, 60);
      
      if (!isAllowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait before syncing again.' },
          { status: 429 }
        );
      }
    }
    
    if (match.status !== 'active') {
      return NextResponse.json(
        { error: `Match is not active (status: ${match.status})` },
        { status: 400 }
      );
    }
    
    const allHandles = [...match.sideA_handles, ...match.sideB_handles].filter(Boolean);
    
    const fetchPromises = allHandles.map(async (handle) => {
      try {
        const result = await fetchUserSubmissions(handle, true); // Include all verdicts for Round 2 penalties
        return {
          handle,
          success: result.success,
          submissions: result.submissions || [],
          error: result.error,
        };
      } catch (error: any) {
        return {
          handle,
          success: false,
          submissions: [],
          error: error.message || 'Unknown error',
        };
      }
    });
    
    const results = await Promise.all(fetchPromises);

    const allSubmissions: any[] = [];
    const errors: string[] = [];
    
    for (const result of results) {
      if (result.success && result.submissions.length > 0) {
        allSubmissions.push(...result.submissions);
      } else if (result.error) {
        errors.push(`${result.handle}: ${result.error}`);
      }
    }
    
    // Process submissions and update scores
    const syncResult = await processMatchSubmissions(matchId, allSubmissions);
    
    return NextResponse.json({
      success: true,
      match: {
        matchId: match._id,
        scoreA: syncResult.scoreA,
        scoreB: syncResult.scoreB,
        newSubmissions: syncResult.newSubmissions,
        winningSide: syncResult.winningSide,
        isTimeout: syncResult.isTimeout,
        timeRemaining: syncResult.timeRemaining,
        status: syncResult.matchStatus,
      },
      warnings: errors.length > 0 ? errors : undefined,
    });
    
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync submissions' },
      { status: 500 }
    );
  }
}

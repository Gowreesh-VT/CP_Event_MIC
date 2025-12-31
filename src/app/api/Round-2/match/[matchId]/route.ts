import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Match from '@/models/Match';
import MatchSubmission from '@/models/MatchSubmission';
import { getTimeRemaining } from '@/services/TugOfWarScores';

/**
 * GET /api/tournament-r2/match/[matchId]
 * Get real-time match details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    await connectDB();
    
    const { matchId } = await params;
    
    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch match with populated data
    const match = await Match.findById(matchId)
      .populate('sideA_teamIds', 'teamName codeforcesHandle email')
      .populate('sideB_teamIds', 'teamName codeforcesHandle email')
      .populate('questionPoolA', 'contestId problemIndex name url')
      .populate('questionPoolB', 'contestId problemIndex name url');
    
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }
    
    // Get submissions to determine solved questions
    const submissions = await MatchSubmission.find({
      matchId: match._id,
      verdict: 'OK',
    }).lean();
    
    // Create sets of solved question IDs for each side
    const solvedByA = new Set(
      submissions
        .filter(s => s.side === 'A')
        .map(s => s.questionId.toString())
    );
    
    const solvedByB = new Set(
      submissions
        .filter(s => s.side === 'B')
        .map(s => s.questionId.toString())
    );
    
    const timeRemaining = getTimeRemaining(match);
    
    const roundNames: Record<number, string> = {
      1: 'Quarterfinals',
      2: 'Semifinals',
      3: 'Finals',
    };
    
    return NextResponse.json({
      success: true,
      match: {
        matchId: match._id,
        roundNumber: match.roundNumber,
        roundName: roundNames[match.roundNumber] || 'Unknown',
        
        sideA: {
          teams: (match.sideA_teamIds as any[]).map(t => ({
            id: t._id,
            name: t.teamName,
            handle: t.codeforcesHandle,
          })),
          handles: match.sideA_handles,
          score: match.scoreA,
          questions: (match.questionPoolA as any[]).map(q => ({
            id: q._id,
            contestId: q.contestId,
            problemIndex: q.problemIndex,
            name: q.name,
            url: q.url,
            solved: solvedByA.has(q._id.toString()),
          })),
        },
        
        sideB: {
          teams: (match.sideB_teamIds as any[]).map(t => ({
            id: t._id,
            name: t.teamName,
            handle: t.codeforcesHandle,
          })),
          handles: match.sideB_handles,
          score: match.scoreB,
          questions: (match.questionPoolB as any[]).map(q => ({
            id: q._id,
            contestId: q.contestId,
            problemIndex: q.problemIndex,
            name: q.name,
            url: q.url,
            solved: solvedByB.has(q._id.toString()),
          })),
        },
        
        status: match.status,
        winningSide: match.winningSide || null,
        timeRemaining,
        duration: match.duration,
        startTime: match.startTime,
        endTime: match.endTime,
      },
    });
    
  } catch (error: any) {
    console.error('Match fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch match' },
      { status: 500 }
    );
  }
}

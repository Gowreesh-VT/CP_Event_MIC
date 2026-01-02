import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db';
import { Round1State } from '@/models';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/round1-state
 * Returns the current Round 1 state with time remaining
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectDB();

        let round1State = await Round1State.findOne({});

        if (!round1State) {
            round1State = await Round1State.create({
                status: 'waiting',
                duration: 3600,
                extendedBy: 0,
            });
        }

        let timeRemaining = 0;

        if (round1State.status === 'active' && round1State.startTime) {
            const totalDuration = round1State.duration + round1State.extendedBy;
            const elapsed = Math.floor((Date.now() - round1State.startTime.getTime()) / 1000);
            timeRemaining = Math.max(0, totalDuration - elapsed);

            if (timeRemaining === 0 && round1State.status === 'active') {
                round1State.status = 'completed';
                round1State.endTime = new Date();
                await round1State.save();
            }
        }

        return NextResponse.json({
            success: true,
            status: round1State.status,
            timeRemaining,
            duration: round1State.duration + round1State.extendedBy,
            startTime: round1State.startTime,
            endTime: round1State.endTime,
        });
    } catch (error) {
        console.error('Round1 state error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get round state' },
            { status: 500 }
        );
    }
}

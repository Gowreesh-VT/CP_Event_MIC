'use client';

import { useState, useEffect, useCallback } from 'react';
import { GridCell } from '@/components/GridCell';
import { SyncButton } from '@/components/SyncButton';
import type { IProblem } from '@/types';

interface GameData {
  id: string;
  name: string;
  problems: IProblem[];
}

interface Progress {
  solvedIndices: number[];
  currentScore: number;
  bingoLines: number[][];
}

// dummy data for now - swap with API later
const MOCK_GAME_DATA: GameData = {
  id: 'round1',
  name: 'Round 1',
  problems: [
    { gridIndex: 0, contestId: '1926', problemIndex: 'A', name: 'Vlad and the Best of Five', points: 10 },
    { gridIndex: 1, contestId: '1926', problemIndex: 'B', name: 'Vlad and Shapes', points: 10 },
    { gridIndex: 2, contestId: '1926', problemIndex: 'C', name: 'Vlad and a Sum of Sum of Digits', points: 10 },
    { gridIndex: 3, contestId: '1927', problemIndex: 'A', name: 'Make it White', points: 10 },
    { gridIndex: 4, contestId: '1927', problemIndex: 'B', name: 'Following the String', points: 10 },
    { gridIndex: 5, contestId: '1927', problemIndex: 'C', name: 'Choose the Different Ones', points: 10 },
    { gridIndex: 6, contestId: '1928', problemIndex: 'A', name: 'Rectangle Cutting', points: 10 },
    { gridIndex: 7, contestId: '1928', problemIndex: 'B', name: 'Equalize', points: 10 },
    { gridIndex: 8, contestId: '1928', problemIndex: 'C', name: 'Physical Education Lesson', points: 10 },
  ],
};

const MOCK_PROGRESS: Progress = {
  solvedIndices: [0, 1, 4], // testing with 3 solved
  currentScore: 30,
  bingoLines: [],
};

export default function Round1Page() {
  const [game, setGame] = useState<GameData | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGameData = async () => {
      try {
        // fetch from /api/game?round=1 here
        // const res = await fetch('/api/game?round=1');
        // const data = await res.json();

        // fake delay for testing
        await new Promise(resolve => setTimeout(resolve, 800));
        setGame(MOCK_GAME_DATA);
        setProgress(MOCK_PROGRESS);
      } catch (err) {
        setError('Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  const handleSync = useCallback(async (): Promise<void> => {
    // hook up to /api/sync-score POST
    // const res = await fetch('/api/sync-score', { method: 'POST' });
    // const data = await res.json();

    // fake sync for demo
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

    // randomly mark a problem as solved for testing
    if (progress) {
      const newSolvedIndices = [...progress.solvedIndices];
      const unsolvedIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(i => !newSolvedIndices.includes(i));
      if (unsolvedIndices.length > 0) {
        const randomIndex = unsolvedIndices[Math.floor(Math.random() * unsolvedIndices.length)];
        newSolvedIndices.push(randomIndex);
      }

      setProgress({
        ...progress,
        solvedIndices: newSolvedIndices,
        currentScore: newSolvedIndices.length * 10,
      });
    }

    setLastSyncTime(new Date());
  }, [progress]);

  const getBingoIndices = useCallback((): Set<number> => {
    if (!progress?.bingoLines) return new Set();
    const indices = new Set<number>();
    for (const line of progress.bingoLines) {
      for (const idx of line) {
        indices.add(idx);
      }
    }
    return indices;
  }, [progress?.bingoLines]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-white/20 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 border-2 border-white/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            <div className="absolute inset-4 border-2 border-white/60 animate-spin" style={{ animationDuration: '1s' }} />
          </div>
          <p className="font-ui text-[10px] uppercase tracking-[0.3em] text-white/40">
            Initializing Grid...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 mx-auto mb-6 border-2 border-red-500/50 flex items-center justify-center">
            <span className="text-red-500 text-3xl">!</span>
          </div>
          <p className="text-red-400 text-lg mb-4 font-display">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="font-ui text-xs uppercase tracking-[0.2em] px-6 py-3 border border-white/20 text-white/60 hover:border-white hover:text-white transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const bingoIndices = getBingoIndices();
  const solvedSet = new Set(progress?.solvedIndices || []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F2F2]">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6 sm:mb-8 border-b border-white/10 pb-4 sm:pb-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-ui text-[10px] uppercase tracking-[0.3em] text-white/40 bg-white/5 px-3 py-1.5 border border-white/10">
                BINGO CONTEST
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tighter uppercase mb-2 chrome-text">
              {game?.name || 'Round 1'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 font-ui text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] text-white/40 uppercase">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 animate-pulse rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                LIVE_CONTEST
              </span>
              <span className="h-[1px] w-8 sm:w-12 bg-white/10" />
              <span>GRID: 3×3</span>
              <span className="h-[1px] w-8 sm:w-12 bg-white/10 hidden sm:block" />
              <span className="hidden sm:inline">9 PROBLEMS</span>
            </div>
          </div>

          <p className="font-ui text-[10px] sm:text-xs text-white/30 max-w-[280px] leading-relaxed uppercase tracking-wider">
            Solve problems to mark cells. Complete rows, columns, or diagonals for bingo bonus points.
          </p>
        </header>

        {/* Stats Dashboard */}
{/* Stats Dashboard */}
<section className="flex justify-center mb-12 sm:mb-16">
  <div
    className="
      flex w-full max-w-md sm:max-w-3xl
      bg-[#0b0b0b]
      rounded-3xl
      border border-white/10
      overflow-hidden
      shadow-[0_10px_40px_rgba(0,0,0,0.6)]
    "
  >
    {/* TOTAL SCORE */}
    <div className="flex-1 px-4 py-3 sm:px-6 sm:py-4 text-center">
      <p className="font-ui text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
        Total Score
      </p>
      <div className="flex items-end justify-center gap-2">
        <span className="text-4xl sm:text-5xl font-display font-bold">
          {progress?.currentScore || 0}
        </span>
        <span className="font-ui text-[10px] sm:text-xs text-white/30 mb-1">
          PTS
        </span>
      </div>
    </div>

    {/* DIVIDER */}
    <div className="w-px bg-white/10 my-3 sm:my-4" />

    {/* PROBLEMS SOLVED */}
    <div className="flex-1 px-4 py-3 sm:px-6 sm:py-4 text-center">
      <p className="font-ui text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
        Solved
      </p>
      <div className="flex items-end justify-center gap-2">
        <span className="text-4xl sm:text-5xl font-display font-bold">
          {progress?.solvedIndices?.length || 0}
        </span>
        <span className="font-ui text-[10px] sm:text-xs text-white/30 mb-1">
          / 09
        </span>
      </div>
    </div>

    {/* DIVIDER */}
    <div className="w-px bg-white/10 my-3 sm:my-4" />

    {/* BINGO LINES */}
    <div className="flex-1 px-4 py-3 sm:px-6 sm:py-4 text-center">
      <p className="font-ui text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
        Bingo Lines
      </p>
      <div className="flex items-end justify-center gap-2">
        <span className="text-4xl sm:text-5xl font-display font-bold">
          {progress?.bingoLines?.length || 0}
        </span>
        <span className="font-ui text-[10px] sm:text-xs text-white/30 mb-1">
          BINGOS
        </span>
      </div>
    </div>
  </div>
</section>


<div className="flex justify-center mb-8">
  <div className="w-24 h-[1px] bg-white/10" />
</div>

        {/* Bingo Grid */}
        <div className="grid grid-cols-3 gap-0 border border-white/10 mb-6 sm:mb-8 shadow-[0_0_60px_rgba(255,255,255,0.03)]">
          {game?.problems
            .sort((a: IProblem, b: IProblem) => a.gridIndex - b.gridIndex)
            .map((problem: IProblem) => (
              <div key={problem.gridIndex} className="border border-white/5">
                <GridCell
                  problem={problem}
                  isSolved={solvedSet.has(problem.gridIndex)}
                  isBingoCell={bingoIndices.has(problem.gridIndex)}
                />
              </div>
            ))}
        </div>

        {/* Sync Button and Info */}
        <div className="flex flex-col items-center gap-8 sm:gap-12">
          <SyncButton onSync={handleSync} lastSyncTime={lastSyncTime} />

          {/* Rules & Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 w-full pt-8 sm:pt-12 border-t border-white/10">
            {/* Scoring Rules */}
            <div className="space-y-4">
              <p className="font-ui text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">
                Scoring Rules
              </p>
              <p className="text-white/40 text-[10px] sm:text-xs leading-relaxed font-ui uppercase">
                +10 points per solved problem. +30 bonus for each bingo line (row, column, or diagonal).
              </p>
            </div>

            {/* Lines Available */}
            <div className="space-y-4 font-ui">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">
                Possible Lines
              </p>
              <ul className="text-white/40 text-[10px] space-y-2 uppercase tracking-widest">
                <li className="flex justify-between">
                  <span>Rows</span>
                  <span className="text-white/60">[ 03 ]</span>
                </li>
                <li className="flex justify-between">
                  <span>Columns</span>
                  <span className="text-white/60">[ 03 ]</span>
                </li>
                <li className="flex justify-between">
                  <span>Diagonals</span>
                  <span className="text-white/60">[ 02 ]</span>
                </li>
              </ul>
            </div>

            {/* Status */}
            <div className="space-y-4 font-ui">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/80">
                System Status
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                  Contest Active
                </div>
                {lastSyncTime && (
                  <p className="text-white/20 text-[10px] uppercase">
                    Last sync: {lastSyncTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-black/40 border border-white/10" />
              <span className="font-ui text-[10px] uppercase tracking-wider text-white/40">Unsolved</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-white border border-white" />
              <span className="font-ui text-[10px] uppercase tracking-wider text-white/40">Solved</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-white border border-white ring-2 ring-white ring-offset-2 ring-offset-black" />
              <span className="font-ui text-[10px] uppercase tracking-wider text-white/40">Bingo Cell</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 sm:mt-24 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-white/20">
            Codeforces Bingo Contest
          </p>
          <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-white/20">
            Round 1 — Active
          </p>
        </div>
      </footer>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Match, Team, UserProfile, Innings, BattingPerformance, BowlingPerformance } from '../types';
import { Trophy, Users, Play, ChevronRight, Settings, RotateCcw, UserPlus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LiveScore: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<{ [key: string]: Team }>({});
  const [players, setPlayers] = useState<{ [key: string]: UserProfile }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scoring state
  const [strikerId, setStrikerId] = useState<string>('');
  const [nonStrikerId, setNonStrikerId] = useState<string>('');
  const [bowlerId, setBowlerId] = useState<string>('');

  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = onSnapshot(doc(db, 'matches', matchId), async (snap) => {
      if (snap.exists()) {
        const matchData = { id: snap.id, ...snap.data() } as Match;
        setMatch(matchData);
        
        // Fetch teams if not already fetched
        if (!teams[matchData.teamAId] || !teams[matchData.teamBId]) {
          const teamASnap = await getDoc(doc(db, 'teams', matchData.teamAId));
          const teamBSnap = await getDoc(doc(db, 'teams', matchData.teamBId));
          setTeams({
            [matchData.teamAId]: { id: teamASnap.id, ...teamASnap.data() } as Team,
            [matchData.teamBId]: { id: teamBSnap.id, ...teamBSnap.data() } as Team,
          });
        }
        
        setLoading(false);
      } else {
        setError("Match not found");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [matchId]);

  const handleScore = async (runs: number, isExtra: boolean = false, extraType?: string) => {
    if (!match || !matchId) return;

    const currentInningsIndex = match.currentInnings;
    const innings = [...match.scorecard.innings];
    const currentInnings = { ...innings[currentInningsIndex] };

    // Update runs and balls
    if (!isExtra) {
      currentInnings.runs += runs;
      currentInnings.balls += 1;
      if (currentInnings.balls === 6) {
        currentInnings.overs += 1;
        currentInnings.balls = 0;
      }
    } else {
      currentInnings.runs += runs + (extraType === 'wide' || extraType === 'noBall' ? 1 : 0);
      if (extraType === 'wide') currentInnings.extras.wide += 1;
      if (extraType === 'noBall') currentInnings.extras.noBall += 1;
    }

    innings[currentInningsIndex] = currentInnings;

    try {
      await updateDoc(doc(db, 'matches', matchId), {
        scorecard: { innings },
        status: 'live'
      });
    } catch (err) {
      console.error("Error updating score:", err);
    }
  };

  const handleWicket = async () => {
    if (!match || !matchId) return;

    const currentInningsIndex = match.currentInnings;
    const innings = [...match.scorecard.innings];
    const currentInnings = { ...innings[currentInningsIndex] };

    currentInnings.wickets += 1;
    currentInnings.balls += 1;
    if (currentInnings.balls === 6) {
      currentInnings.overs += 1;
      currentInnings.balls = 0;
    }

    innings[currentInningsIndex] = currentInnings;

    try {
      await updateDoc(doc(db, 'matches', matchId), {
        scorecard: { innings }
      });
    } catch (err) {
      console.error("Error recording wicket:", err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error || !match) return <div className="text-center p-12 bg-white rounded-2xl border border-red-100 text-red-600"><AlertCircle className="h-12 w-12 mx-auto mb-4" /><p>{error || "Match not found"}</p></div>;

  const currentInnings = match.scorecard.innings[match.currentInnings];
  const battingTeam = teams[currentInnings.battingTeamId];
  const bowlingTeam = teams[currentInnings.bowlingTeamId];

  const isScorer = profile?.uid === match.scorerId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-200" />
              <span className="text-sm font-bold uppercase tracking-widest text-blue-100">{match.format} Match</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-bold uppercase tracking-widest">{match.status}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold mb-1">{battingTeam?.name}</h2>
              <p className="text-blue-100 text-sm font-medium">Batting</p>
            </div>
            <div className="text-center flex-shrink-0">
              <h1 className="text-6xl font-black tracking-tighter">
                {currentInnings.runs}<span className="text-blue-300">/</span>{currentInnings.wickets}
              </h1>
              <p className="text-xl font-bold text-blue-100 mt-2">
                Overs: {currentInnings.overs}.{currentInnings.balls} <span className="text-sm opacity-60">({match.overs})</span>
              </p>
            </div>
            <div className="text-center md:text-right flex-1">
              <h2 className="text-2xl font-bold mb-1">{bowlingTeam?.name}</h2>
              <p className="text-blue-100 text-sm font-medium">Bowling</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-6 text-sm font-bold">
            <div className="flex items-center gap-2">
              <span className="text-blue-200 uppercase tracking-wider">CRR:</span>
              <span>{(currentInnings.runs / (currentInnings.overs + currentInnings.balls/6) || 0).toFixed(2)}</span>
            </div>
            {match.currentInnings === 1 && (
              <div className="flex items-center gap-2">
                <span className="text-blue-200 uppercase tracking-wider">Target:</span>
                <span>{match.scorecard.innings[0].runs + 1}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Current Batsmen</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">S</div>
                  <span className="font-bold text-gray-900">Select Striker</span>
                </div>
                <span className="font-mono font-bold text-blue-600">0 (0)</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold">NS</div>
                  <span className="font-bold text-gray-900">Select Non-Striker</span>
                </div>
                <span className="font-mono font-bold text-gray-400">0 (0)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Current Bowler</h3>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">B</div>
                <span className="font-bold text-gray-900">Select Bowler</span>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-gray-900">0-0</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase">0.0 Overs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isScorer && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Scoring Controls</h2>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-all"><RotateCcw className="h-5 w-5" /></button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-all"><Settings className="h-5 w-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {[0, 1, 2, 3, 4, 6].map(run => (
              <button 
                key={run}
                onClick={() => handleScore(run)}
                className={`h-14 rounded-2xl font-black text-xl transition-all shadow-sm ${
                  run === 4 ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100' :
                  run === 6 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100' :
                  'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {run}
              </button>
            ))}
            <button 
              onClick={handleWicket}
              className="h-14 bg-red-600 text-white rounded-2xl font-black text-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100"
            >
              W
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <button onClick={() => handleScore(0, true, 'wide')} className="h-12 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-all">WIDE</button>
            <button onClick={() => handleScore(0, true, 'noBall')} className="h-12 bg-orange-50 text-orange-600 rounded-xl font-bold hover:bg-orange-100 transition-all">NO BALL</button>
            <button onClick={() => handleScore(0, true, 'bye')} className="h-12 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all">BYE</button>
            <button onClick={() => handleScore(0, true, 'legBye')} className="h-12 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all">LEG BYE</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Scorecard</h2>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full">Innings 1</button>
            <button className="px-4 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">Innings 2</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Batsman</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">R</th>
                <th className="px-6 py-4 text-right">B</th>
                <th className="px-6 py-4 text-right">4s</th>
                <th className="px-6 py-4 text-right">6s</th>
                <th className="px-6 py-4 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentInnings.batting.map((perf, i) => (
                <tr key={i} className="text-sm">
                  <td className="px-6 py-4 font-bold text-gray-900">Player Name</td>
                  <td className="px-6 py-4 text-gray-500">{perf.howOut || 'Not Out'}</td>
                  <td className="px-6 py-4 text-right font-bold">{perf.runs}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{perf.balls}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{perf.fours}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{perf.sixes}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{(perf.runs / perf.balls * 100 || 0).toFixed(1)}</td>
                </tr>
              ))}
              {currentInnings.batting.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 italic">No batting data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveScore;

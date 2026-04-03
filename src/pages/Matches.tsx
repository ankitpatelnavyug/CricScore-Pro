import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Match, Team } from '../types';
import { Play, Plus, Calendar, MapPin, Trophy, ChevronRight, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const Matches: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [newMatch, setNewMatch] = useState({
    teamAId: '',
    teamBId: '',
    format: 'T20',
    overs: 20,
    venue: '',
    date: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    const matchesRef = collection(db, 'matches');
    const q = query(matchesRef, orderBy('date', 'desc'));
    
    const unsubscribeMatches = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
      setLoading(false);
    });

    const teamsRef = collection(db, 'teams');
    const unsubscribeTeams = onSnapshot(teamsRef, (snap) => {
      setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
    });

    return () => {
      unsubscribeMatches();
      unsubscribeTeams();
    };
  }, []);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newMatch.teamAId || !newMatch.teamBId) return;

    try {
      const docRef = await addDoc(collection(db, 'matches'), {
        ...newMatch,
        status: 'upcoming',
        scorerId: profile.uid,
        currentInnings: 0,
        scorecard: {
          innings: [
            {
              battingTeamId: newMatch.teamAId,
              bowlingTeamId: newMatch.teamBId,
              runs: 0,
              wickets: 0,
              overs: 0,
              balls: 0,
              extras: { wide: 0, noBall: 0, bye: 0, legBye: 0 },
              batting: [],
              bowling: []
            },
            {
              battingTeamId: newMatch.teamBId,
              bowlingTeamId: newMatch.teamAId,
              runs: 0,
              wickets: 0,
              overs: 0,
              balls: 0,
              extras: { wide: 0, noBall: 0, bye: 0, legBye: 0 },
              batting: [],
              bowling: []
            }
          ]
        }
      });
      setShowAddModal(false);
      navigate(`/live/${docRef.id}`);
    } catch (err) {
      console.error("Error creating match:", err);
    }
  };

  const filteredMatches = matches.filter(match => 
    statusFilter === 'all' || match.status === statusFilter
  );

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown Team';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
          <p className="text-gray-500 text-sm">Schedule and track cricket matches live.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="h-5 w-5" />
          Schedule Match
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Live', 'Upcoming', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status.toLowerCase())}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              statusFilter === status.toLowerCase() 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredMatches.map((match) => (
              <motion.div 
                key={match.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => navigate(`/live/${match.id}`)}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        match.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                        match.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {match.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Calendar className="h-3 w-3" />
                        {new Date(match.date).toLocaleDateString()}
                        <span className="mx-1">•</span>
                        <MapPin className="h-3 w-3" />
                        {match.venue}
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-lg font-bold text-gray-900">{getTeamName(match.teamAId)}</p>
                        {match.status !== 'upcoming' && (
                          <p className="text-2xl font-mono font-bold text-blue-600 mt-1">
                            {match.scorecard.innings[0].runs}/{match.scorecard.innings[0].wickets}
                            <span className="text-xs text-gray-400 ml-2">({match.scorecard.innings[0].overs}.{match.scorecard.innings[0].balls})</span>
                          </p>
                        )}
                      </div>
                      <div className="text-xs font-bold text-gray-300 uppercase">VS</div>
                      <div className="flex-1 text-center md:text-right">
                        <p className="text-lg font-bold text-gray-900">{getTeamName(match.teamBId)}</p>
                        {match.status !== 'upcoming' && (
                          <p className="text-2xl font-mono font-bold text-blue-600 mt-1">
                            {match.scorecard.innings[1].runs}/{match.scorecard.innings[1].wickets}
                            <span className="text-xs text-gray-400 ml-2">({match.scorecard.innings[1].overs}.{match.scorecard.innings[1].balls})</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-end md:w-32">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Match Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule New Match</h2>
              <form onSubmit={handleCreateMatch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Team A</label>
                    <select 
                      required
                      value={newMatch.teamAId}
                      onChange={(e) => setNewMatch({...newMatch, teamAId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Select Team A</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id} disabled={team.id === newMatch.teamBId}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Team B</label>
                    <select 
                      required
                      value={newMatch.teamBId}
                      onChange={(e) => setNewMatch({...newMatch, teamBId: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Select Team B</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id} disabled={team.id === newMatch.teamAId}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Format</label>
                    <select 
                      value={newMatch.format}
                      onChange={(e) => setNewMatch({...newMatch, format: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="T20">T20</option>
                      <option value="ODI">ODI</option>
                      <option value="Test">Test</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Overs</label>
                    <input 
                      type="number" 
                      required
                      value={newMatch.overs}
                      onChange={(e) => setNewMatch({...newMatch, overs: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Venue</label>
                    <input 
                      type="text" 
                      required
                      value={newMatch.venue}
                      onChange={(e) => setNewMatch({...newMatch, venue: e.target.value})}
                      placeholder="Stadium Name, City"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={newMatch.date}
                      onChange={(e) => setNewMatch({...newMatch, date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    Create Match
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Matches;

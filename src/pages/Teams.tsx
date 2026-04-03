import React, { useEffect, useState } from 'react';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Team, UserProfile } from '../types';
import { Users, Plus, Search, MoreVertical, Trash2, Edit2, UserPlus, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Teams: React.FC = () => {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!profile) return;

    const teamsRef = collection(db, 'teams');
    // For now, show all teams, but in production might want to filter or paginate
    const q = query(teamsRef);
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !profile) return;

    try {
      await addDoc(collection(db, 'teams'), {
        name: newTeamName,
        managerId: profile.uid,
        playerIds: [profile.uid],
        stats: { played: 0, wins: 0, losses: 0, nrr: 0 },
        createdAt: new Date().toISOString(),
      });
      setNewTeamName('');
      setShowAddModal(false);
    } catch (err) {
      console.error("Error creating team:", err);
    }
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-500 text-sm">Manage your cricket teams and rosters.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="h-5 w-5" />
          Create Team
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search teams..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTeams.map((team) => (
              <motion.div 
                key={team.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                  <div className="absolute -bottom-6 left-6 h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="h-full w-full object-cover rounded-xl" />
                    ) : (
                      <Shield className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                </div>
                <div className="p-6 pt-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">
                        {team.playerIds?.length || 0} Players
                      </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-6">
                    <div className="text-center p-2 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Played</p>
                      <p className="text-sm font-bold text-gray-900">{team.stats.played}</p>
                    </div>
                    <div className="text-center p-2 bg-emerald-50 rounded-xl">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase">Wins</p>
                      <p className="text-sm font-bold text-emerald-600">{team.stats.wins}</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-xl">
                      <p className="text-[10px] font-bold text-red-400 uppercase">Losses</p>
                      <p className="text-sm font-bold text-red-600">{team.stats.losses}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Players
                    </button>
                    <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Team Modal */}
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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Team</h2>
              <form onSubmit={handleCreateTeam} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Team Name</label>
                  <input 
                    type="text" 
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. Mumbai Indians"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
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
                    Create Team
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

export default Teams;

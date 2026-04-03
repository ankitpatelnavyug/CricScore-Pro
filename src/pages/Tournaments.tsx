import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Trophy, Plus, Search, Calendar, Users, ChevronRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Tournaments: React.FC = () => {
  const { profile } = useAuth();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTournament, setNewTournament] = useState({ name: '', format: 'League' });

  useEffect(() => {
    const q = query(collection(db, 'tournaments'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTournaments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newTournament.name) return;
    try {
      await addDoc(collection(db, 'tournaments'), {
        ...newTournament,
        organizerId: profile.uid,
        status: 'upcoming',
        teamIds: [],
        matchIds: []
      });
      setShowAddModal(false);
      setNewTournament({ name: '', format: 'League' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
          <p className="text-gray-500 text-sm">Organize and participate in cricket leagues.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus className="h-5 w-5" />
          Create Tournament
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map(tournament => (
          <motion.div 
            key={tournament.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
          >
            <div className="h-32 bg-gradient-to-br from-indigo-600 to-blue-700 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase rounded-full border border-white/20">
                  {tournament.format}
                </span>
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
              <h3 className="text-xl font-bold text-white truncate">{tournament.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <Users className="h-4 w-4" />
                  <span>{tournament.teamIds?.length || 0} Teams</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>Upcoming</span>
                </div>
              </div>
              <button className="w-full py-3 bg-gray-50 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                View Details
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {tournaments.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No tournaments found. Create your first one!</p>
          </div>
        )}
      </div>

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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">New Tournament</h2>
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tournament Name</label>
                  <input 
                    type="text" 
                    required
                    value={newTournament.name}
                    onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                    placeholder="e.g. Summer Premier League"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Format</label>
                  <select 
                    value={newTournament.format}
                    onChange={(e) => setNewTournament({...newTournament, format: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="League">League</option>
                    <option value="Knockout">Knockout</option>
                    <option value="Group + Knockout">Group + Knockout</option>
                  </select>
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
                    Create
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

export default Tournaments;

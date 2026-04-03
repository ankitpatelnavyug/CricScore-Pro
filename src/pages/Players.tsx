import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { User, Search, Filter, Star, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Players: React.FC = () => {
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const playersRef = collection(db, 'users');
    const q = query(playersRef, orderBy('displayName'));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map(doc => doc.data() as UserProfile));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || player.playerRole?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const roles = ['All', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket Keeper'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Players</h1>
          <p className="text-gray-500 text-sm">Discover and connect with cricket players.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search players by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role.toLowerCase())}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                roleFilter === role.toLowerCase() 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPlayers.map((player) => (
              <motion.div 
                key={player.uid}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden"
              >
                <div className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <img 
                      src={player.photoURL || `https://ui-avatars.com/api/?name=${player.displayName}&background=random`} 
                      alt={player.displayName} 
                      className="h-24 w-24 rounded-full border-4 border-gray-50 shadow-inner object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                      <Star className="h-3 w-3 text-white fill-current" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 truncate">{player.displayName}</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
                    {player.playerRole || 'Player'}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Runs</p>
                      <p className="text-lg font-bold text-gray-900">{player.stats?.runs || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Wickets</p>
                      <p className="text-lg font-bold text-gray-900">{player.stats?.wickets || 0}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all">
                      View Stats
                    </button>
                    <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all">
                      <TrendingUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Players;

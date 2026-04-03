import React, { useEffect, useState } from 'react';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Match, Team } from '../types';
import { Trophy, Users, Play, Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const matchesRef = collection(db, 'matches');
    const liveQuery = query(matchesRef, where('status', '==', 'live'), limit(5));
    const recentQuery = query(matchesRef, where('status', '==', 'completed'), orderBy('date', 'desc'), limit(5));
    
    const unsubscribeLive = onSnapshot(liveQuery, (snap) => {
      setLiveMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
    });

    const unsubscribeRecent = onSnapshot(recentQuery, (snap) => {
      setRecentMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match)));
    });

    setLoading(false);
    return () => {
      unsubscribeLive();
      unsubscribeRecent();
    };
  }, []);

  const stats = [
    { label: 'Total Runs', value: profile?.stats?.runs || 0, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Wickets', value: profile?.stats?.wickets || 0, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Matches', value: profile?.stats?.matches || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Strike Rate', value: profile?.stats?.strikeRate?.toFixed(1) || '0.0', icon: Play, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hello, {profile?.displayName?.split(' ')[0]}!</h1>
          <p className="text-gray-500">Here's what's happening in your cricket world today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/matches" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
            <Play className="h-4 w-4 fill-current" />
            Start Match
          </Link>
          <Link to="/teams" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
            <Users className="h-4 w-4" />
            My Teams
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className={`h-10 w-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Live Matches</h2>
              <Link to="/matches" className="text-sm font-semibold text-blue-600 hover:underline">View All</Link>
            </div>
            {liveMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveMatches.map(match => (
                  <Link key={match.id} to={`/live/${match.id}`} className="bg-white p-5 rounded-2xl border-2 border-blue-50 shadow-sm hover:border-blue-200 transition-all group">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded-md animate-pulse">Live</span>
                      <span className="text-xs text-gray-400 font-medium">{match.venue}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">Team A</span>
                        <span className="font-mono font-bold text-lg text-blue-600">145/4 (18.2)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">Team B</span>
                        <span className="text-sm text-gray-400">Yet to bat</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between group-hover:text-blue-600 transition-colors">
                      <span className="text-xs font-medium">View Scorecard</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No live matches at the moment.</p>
                <button className="mt-4 text-blue-600 font-semibold hover:underline">Start a new match</button>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Performance</h2>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64 flex items-center justify-center">
              <p className="text-gray-400 italic">Match history graph will appear here.</p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Matches</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next 7 Days</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-gray-800 text-sm">Warriors vs Titans</p>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">T20</span>
                    </div>
                    <p className="text-xs text-gray-500">Oct 12, 2023 • 09:30 AM</p>
                  </div>
                ))}
              </div>
              <button className="w-full p-4 text-sm font-semibold text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-50">
                View Schedule
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performers</h2>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">Virat Kohli</p>
                    <p className="text-xs text-gray-500">Royal Challengers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">842</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Runs</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

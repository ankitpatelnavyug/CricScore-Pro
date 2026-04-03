import React, { useEffect, useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { User, Mail, Phone, Shield, Award, TrendingUp, Save, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), formData);
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img 
              src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}&size=128`} 
              alt={profile.displayName} 
              className="h-24 w-24 rounded-3xl border-4 border-white shadow-xl object-cover"
            />
            <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all">
              <Shield className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{profile.displayName}</h1>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">{profile.role}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {editing ? (
            <>
              <button 
                onClick={() => setEditing(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setEditing(true)}
              className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                <input 
                  type="text" 
                  disabled={!editing}
                  value={formData.displayName || ''}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  value={formData.email || ''}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl opacity-60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mobile Number</label>
                <input 
                  type="tel" 
                  disabled={!editing}
                  value={formData.mobile || ''}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Player Role</label>
                <select 
                  disabled={!editing}
                  value={formData.playerRole || ''}
                  onChange={(e) => setFormData({...formData, playerRole: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all"
                >
                  <option value="">Select Role</option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket Keeper">Wicket Keeper</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Playing Style
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Batting Style</label>
                <select 
                  disabled={!editing}
                  value={formData.battingStyle || ''}
                  onChange={(e) => setFormData({...formData, battingStyle: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all"
                >
                  <option value="">Select Style</option>
                  <option value="Right Hand Bat">Right Hand Bat</option>
                  <option value="Left Hand Bat">Left Hand Bat</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bowling Style</label>
                <select 
                  disabled={!editing}
                  value={formData.bowlingStyle || ''}
                  onChange={(e) => setFormData({...formData, bowlingStyle: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition-all"
                >
                  <option value="">Select Style</option>
                  <option value="Right Arm Fast">Right Arm Fast</option>
                  <option value="Right Arm Spin">Right Arm Spin</option>
                  <option value="Left Arm Fast">Left Arm Fast</option>
                  <option value="Left Arm Spin">Left Arm Spin</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-200" />
              Career Stats
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-blue-100 font-medium">Matches</span>
                <span className="text-2xl font-black">{profile.stats?.matches || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100 font-medium">Runs</span>
                <span className="text-2xl font-black">{profile.stats?.runs || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100 font-medium">Wickets</span>
                <span className="text-2xl font-black">{profile.stats?.wickets || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100 font-medium">Strike Rate</span>
                <span className="text-2xl font-black">{profile.stats?.strikeRate?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </section>

          <button 
            onClick={() => auth.signOut()}
            className="w-full py-4 px-6 bg-red-50 text-red-600 rounded-3xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

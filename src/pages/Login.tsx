import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Trophy, Chrome } from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 mb-4">
            <Trophy className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your cricket world</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          ) : (
            <>
              <Chrome className="h-5 w-5 text-blue-600" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Secure Authentication</p>
          <div className="mt-4 flex justify-center space-x-4 grayscale opacity-50">
            <img src="https://www.gstatic.com/firebase/php/firebase_logo.png" alt="Firebase" className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

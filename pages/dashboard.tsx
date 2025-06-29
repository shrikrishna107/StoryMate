// pages/dashboard.tsx
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';

import { useAuthContext } from '@/components/AuthProvider';
import Sidebar from '../components/Sidebar';
import Quote from '../components/Quote';

import { Clock, CheckCircle, BookOpen, Loader2 } from 'lucide-react';

const Dashboard: NextPage = () => {
  // Get Firebase services safely from our context provider to prevent errors
  const { auth, db } = useAuthContext();
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();

  // --- Efficiently fetch story counts using reactive hooks ---

  // Query for pending stories
  const pendingQuery = user ? query(
    collection(db, 'stories'), 
    where('userId', '==', user.uid),
    where('status', '==', 'pending')
  ) : null;
  const [pendingSnapshot, loadingPending] = useCollection(pendingQuery);
  
  // Query for completed stories
  const completedQuery = user ? query(
    collection(db, 'stories'), 
    where('userId', '==', user.uid),
    where('status', '==', 'completed')
  ) : null;
  const [completedSnapshot, loadingCompleted] = useCollection(completedQuery);
  
  // --- Handle Authentication and Loading States ---
  if (loadingAuth) {
    return <div className="flex min-h-screen items-center justify-center font-semibold text-gray-500">Authenticating...</div>;
  }
  
  // If not loading and no user exists, redirect to login page client-side
  if (!user) { 
    if (typeof window !== 'undefined') {
      router.push('/auth');
    }
    return null; // Render nothing while redirecting
  }

  return (
    <div className="flex min-h-screen bg-brand-background">
      <Head>
        <title>Dashboard - StoryMate</title>
      </Head>
      <Sidebar user={user} />
      
      {/* Main content area with margin for the sidebar on medium screens and up */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {user.displayName || user.email?.split('@')[0]}!
            </h1>
            <p className="mt-2 text-gray-600">Ready to weave a new tale or continue an old one?</p>
            
            {/* The Quote component fetches its own data from your API */}
            <Quote />

            <Link 
              href="/new-story" 
              className="mt-8 inline-block text-white font-bold px-8 py-3 rounded-xl bg-gradient-to-r from-primary-start via-primary-middle to-primary-end hover:shadow-lg transition-shadow"
            >
              Start a New Story! Mate
            </Link>
          </div>

          {/* Statistics Cards Grid */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            
            {/* Pending Stories Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex items-start space-x-4">
              <div className="flex-shrink-0 bg-yellow-100 text-yellow-500 p-3 rounded-full">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Pending Stories</h3>
                {loadingPending ? (
                  <Loader2 className="w-8 h-8 mt-1 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold text-yellow-500 mt-1">{pendingSnapshot?.size || 0}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">Adventures awaiting your return.</p>
              </div>
            </div>
            
            {/* Completed Stories Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex items-start space-x-4">
              <div className="flex-shrink-0 bg-green-100 text-green-500 p-3 rounded-full">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Completed Stories</h3>
                {loadingCompleted ? (
                   <Loader2 className="w-8 h-8 mt-1 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold text-green-500 mt-1">{completedSnapshot?.size || 0}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">Tales you have already woven.</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
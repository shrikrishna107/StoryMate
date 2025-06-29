// pages/pending.tsx
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useAuthContext } from '../components/AuthProvider';
import Sidebar from '../components/Sidebar';
import { StoryState } from './new-story';
import { Clock, BookOpen, AlertCircle, Loader2 } from 'lucide-react';

const PendingStoriesPage: NextPage = () => {
  const { auth, db } = useAuthContext();
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();

  const storiesQuery = user ? query(
    collection(db, 'stories'),
    where('userId', '==', user.uid),
    where('status', '==', 'pending'),
    orderBy('updatedAt', 'desc')
  ) : null;
  
  const [storiesSnapshot, loadingStories, error] = useCollection(storiesQuery);

  if (loadingAuth) return <div className="flex min-h-screen items-center justify-center font-semibold text-gray-500">Authenticating...</div>;
  if (!user) { if (typeof window !== 'undefined') router.push('/auth'); return null; }
  
  return (
    <div className="flex min-h-screen bg-brand-background">
      <Head><title>Pending Stories - StoryMate</title></Head>
      <Sidebar user={user} />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Pending Adventures</h1>
          
          {loadingStories && <div className="flex flex-col items-center justify-center p-16"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /><p className="mt-4 text-gray-600">Summoning your stories...</p></div>}
          {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg font-medium text-sm">Error: {error.message}. Please ensure the composite index is created in your Firestore settings.</div>}
          
          <div className="space-y-4">
            {storiesSnapshot && storiesSnapshot.docs.length === 0 && !loadingStories && (
              <div className="text-center py-16 px-4 bg-white rounded-xl shadow">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No Pending Stories</h3>
                <p className="mt-1 text-sm text-gray-500">You don't have any stories awaiting your return.</p>
                <div className="mt-6">
                  <Link href="/new-story" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    <BookOpen className="-ml-0.5 mr-1.5 h-5 w-5" /> Start a New Story
                  </Link>
                </div>
              </div>
            )}
            {storiesSnapshot?.docs.map(doc => {
              const story = doc.data() as StoryState;
              const lastNarrative = story.currentNarrative || 'An adventure awaits...';
              return (
                <Link href={`/new-story?storyId=${doc.id}`} key={doc.id} className="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow border border-transparent hover:border-indigo-500 cursor-pointer">
                  <h2 className="font-bold text-xl text-gray-800">{story.config.genre} Story</h2>
                  <p className="mt-2 text-gray-600 line-clamp-2">{lastNarrative}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2"/>Last updated: {new Date(story.updatedAt).toLocaleDateString()}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PendingStoriesPage;
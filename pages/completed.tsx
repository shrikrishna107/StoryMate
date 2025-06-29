// pages/completed.tsx
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
import { CheckCircle, AlertCircle, BookOpen, Loader2 } from 'lucide-react';

const CompletedStoriesPage: NextPage = () => {
  const { auth, db } = useAuthContext();
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();

  const storiesQuery = user ? query(
    collection(db, 'stories'), 
    where('userId', '==', user.uid),
    where('status', '==', 'completed'),
    orderBy('updatedAt', 'desc')
  ) : null;
  
  const [storiesSnapshot, loadingStories, error] = useCollection(storiesQuery);

  if (loadingAuth) return <div className="flex min-h-screen items-center justify-center font-semibold text-gray-500">Loading User...</div>;
  if (!user) { if(typeof window !== 'undefined') router.push('/auth'); return null; }
  
  return (
    <div className="flex min-h-screen bg-brand-background">
      <Head><title>Completed Stories - StoryMate</title></Head>
      <Sidebar user={user} />
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Completed Tales</h1>
          
          {loadingStories && 
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-lg shadow">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="mt-4 text-gray-600">Checking the archives...</p>
            </div>
          }
          {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg font-medium text-sm">Error: {error.message}. Please ensure the composite index is created in your Firestore settings. The console log may contain a link to create it.</div>}
          
          <div className="space-y-4">
            {storiesSnapshot && storiesSnapshot.docs.length === 0 && !loadingStories && (
                <div className="text-center py-16 px-4 bg-white rounded-xl shadow">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No Completed Stories</h3>
                    <p className="mt-1 text-sm text-gray-500">You haven't finished any adventures yet.</p>
                     <div className="mt-6">
                        <Link href="/new-story" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                           <BookOpen className="-ml-0.5 mr-1.5 h-5 w-5" />
                            Start Your First Story
                        </Link>
                    </div>
                </div>
            )}
            
            {storiesSnapshot && storiesSnapshot.docs.map(doc => {
              const story = doc.data() as StoryState;
              return (
                 <Link
                   href={`/new-story?storyId=${doc.id}`}
                   key={doc.id}
                   className="block p-6 bg-white rounded-xl shadow hover:shadow-lg transition-shadow border-2 border-green-200 hover:border-green-400 cursor-pointer"
                  >
                    <h2 className="font-bold text-xl text-green-700">{story.config.genre} Story</h2>
                    <p className="mt-2 text-gray-600 line-clamp-3">{story.currentNarrative}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600"/>
                      Completed on: {new Date(story.updatedAt).toLocaleDateString()}
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

export default CompletedStoriesPage;
// pages/new-story.tsx
import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useAuthContext } from '@/components/AuthProvider';
import { doc, getDoc, DocumentData } from 'firebase/firestore';

import Sidebar from '../components/Sidebar';
import StoryQuestionnaire from '../components/StoryQuestionnaire';
import StorySession from '../components/StorySession';
import { Loader2 } from 'lucide-react';

/**
 * The initial configuration of a story, gathered from the simplified questionnaire.
 * This is stored with the story in Firestore.
 */
export interface StoryConfig {
    genre: string;
    protagonistGender: 'hero' | 'heroine';
    leadStyle: 'user_leads' | 'partner_leads';
}

/**
 * The complete, self-contained state of a single story session.
 * This is the object saved to and loaded from Firestore.
 */
export interface StoryState {
    id: string; // The Firestore document ID
    config: StoryConfig;
    history: { narrative: string; choice?: string }[];
    currentNarrative: string;
    choices: [string, string] | [];
    status: 'pending' | 'completed';
    createdAt: string; // Stored as ISO string
    updatedAt: string; // Stored as ISO string
    userId: string; // Stored for security rules
    // Note: usedEventIds is no longer needed with the new AI engine
}

const NewStoryPage: NextPage = () => {
    // Get Firebase services safely from our context provider.
    const { auth, db } = useAuthContext();
    const [user, loadingAuth] = useAuthState(auth); // Use the safe auth object to check user state.
    const router = useRouter();

    // The core state for this page. Manages what to display to the user.
    // 'loading': We are checking auth or fetching an existing story.
    // null: Show the questionnaire for a new story.
    // StoryState object: An active or completed story is loaded, show the session.
    const [storyState, setStoryState] = useState<StoryState | null | 'loading'>('loading');

    // Flag for the questionnaire's final button loading state.
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * This effect runs when the user/router are ready. It checks the URL for a 
     * `storyId` to decide whether to resume a story or start a new one.
     */
    useEffect(() => {
        // Don't run this logic until we know who the user is and the router is ready.
        if (loadingAuth || !user || !router.isReady) return;

        const { storyId } = router.query;

        if (storyId && typeof storyId === 'string') {
            // A storyId exists in the URL, so we must fetch and resume it.
            const fetchStory = async () => {
                const storyRef = doc(db, "stories", storyId);
                try {
                    const storySnap = await getDoc(storyRef);

                    if (storySnap.exists()) {
                        const data = storySnap.data() as DocumentData;
                        // SECURITY CHECK: Make sure the fetched story belongs to the logged-in user.
                        if (data.userId === user.uid) {
                            setStoryState({ id: storySnap.id, ...data } as StoryState);
                        } else {
                            console.error("Access Denied: User does not own this story.");
                            router.push('/dashboard'); // Redirect if they try to access another user's story.
                        }
                    } else {
                        // The storyId in the URL doesn't correspond to a real story.
                        console.error("Story not found with ID:", storyId);
                        setStoryState(null); // Show the questionnaire to start a new story.
                    }
                } catch (error) {
                    console.error("Error fetching story:", error);
                    setStoryState(null); // Fallback to starting a new story on error.
                }
            };
            fetchStory();
        } else {
            // No storyId in URL. The user wants to start a fresh story.
            setStoryState(null);
        }
    }, [user, loadingAuth, router.isReady, router.query.storyId, db, router]);

    // Authentication guard while checking the user's login status.
    if (loadingAuth) {
        return <div className="flex min-h-screen items-center justify-center font-semibold text-gray-500">Authenticating...</div>;
    }
    // Redirect guard if no user is logged in.
    if (!user) {
        if (typeof window !== 'undefined') router.push('/auth');
        return null;
    }

    /**
     * Called when the StoryQuestionnaire is fully submitted.
     * Makes the initial API call to the AI to get the story's opening.
     */
    const handleQuestionnaireSubmit = async (config: StoryConfig) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ config, history: [], turn: 0 }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "The AI failed to start the story.");
            }

            const data = await response.json();

            // Set the initial state for the StorySession component.
            setStoryState({
                id: '', // Will be assigned by Firestore on the first save in StorySession.
                config,
                history: [],
                currentNarrative: data.narrative,
                choices: data.choices,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                userId: user.uid
            } as Omit<StoryState, 'usedEventIds'> as StoryState); // Using Omit to satisfy TS since usedEventIds is removed.

        } catch (error) {
            console.error("Error submitting questionnaire:", error);
            alert(`Could not start the story. ${error instanceof Error ? error.message : 'Please try again.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Renders the main content based on the current loading/story state.
     */
    const renderContent = () => {
        if (storyState === 'loading') {
            return (
                <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                    <p className="mt-4 text-gray-600 font-medium">Loading your adventure...</p>
                </div>
            );
        }
        if (storyState) { // A story is loaded (new or resumed).
            return <StorySession initialStoryState={storyState} user={user} />;
        }
        // No story loaded, start a new one.
        return <StoryQuestionnaire onSubmit={handleQuestionnaireSubmit} isLoading={isSubmitting} />;
    };

    return (
        <div className="flex min-h-screen bg-brand-background">
            <Head><title>Story in Progress - StoryMate</title></Head>
            <Sidebar user={user} />
            <main className="flex-1 ml-0 md:ml-64 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default NewStoryPage;
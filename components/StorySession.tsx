// components/StorySession.tsx
import { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { StoryState } from '../pages/new-story';
import Modal from './Modal';
import { useRouter } from 'next/router';
import { useAuthContext } from './AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface Props {
  initialStoryState: StoryState;
  user: User;
}

const StorySession = ({ initialStoryState, user }: Props) => {
    const { db } = useAuthContext();
    const [story, setStory] = useState(initialStoryState);
    const [isLoading, setIsLoading] = useState(false);
    const [isQuitModalOpen, setQuitModalOpen] = useState(false);
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [story.history, story.currentNarrative]);

    const saveStory = async (storyToSave: StoryState): Promise<string> => {
        // We no longer need to worry about usedEventIds in the data we save
        const { id, ...storyDataWithoutId } = storyToSave;

        const dataToSave = {
            ...storyDataWithoutId,
            userId: user.uid,
            updatedAt: new Date().toISOString(),
        };

        if (id) {
            await setDoc(doc(db, "stories", id), dataToSave, { merge: true });
            return id;
        } else {
            const dataForCreation = { ...dataToSave, createdAt: new Date().toISOString() };
            const docRef = await addDoc(collection(db, "stories"), dataForCreation);
            return docRef.id;
        }
    };

    const handleChoice = async (choice: string) => {
        setIsLoading(true);
        const newHistory = [...story.history, { narrative: story.currentNarrative, choice }];
        
        try {
            const response = await fetch('/api/story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    config: story.config, 
                    history: newHistory, // Send the full conversation history as AI memory
                    turn: newHistory.length, // Turn count helps AI with pacing
                }),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API Error: ${response.statusText}`);
            }
            
            const data = await response.json();

            let updatedStoryState = {
                ...story,
                history: newHistory,
                currentNarrative: data.narrative,
                choices: data.choices,
            };

            if (!data.choices || data.choices.length === 0) {
                updatedStoryState.status = 'completed';
            }

            const savedId = await saveStory(updatedStoryState as StoryState);
            setStory({ ...updatedStoryState, id: savedId } as StoryState);

        } catch (error) {
            console.error("Failed to continue story:", error);
            alert(`The AI storyteller has hit a block: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    // handleQuit remains the same and is fully functional.
    const handleQuit = async (endPermanently: boolean) => {
        setQuitModalOpen(false);
        if (!endPermanently) {
            await saveStory(story);
            alert("Your progress has been saved!");
            router.push('/dashboard');
            return;
        }
        setIsLoading(true);
        try {
            const conclusion = "\n\nI decided this was where my part in the tale would end. The rest is left to the whispers of what might have been.\n\n~ THE END ~";
            const finalStory: StoryState = { ...story, status: 'completed', currentNarrative: story.currentNarrative + conclusion, choices: [] };
            await saveStory(finalStory);
            setStory(finalStory);
        } catch(error) {
            console.error("Error ending story:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
      // The JSX remains identical, as the logic changes were sufficient.
      <>
        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-xl">
            <AnimatePresence>
                {story.history.map((part, index) => (
                    <motion.div key={`history-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
                        <div className="bg-gray-100 p-4 rounded-xl border border-gray-200"><p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{part.narrative}</p></div>
                        {part.choice && <div className="flex justify-end mt-3"><div className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl max-w-sm lg:max-w-md shadow-sm"><p>{part.choice}</p></div></div>}
                    </motion.div>
                ))}
            </AnimatePresence>
            <motion.div key={`current-${story.history.length}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <div className={`p-6 rounded-xl border-2 transition-colors ${story.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-200'}`}><p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">{story.currentNarrative}</p></div>
            </motion.div>
            <div className="mt-8">
                {isLoading ? <div className="text-center text-indigo-600 font-semibold flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" />The story unfolds...</div> : story.choices && story.choices.length > 0 ? (
                    <motion.div className="grid md:grid-cols-2 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
                        {story.choices.map((choice, index) => <button key={index} onClick={() => handleChoice(choice)} className="p-6 text-indigo-800 bg-white border-2 border-indigo-200 rounded-xl text-left hover:border-indigo-500 hover:shadow-md hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"><p className="font-medium">{choice}</p></button>)}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6">
                       <p className="text-gray-600 mb-4 font-semibold">This story has concluded.</p>
                       <Link href="/dashboard" className="text-white font-bold px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg transition-shadow">Return to Dashboard</Link>
                    </motion.div>
                )}
            </div>
            {story.status === 'pending' && <div className="mt-8 text-center border-t border-gray-200 pt-6"><button onClick={() => setQuitModalOpen(true)} className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">Quit Story</button></div>}
            <div ref={scrollRef} />
        </div>
        <Modal isOpen={isQuitModalOpen} onClose={() => setQuitModalOpen(false)}>
            <h3 className="text-xl font-bold text-gray-800">Leave the story?</h3>
            <p className="my-4 text-gray-600">Your current progress will be saved automatically.</p>
            <div className="flex flex-col space-y-3">
              <button onClick={() => handleQuit(false)} className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white">Continue Some Other Time</button>
              <button onClick={() => handleQuit(true)} className="w-full px-4 py-2 rounded-lg bg-red-500 text-white">End the Story Permanently</button>
              <button onClick={() => setQuitModalOpen(false)} className="w-full px-4 py-2 text-black rounded-lg border">Stay in the Story</button>
            </div>
        </Modal>
      </>
    );
};

export default StorySession;
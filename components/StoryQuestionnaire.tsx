// components/StoryQuestionnaire.tsx
import { useState, useMemo } from 'react';
import { StoryConfig } from '../pages/new-story';
import { Loader2, Zap, Shield } from 'lucide-react';

interface Props {
  onSubmit: (config: StoryConfig) => void;
  isLoading: boolean;
}
type Phase = 'genre' | 'protagonist' | 'lead_style';

// --- FULL, EXPANDED LIST OF GENRES IS RESTORED ---
const ALL_GENRES = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Historical", "Horror", "Mystery", 
    "Romance", "Science Fiction", "Thriller", "Western", "Psychological Thriller", "Dark Comedy", 
    "Paranormal Romance", "Post-Apocalyptic", "Dystopian", "Urban Fantasy", "Coming-of-Age", 
    "Crime", "Noir / Neo-Noir", "Slice of Life", "Espionage / Spy", "Political Thriller", 
    "Supernatural", "Satire", "Biographical", "War", "Family", "Musical", "Dark Fantasy", "Adult Content", "Mythology",
];

// Shuffles an array and returns a specific number of items.
const shuffleAndPick = <T,>(array: T[], count: number): T[] => {
  return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
};

const StoryQuestionnaire = ({ onSubmit, isLoading }: Props) => {
  const [phase, setPhase] = useState<Phase>('genre');
  const [config, setConfig] = useState<Partial<StoryConfig>>({});

  // Memoize the shuffled genres to prevent them from changing on re-renders within the same session.
  // We'll show a healthy number of 9 random genres.
  const displayedGenres = useMemo(() => shuffleAndPick(ALL_GENRES, 9), []);

  // Advances the questionnaire to the next phase or submits the final config.
  const setAnswerAndAdvance = (key: keyof StoryConfig, value: any, nextPhase: Phase | 'submit') => {
    const newConfig: StoryConfig = { ...config, [key]: value } as StoryConfig;
    setConfig(newConfig);
    
    if (nextPhase === 'submit') {
      onSubmit(newConfig);
    } else {
      setPhase(nextPhase);
    }
  };

  const getProgress = () => {
    if (phase === 'genre') return 33;
    if (phase === 'protagonist') return 66;
    return 100;
  };
  
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl transition-all duration-500">
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${getProgress()}%` }}
        ></div>
      </div>
      
      {phase === 'genre' && (
        <div className="animate-fade-in">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">First, pick a genre for your story.</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {displayedGenres.map(genre => (
              <button 
                key={genre} 
                onClick={() => setAnswerAndAdvance('genre', genre, 'protagonist')} 
                className="p-3 text-sm font-medium border rounded-lg transition-all text-gray-700 border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 hover:scale-105 active:scale-100"
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {phase === 'protagonist' && (
         <div className="animate-fade-in">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-6">Choose your main character.</h2>
          <p className="text-black -mt-4 mb-6">The story will always be from your "I" perspective as the narrator.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={() => setAnswerAndAdvance('protagonistGender', 'hero', 'lead_style')} className="p-6 text-left border-2 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <span className="font-bold text-black text-lg">The Hero</span>
                <p className="text-sm text-black mt-1">A story centered on a male protagonist.</p>
             </button>
             <button onClick={() => setAnswerAndAdvance('protagonistGender', 'heroine', 'lead_style')} className="p-6 text-left border-2 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <span className="font-bold text-black text-lg">The Heroine</span>
                <p className="text-sm text-black mt-1">A story centered on a female protagonist.</p>
             </button>
          </div>
        </div>
      )}

      {phase === 'lead_style' && (
         <div className="animate-fade-in">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">You and a trusted partner are in this together. Who takes the lead?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button onClick={() => setAnswerAndAdvance('leadStyle', 'user_leads', 'submit')} className="p-6 text-left border-2 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-2"/> : <Zap className="w-6 h-6 text-yellow-500 mb-2"/>}
                <span className="font-bold text-black text-lg">I will lead the way.</span>
                <p className="text-sm text-gray-600 mt-1">I will make the critical decisions and drive the action.</p>
             </button>
             <button onClick={() => setAnswerAndAdvance('leadStyle', 'partner_leads', 'submit')} className="p-6 text-left border-2 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-300" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-2"/> : <Shield className="w-6 h-6 text-blue-500 mb-2"/>}
                <span className="font-bold text-black text-lg">My partner will take the lead.</span>
                <p className="text-sm text-gray-600 mt-1">I will support my partner and react to their bold moves.</p>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryQuestionnaire;
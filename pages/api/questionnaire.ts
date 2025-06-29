// pages/api/questionnaire.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type Question = {
    id: string; // The key to save the answer under
    question: string; // The question text to show the user
};

// --- Our Pool of High-Quality, Non-Spoiler Questions ---
const POOLS = {
    DARK_ROMANCE: [
        { id: 'anti_hero_nature', question: 'What is the nature of the male lead\'s "darkness"? (e.g., "a possessive billionaire", "the leader of a criminal empire", "a mysterious stalker")' },
        { id: 'forbidden_element', question: 'What is the "forbidden" reason the main characters cannot be together? (e.g., "He is her family\'s sworn enemy", "She is investigating him", "He is her captor")' },
        { id: 'protagonist_vulnerability', question: "What is the heroine's key vulnerability that the anti-hero is drawn to or exploits?" },
        { id: 'setting_vibe', question: 'Describe the primary setting. (e.g., "a lavish, isolated mansion", "the gritty city underbelly", "a secret, high-stakes club")' },
    ],
    // For stories of magic, space, or strange worlds
    FANTASY_SCI_FI: [
        { id: 'world_rule', question: 'What is one strange or unique rule about how your world works? (e.g., "Magic is fueled by emotions", "Only androids can travel at lightspeed")' },
        { id: 'main_character_flaw', question: "What is your main character's greatest personal flaw?" },
        { id: 'primary_mood', question: 'What is the dominant mood? (e.g., "Sense of wonder", "Oppressive and grim")' },
        { id: 'unique_element', question: 'Name a unique creature, technology, or magical item that exists in this world.' },
    ],
    // For stories of crime, secrets, and investigation
    MYSTERY_CRIME_THRILLER: [
        { id: 'protagonist_past', question: "What is a dark secret from the protagonist's past that still haunts them?" },
        { id: 'setting_vibe', question: 'Describe the city or town where this takes place. (e.g., "A city of endless rain and neon signs", "A small town with a friendly facade")' },
        { id: 'main_character_motive', question: 'Besides solving the case, what is the protagonist\'s personal motivation?' },
        { id: 'antagonist_style', question: 'What is the primary style of the antagonist? (e.g., "A mastermind who is always one step ahead", "A chaotic and unpredictable force")' },
    ],
    // For stories about people, feelings, and relationships
    DRAMA_ROMANCE: [
        { id: 'relationship_obstacle', question: 'What is the main external conflict keeping the characters apart or in turmoil?' },
        { id: 'protagonist_desire', question: "Beyond romance, what does the main character want most in life?" },
        { id: 'setting_importance', question: "How does the primary location (a cafe, a foreign country, a university) influence the story?" },
        { id: 'character_lie', question: "What is a lie one of the main characters tells themselves?" },
    ],
    // A general pool for any genre
    GENERAL: [
        { id: 'opening_tone', question: 'Should the story start on a hopeful note or a note of despair?' },
        { id: 'character_strength', question: "What is your character's greatest strength?" },
        { id: 'story_theme', question: "If you had to pick one theme for this story, what would it be? (e.g., 'Betrayal', 'Redemption', 'Survival')" },
    ],
};

// --- Helper Functions ---
function shuffleAndPick<T>(array: T[], count: number): T[] {
    return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
}

function selectQuestionsForGenre(genre: string): Question[] {
    const G = genre.toLowerCase();

    if (G.includes('fantasy') || G.includes('sci-fi') || G.includes('apocalyptic') || G.includes('dystopian')) {
        return shuffleAndPick(POOLS.FANTASY_SCI_FI, 3);
    }
    if (G.includes('mystery') || G.includes('thriller') || G.includes('crime') || G.includes('noir') || G.includes('spy')) {
        return shuffleAndPick(POOLS.MYSTERY_CRIME_THRILLER, 3);
    }
    if (G.includes('drama') || G.includes('romance') || G.includes('family') || G.includes('coming-of-age') || G.includes('slice of life')) {
        return shuffleAndPick(POOLS.DRAMA_ROMANCE, 3);
    }

    // Default to a mix of everything for other genres
    const combined = [...POOLS.FANTASY_SCI_FI, ...POOLS.MYSTERY_CRIME_THRILLER, ...POOLS.GENERAL];
    return shuffleAndPick(combined, 3);
}

// --- API Handler ---
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Question[] | { error: string }>
) {
    if (req.method === 'POST') {
        const { genre } = req.body;
        if (!genre) {
            return res.status(400).json({ error: 'Genre is required.' });
        }
        try {
            const selectedQuestions = selectQuestionsForGenre(genre);
            // We will always add one general question to the mix for variety.
            const finalQuestions = [...selectedQuestions, ...shuffleAndPick(POOLS.GENERAL, 1)];
            res.status(200).json(shuffleAndPick(finalQuestions, 4)); // Return a final set of 4 shuffled questions
        } catch (e) {
            res.status(500).json({ error: 'Failed to generate questions.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
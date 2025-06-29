// pages/api/story.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { StoryConfig } from '../../pages/new-story';

// Initialize the OpenAI client ONLY if the API key is present in the environment.
// If not, 'openai' will be null, and we'll use the fallback.
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

type StoryResponse = { narrative: string; choices: [string, string] | [] };

// --- START: THE ADVANCED MOCK STORY ENGINE (OUR GUARANTEED FALLBACK) ---
// This is a high-quality, long-form story generator that requires NO API key.
// It will be used automatically if the real AI fails.
const getPartnerPronounsMock = (gender: 'hero' | 'heroine') => {
    return gender === 'hero' 
        ? { he: 'she', him: 'her', his: 'her', He: 'She', name: "Elena" }
        : { he: 'he', him: 'him', his: 'his', He: 'He', name: "Kael" };
};

const generateMockStory = (config: StoryConfig, turn: number): StoryResponse => {
    const pp = getPartnerPronounsMock(config.protagonistGender);

    // ACT I: The Setup (Turns 0-2)
    if (turn === 0) return {
        narrative: `(Using Internal Storyteller) My story begins. In a world steeped in the shadows of ${config.genre}, my partner, ${pp.name}, is my only constant. Our bond is legendary. But an ancient threat, the 'Obsidian Hand', has resurfaced, its ambitions threatening our world.`,
        choices: ["I am the first to sense the coming danger.", `It is ${pp.name} who discovers the first tangible clue.`]
    };
    if (turn <= 2) {
        if (config.leadStyle === 'user_leads') {
            return { narrative: `I take charge, uncovering a map to a forgotten ruin that holds the key to stopping the Hand. "I've got this," I say, a comforting hand on ${pp.name}'s shoulder. "Follow my lead."`, choices: ["We must infiltrate a local Hand outpost for supplies.", "We must seek a powerful, lost artifact mentioned on the map."] };
        }
        return { narrative: `${pp.name}, ever bold, takes charge. "Stay close. This gets messy," ${pp.he} declares. My role is to be ${pp.his} shield.`, choices: [`I will make sure ${pp.his} reckless plan succeeds.`, `I will find an alternate escape route if ${pp.his} plan fails.`] };
    }
    
    // ACT II: Rising Action (Turns 3-7)
    if (turn <= 7) return { narrative: `We reach a neutral city of spies, seeking an informant known as 'The Ghost'. The city is a labyrinth of crowded markets and shadowy alleys, each one holding a new danger.`, choices: ["I'll search for 'The Ghost' in the city's opulent gambling dens.", "I'll seek 'The Ghost' in the city's grim underbelly."] };
    
    // ACT III: The Midpoint Twist (Turns 8-10)
    if (turn <= 10) return { narrative: `We find 'The Ghost', but it's an ambush. The trap reveals a sickening truth: the Obsidian Hand's leader is my partner's long-lost sibling. "Join me, ${pp.name}," the leader pleads via a projection. "It's our destiny."`, choices: ["I drag my partner away. 'We have to go. Now!'", "I stand my ground. 'What destiny?' I demand."] };

    // ACT IV: The Climax (Turns 11-15)
    if (turn <= 15) return { narrative: `The truth has shattered our trust, yet we stand before the Hand's mountain fortress. The fate of the world rests on our ability to work together for one last, desperate assault.`, choices: ["We will attack the main gates with overwhelming force.", "We will find a secret way in to strike from the shadows."] };

    // ACT V: Resolution (Turns 16+)
    if (turn >= 16) {
        if (config.leadStyle === 'user_leads') return { narrative: `My strategy pays off. I defeat the leader and our bond with ${pp.name}, though scarred, is reforged in victory. Our story becomes legend.\n\n~ THE END ~`, choices: [] };
        return { narrative: `My partner's assault creates an opening for me to strike the final blow. We saved not just the world, but a family. Our legend is one of balance and trust.\n\n~ THE END ~`, choices: [] };
    }
    
    return { narrative: "The story concludes unexpectedly.", choices: [] }; // Failsafe
};
// --- END: MOCK STORY ENGINE ---


export default async function handler(req: NextApiRequest, res: NextApiResponse<StoryResponse | { error: string }>) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { config, history } = req.body;
  if (!config || history === undefined) return res.status(400).json({ error: 'Invalid request payload.' });
  
  // --- RESILIENT AI LOGIC ---
  if (!openai) {
    // If the API key wasn't provided at all, log a clear warning on the server and use the fallback.
    console.warn("******************************************************************");
    console.warn("AI Storyteller: OPENAI_API_KEY not found. Using internal engine.");
    console.warn("To enable the live AI, add your key to .env.local and restart the server.");
    console.warn("******************************************************************");
    const mockResponse = generateMockStory(config, history.length);
    return res.status(200).json(mockResponse);
  }
  
  // Try to use the Real AI. If it fails, the catch block will use the mock AI.
  try {
    const partnerGender = config.protagonistGender === 'hero' ? 'a woman' : 'a man';
    const systemMessage = `You are a master screenwriter. Write an interactive story in the first-person ("I"). Genre: ${config.genre}. I am a ${config.protagonistGender} with a ${partnerGender} partner. My lead style is '${config.leadStyle}'. Your #1 rule is to NEVER repeat plot points. The story must be long (~18 turns). Respond ONLY with a valid JSON object: {"narrative": "...", "choices": ["...", "..."]}`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [{ role: 'system', content: systemMessage }];
    history.forEach((turn: any) => {
      messages.push({ role: 'assistant', content: JSON.stringify({ narrative: turn.narrative }) });
      if (turn.choice) messages.push({ role: 'user', content: `I chose: "${turn.choice}"` });
    });
    messages.push({ role: 'user', content: "What happens next?" });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      response_format: { type: "json_object" },
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("AI returned a blank response.");

    res.status(200).json(JSON.parse(content));
  } catch (error) {
    // --- GRACEFUL FALLBACK CATCH BLOCK ---
    console.error("OpenAI call failed, falling back to internal story engine. Error:", error);
    const mockResponse = generateMockStory(config, history.length);
    res.status(200).json(mockResponse);
  }
}
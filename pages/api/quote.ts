// pages/api/quote.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type QuoteResponse = {
  text: string;
  author: string;
  source: string;
};

// A much larger, hardcoded "knowledge base" to simulate a dynamic AI
const quotes: QuoteResponse[] = [
    { text: "It's a dangerous business, Frodo, going out your door.", author: "Bilbo Baggins", source: "The Lord of the Rings" },
    { text: "May the Force be with you.", author: "Obi-Wan Kenobi", source: "Star Wars" },
    { text: "The things we do for love.", author: "Jaime Lannister", source: "Game of Thrones" },
    { text: "I am inevitable.", author: "Thanos", source: "Marvel Cinematic Universe" },
    { text: "Why so serious?", author: "The Joker", source: "The Dark Knight" },
    { text: "You're a wizard, Harry.", author: "Rubeus Hagrid", source: "Harry Potter" },
    { text: "There is no spoon.", author: "Spoon Boy", source: "The Matrix" },
    { text: "I have the high ground.", author: "Obi-Wan Kenobi", source: "Star Wars" },
    { text: "We're all mad here.", author: "Cheshire Cat", source: "Alice in Wonderland" },
    { text: "To infinity... and beyond!", author: "Buzz Lightyear", source: "Toy Story" },
    { text: "What is grief, if not love persevering?", author: "Vision", source: "WandaVision" },
    { text: "I am a leaf on the wind. Watch how I soar.", author: "Hoban 'Wash' Washburne", source: "Firefly" },
    { text: "Dread it. Run from it. Destiny arrives all the same.", author: "Thanos", source: "Marvel Cinematic Universe" },
    { text: "The problem is not the problem. The problem is your attitude about the problem.", author: "Captain Jack Sparrow", source: "Pirates of the Caribbean" },
    { text: "It is our choices, Harry, that show what we truly are, far more than our abilities.", author: "Albus Dumbledore", source: "Harry Potter" },
    { text: "Never forget what you are. The rest of the world will not. Wear it like armor, and it can never be used to hurt you.", author: "Tyrion Lannister", source: "Game of Thrones" },
    { text: "I find your lack of faith disturbing.", author: "Darth Vader", source: "Star Wars" },
    { text: "Some men just want to watch the world burn.", author: "Alfred Pennyworth", source: "The Dark Knight" },
    { text: "Just keep swimming.", author: "Dory", source: "Finding Nemo" },
    { text: "The world is changed. I feel it in the water. I feel it in the earth. I smell it in the air.", author: "Galadriel", source: "The Lord of the Rings" },
    { text: "This is the way.", author: "The Mandalorian", source: "The Mandalorian" },
    { text: "I'm the king of the world!", author: "Jack Dawson", source: "Titanic" },
    { text: "Roads? Where we're going, we don't need roads.", author: "Dr. Emmett Brown", source: "Back to the Future" },
    { text: "Get busy living, or get busy dying.", author: "Andy Dufresne", source: "The Shawshank Redemption" },
    { text: "I am your father.", author: "Darth Vader", source: "Star Wars" },
    { text: "I ask you to believe in one thing: yourself.", author: "Ted Lasso", source: "Ted Lasso" },
    { text: "Do, or do not. There is no try.", author: "Yoda", source: "Star Wars" },
    { text: "So shines a good deed in a weary world.", author: "Willy Wonka", source: "Willy Wonka & the Chocolate Factory" },
    { text: "Every man dies, but not every man really lives.", author: "William Wallace", source: "Braveheart" },
    { text: "What we do in life echoes in eternity.", author: "Maximus", source: "Gladiator" }
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<QuoteResponse>
) {
  if (req.method === 'GET') {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.status(200).json(quotes[randomIndex]);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
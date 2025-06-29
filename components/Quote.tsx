// components/Quote.tsx
import { useEffect, useState } from 'react';

interface QuoteData {
    text: string;
    author: string;
    source: string;
}

const Quote = () => {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('/api/quote');
        const data: QuoteData = await response.json();
        setQuote(data);
      } catch (error) {
        console.error("Failed to fetch quote:", error);
        setQuote({ text: "The greatest stories are those we live.", author: "The Storyteller", source: "StoryMate" });
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, []);

  if (loading) {
    return <div className="mt-6 p-6 bg-indigo-50 rounded-r-lg animate-pulse">Loading quote...</div>;
  }

  if (!quote) {
    return null; // Or some fallback UI
  }

  return (
    <div className="mt-6 bg-indigo-50 border-l-4 border-indigo-200 rounded-r-lg p-6">
      <blockquote className="text-lg italic text-gray-700">“{quote.text}”</blockquote>
      <cite className="block text-right mt-2 not-italic font-medium text-indigo-600">
        — {quote.author}, <em>{quote.source}</em>
      </cite>
    </div>
  );
};

export default Quote;
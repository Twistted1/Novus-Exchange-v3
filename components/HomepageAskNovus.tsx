import React, { useState } from 'react';
import GlassCard from './GlassCard';

interface HomepageAskNovusProps {
  onAskQuestion: (question: string) => void;
}

const HomepageAskNovus: React.FC<HomepageAskNovusProps> = ({ onAskQuestion }) => {
  const [question, setQuestion] = useState('');

  const exampleQuestions = [
    "What are the privacy concerns with the UK's new digital ID?",
    "Summarize the article about AI's impact on women's jobs.",
    "Who is Marcio Novus?",
  ];

  const handleExampleClick = (example: string) => {
    onAskQuestion(example);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAskQuestion(question);
      setQuestion('');
    }
  };

  return (
    <GlassCard className="text-center">
      <h2 className="text-3xl font-bold text-white mb-4">
        Ask Novus AI
      </h2>
      <p className="text-gray-300 max-w-2xl mx-auto mb-8">
        Have a question? Get instant, intelligent answers from our AI assistant about any topic covered in our articles or current global events.
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Explain the concept of corporate social responsibility..."
            className="w-full bg-white/10 border-white/20 rounded-md py-3 pl-4 pr-32 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:opacity-50"
            disabled={!question.trim()}
          >
            Ask
          </button>
        </div>
      </form>

      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Or try one of these questions:</h4>
        <div className="flex flex-wrap justify-center gap-3">
          {exampleQuestions.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleExampleClick(ex)}
              className="bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-md transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

export default HomepageAskNovus;

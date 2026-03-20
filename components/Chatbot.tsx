import React, { useState, useRef, useEffect } from 'react';
import GlassCard from './GlassCard';
import { NovusMessage } from '../types';
import { renderMarkdown } from '../utils';

interface ChatbotProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    messages: NovusMessage[];
    onSendMessage: (message: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, setIsOpen, messages, onSendMessage }) => {
    const [userInput, setUserInput] = useState('');
    const chatBodyRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (userInput.trim()) {
            onSendMessage(userInput);
            setUserInput('');
        }
    };

    return (
        <>
            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] max-w-[320px] h-[85vh] max-h-[800px] z-40 transition-all duration-500 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
                }`}
            >
                <GlassCard className="h-full flex flex-col p-0 overflow-hidden !border-white/15 !bg-black/95 !shadow-2xl">
                    <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0 bg-white/5">
                        <div className="flex items-center gap-3">
                           <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Novus Assistant</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div ref={chatBodyRef} className="flex-grow p-5 overflow-y-auto space-y-5">
                        {messages.map((msg) => (
                             <div key={msg.id} className={`flex items-start gap-4 ${msg.source === 'user' ? 'justify-end' : ''}`}>
                                {msg.source === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                                       <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                                    </div>
                                )}
                                <div className={`p-4 rounded-2xl max-w-[85%] ${msg.source === 'user' ? 'bg-red-600/30 border border-red-500/30' : 'bg-white/10 border border-white/10'}`}>
                                    {msg.isLoading ? (
                                        <div className="flex items-center space-x-1.5 p-1">
                                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-100 leading-relaxed prose prose-invert max-w-none prose-p:mb-3">{renderMarkdown(msg.text)}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-white/10 shrink-0 bg-black">
                        <form onSubmit={handleSend} className="flex items-center bg-white/5 border border-white/15 rounded-lg p-1.5 gap-2">
                            <input
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="ASK ANYTHING..."
                                className="flex-grow bg-transparent py-2.5 px-3 text-sm text-white focus:outline-none uppercase tracking-widest placeholder:text-gray-600"
                            />
                            <button type="submit" className="p-2.5 text-white bg-red-600 hover:bg-red-700 rounded-md transition-all disabled:opacity-20" disabled={!userInput.trim()}>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                            </button>
                        </form>
                    </div>
                </GlassCard>
            </div>

            {/* Main Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none ring-offset-black focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Chat"
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                    </svg>
                )}
            </button>
        </>
    );
};

export default Chatbot;
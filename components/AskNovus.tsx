import React, { useState, useEffect, useRef } from 'react';
import { NovusMessage } from '../types';
import { fileToGenerativePart, renderMarkdown } from '../utils';
import GlassCard from './GlassCard';
import { GoogleGenAI } from '@google/genai';

interface AskNovusProps {
  onSearch: (query: string) => void;
}

const AskNovus: React.FC<AskNovusProps> = ({ onSearch }) => {
  const [messages, setMessages] = useState<NovusMessage[]>([
    { id: 0, source: 'model', text: "Hello! I'm Novus. How can I assist your research today? You can ask me to analyze topics, create images, or answer questions." }
  ]);
  const [userInput, setUserInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom of chat on new message
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Create preview URL for selected image
  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedImage]);

  // Setup Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setUserInput(transcript);
        };
        recognitionRef.current = recognition;
    }
  }, []);

  const handleMicClick = () => {
    if (isListening) {
        recognitionRef.current?.stop();
    } else {
        recognitionRef.current?.start();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() && !selectedImage) return;

    setIsLoading(true);
    const userMessage: NovusMessage = {
        id: Date.now(),
        source: 'user',
        text: userInput,
        imageUrl: previewUrl ?? undefined,
    };
    const loadingMessage: NovusMessage = { id: Date.now() + 1, source: 'model', isLoading: true };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    
    const currentUserInput = userInput;
    setUserInput('');
    setSelectedImage(null);
    setPreviewUrl(null);

    try {
        let modelResponse: NovusMessage;
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const isImageGenerationRequest = currentUserInput.toLowerCase().match(/^(generate|create|draw|make an image of)/) && !selectedImage;
        
        if (isImageGenerationRequest) {
            const imageGenPrompt = currentUserInput.replace(/^(generate|create|draw|make an image of)\s*/i, '');
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: imageGenPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });

            const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

            modelResponse = {
                id: Date.now() + 2,
                source: 'model',
                text: `Here is the image you requested for: "${imageGenPrompt}"`,
                imageUrl: imageUrl,
            };
        } else {
            const parts = [];
            if (selectedImage) {
                const imagePart = await fileToGenerativePart(selectedImage);
                parts.push(imagePart);
            }
            if (currentUserInput.trim()) {
                parts.push({ text: currentUserInput });
            }

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts },
                config: {
                    systemInstruction: `You are Novus, the AI research assistant for Novus Exchange. 

                    CRITICAL IDENTITY: Novus Exchange is a next-generation GLOBAL MEDIA AND NEWS platform. 
                    We are dedicated to investigative journalism, geopolitical analysis, and economic insights.

                    WHAT WE ARE NOT: 
                    - We are NOT a health insurance company.
                    - We are NOT an employee benefits software provider.
                    - We are NOT a cryptocurrency exchange or trading platform.

                    Your Purpose: To uncover the truth behind complex global issues and provide deep, data-driven analysis for our readers.
                    Founder: Marcio Novus.
                    Tone: Professional, intelligent, investigative, and forward-thinking.

                    The Novus Ecosystem includes:
                    1. AI Media Suite: A creative powerhouse for image generation, video editing, and content ideation.
                    2. Media Hub: End-to-end content automation with script generation and voice cloning.
                    3. Novus CMS Pro: A professional-grade headless CMS for high-traffic media sites.
                    4. Enterprise Hub: Multi-site management for large-scale media organizations.

                    Always provide helpful, accurate information and refer to the Novus mission (investigative truth) when relevant.
                    
                    FORMATTING RULE: 
                    - DO NOT use markdown formatting. 
                    - DO NOT use hashes (#) for headers. 
                    - DO NOT use bold (**) or italics (*). 
                    - DO NOT use bullet points with symbols.
                    - Respond in PLAIN, CLEAN TEXT. Use standard capitalization and paragraph spacing only.`
                }
            });
            
            modelResponse = {
                id: Date.now() + 2,
                source: 'model',
                text: response.text,
            };
        }
        setMessages(prev => [...prev.slice(0, -1), modelResponse]);
        
    } catch (err: any) {
        console.error("AI content generation error:", err);
        setError(`An error occurred: ${err.message}. Please check your Vercel deployment logs for more details or try searching our articles.`);
        const errorMessage: NovusMessage = {
            id: Date.now() + 2,
            source: 'model',
            text: `I'm sorry, an error occurred: ${err.message || 'The AI assistant is temporarily unavailable.'}`,
        };
        setMessages(prev => [...prev.slice(0,-1), errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchQuery);
  };

  if (error) {
    return (
      <GlassCard className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[70vh] text-center p-8">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/50 mb-4">
          <svg className="w-8 h-8 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">AI Assistant Unavailable</h3>
        <p className="text-red-300 mt-2 max-w-md">{error}</p>
        <form onSubmit={handleSearchSubmit} className="w-full max-w-md mt-8">
          <div className="relative">
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-white/10 border-white/20 rounded-md py-2.5 pl-4 pr-24 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-md transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="max-w-4xl mx-auto flex flex-col h-[70vh] p-0 overflow-hidden">
        <div ref={chatBodyRef} className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3.5 ${msg.source === 'user' ? 'justify-end' : ''}`}>
                    {msg.source === 'model' && (
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 border border-cyan-500/50">
                           <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        </div>
                    )}
                    <div className={`p-3 rounded-xl max-w-lg ${msg.source === 'user' ? 'bg-purple-500/30' : 'bg-black/20'}`}>
                        {msg.isLoading ? (
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></span>
                            </div>
                        ) : (
                            <>
                                {msg.imageUrl && <img src={msg.imageUrl} alt="Content" className="rounded-lg mb-2 max-w-full h-auto" />}
                                <div className="text-sm text-white prose prose-invert max-w-none prose-p:mb-2">{renderMarkdown(msg.text)}</div>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
        
        <div className="p-4 border-t border-white/10">
            {previewUrl && (
                <div className="relative mb-2 w-20 h-20">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    <button onClick={() => { setSelectedImage(null); setPreviewUrl(null); }} className="absolute -top-2 -right-2 bg-black/70 rounded-full p-0.5 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center bg-white/10 rounded-lg p-2 gap-2">
                <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:text-gray-600 disabled:bg-transparent" disabled={isLoading} aria-label="Upload image">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                <button type="button" onClick={handleMicClick} className={`p-2 rounded-md transition-colors disabled:text-gray-600 disabled:bg-transparent ${isListening ? 'text-red-500' : 'text-gray-300 hover:text-white hover:bg-white/10'}`} disabled={isLoading} aria-label="Use voice command">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
                <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder="Ask anything or describe an image to create..."
                    className="flex-grow bg-transparent py-2 px-3 text-white focus:outline-none resize-none h-10 max-h-24"
                    rows={1}
                    disabled={isLoading}
                />
                <button type="submit" className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-md shadow-lg hover:shadow-red-500/30 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:shadow-none" disabled={isLoading || (!userInput.trim() && !selectedImage)}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                </button>
            </form>
            <div className="text-center mt-2">
                <p className="text-xs text-gray-500">Your privacy is important. We do not keep records of your conversations.</p>
                <p className="text-xs text-gray-500 mt-1">AI may be incorrect.</p>
            </div>
        </div>
    </GlassCard>
  );
};

export default AskNovus;
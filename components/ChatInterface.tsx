import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { ChatMessage, MessageRole, Persona } from '../types';
import { marked } from 'marked';
import { ChartRenderer } from './ChartRenderer';

// Helper component for the Send icon
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

// Helper component for the Bot icon
const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-400">
        <path fillRule="evenodd" d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3.375a.75.75 0 0 0 0 1.5h6.75a.75.75 0 0 0 0-1.5h-6.75Zm0 3.75a.75.75 0 0 0 0 1.5h6.75a.75.75 0 0 0 0-1.5h-6.75Zm0 3.75a.75.75 0 0 0 0 1.5h6.75a.75.75 0 0 0 0-1.5h-6.75Z" clipRule="evenodd" />
    </svg>
);

// Helper component for the User icon
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-slate-400">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
);

// Helper component for the Source icon
const SourceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
        <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25z" />
        <path d="M8.225 12.725a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25z" />
    </svg>
);

interface ChatInterfaceProps {
  persona: Persona;
}


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSendMessage = async () => {
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = {
      role: MessageRole.USER,
      content: trimmedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    const history = messages.slice(); 

    const { text, sources, chartData } = await getChatResponse(history, trimmedInput, persona);
    
    const modelMessage: ChatMessage = {
      role: MessageRole.MODEL,
      content: text,
      sources: sources,
      chartData: chartData,
    };
    setMessages((prev) => [...prev, modelMessage]);
    setIsLoading(false);
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const parseMarkdown = (content: string) => {
    const rawMarkup = marked(content, { sanitize: true });
    return { __html: rawMarkup };
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg shadow-2xl overflow-hidden">
      <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-4 ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
            {msg.role === MessageRole.MODEL && <BotIcon />}
            <div className={`max-w-xl rounded-2xl ${msg.role === MessageRole.USER ? 'bg-jk-blue text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
              <div className="p-4">
                <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={parseMarkdown(msg.content)} />
              </div>
              {msg.chartData && (
                <div className="p-4 bg-slate-800/50">
                    <ChartRenderer chartData={msg.chartData} />
                </div>
              )}
              {msg.role === MessageRole.MODEL && msg.sources && msg.sources.length > 0 && (
                <div className="border-t border-slate-600/70 px-4 py-3">
                  <h4 className="text-xs font-bold tracking-wider text-slate-400 mb-2">SOURCES</h4>
                  <ul className="space-y-1.5">
                    {msg.sources.map((source, i) => (
                      <li key={i} className="text-xs">
                        <a 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-start gap-2 text-sky-400 hover:text-sky-300"
                          title={source.title}
                        >
                          <div className="flex-shrink-0 pt-0.5"><SourceIcon /></div>
                          <span className="hover:underline">{source.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {msg.role === MessageRole.USER && <UserIcon />}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 justify-start">
            <BotIcon />
            <div className="max-w-xl p-4 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 sm:p-6 bg-slate-900/50 border-t border-slate-700">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about cement operations, sustainability, or maintenance..."
            className="flex-1 bg-slate-700 text-slate-200 placeholder-slate-400 border border-slate-600 rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-jk-blue transition duration-300"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="bg-jk-blue text-white rounded-full p-3 hover:bg-jk-blue/90 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-jk-blue focus:ring-offset-2 focus:ring-offset-slate-800"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
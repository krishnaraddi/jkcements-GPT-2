
import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { Persona } from './types';

const App: React.FC = () => {
  const [persona, setPersona] = useState<Persona>(Persona.MANAGER);

  return (
    <div className="h-screen w-screen bg-slate-900 text-white flex flex-col items-center p-4">
      <header className="w-full max-w-4xl text-center my-4 sm:my-8">
        <img 
          src="https://www.jkcement.com/images/logo-white.svg" 
          alt="JK Cement Logo" 
          className="h-12 mx-auto mb-4"
        />
        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-slate-500">
          CementGPT
        </h1>
        <p className="text-slate-400 mt-2 text-md sm:text-lg">
          Your AI Assistant for the Cement Industry
        </p>
      </header>
      
      <div className="w-full max-w-4xl flex justify-center mb-4">
        <div className="bg-slate-800 p-1 rounded-full flex space-x-1 shadow-inner">
          {Object.values(Persona).map((p) => (
            <button 
              key={p} 
              onClick={() => setPersona(p)} 
              className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-jk-blue ${
                persona === p 
                  ? 'bg-jk-blue text-white shadow-md' 
                  : 'bg-transparent text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <main className="w-full max-w-4xl flex-1 min-h-0">
        <ChatInterface persona={persona} />
      </main>
      <footer className="w-full max-w-4xl text-center py-4">
        <p className="text-slate-500 text-sm">
            Powered by Gemini. For informational purposes only.
        </p>
      </footer>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { aiApi } from '../services/api';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Bot,
  User,
  Lightbulb,
  FileText,
  TestTube,
  Wand2,
  RefreshCw
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle?: string;
  projectDomain?: string;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  suggestions?: string[];
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  projectTitle = 'Capstone Proposal',
  projectDomain = 'Computer Science & AI',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Hello! I am your **CPLMS AI Engineering Assistant**. I can help you draft formal academic abstracts, formulate test cases, generate SRS specifications, and suggest novel technical extensions for **${projectTitle}**.\n\nClick a quick tool below or ask any question!`,
      suggestions: [
        'Draft Capstone Abstract',
        'Generate SRS Outline',
        'Formulate Test Cases',
        'Improve Project Novelty',
      ],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string, action: string = 'general') => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || isLoading) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text: promptToSend }]);
    if (!customPrompt) setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await aiApi.post('/api/ai/assistant/chat', {
        prompt: promptToSend,
        action,
        title: projectTitle,
        domain: projectDomain,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.reply,
          suggestions: res.data.suggestions,
        },
      ]);
    } catch (err) {
      console.error('AI assistant chat error', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Unable to connect to the local FastAPI AI service on port 8000. Please ensure the AI service is running.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 to-purple-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>CPLMS Engineering AI Assistant</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                  Zero Cost • Local
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Context: <span className="font-semibold text-slate-700">{projectTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tool Presets */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50/70 border-b border-slate-100 overflow-x-auto text-xs">
          <button
            onClick={() => handleSend('Draft an academic project abstract with problem, methodology, and outcome.', 'generate_abstract')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition shrink-0 font-medium text-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Draft Abstract</span>
          </button>
          <button
            onClick={() => handleSend('Generate an SRS outline with functional requirements.', 'generate_srs')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition shrink-0 font-medium text-slate-700"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-600" />
            <span>SRS Outline</span>
          </button>
          <button
            onClick={() => handleSend('Formulate core test cases for capstone evaluation.', 'generate_test_cases')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition shrink-0 font-medium text-slate-700"
          >
            <TestTube className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test Cases</span>
          </button>
          <button
            onClick={() => handleSend('Suggest innovative ways to differentiate this project idea.', 'improve_idea')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition shrink-0 font-medium text-slate-700"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Novelty Directives</span>
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                {/* Suggestions chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug, 'general')}
                        className="text-[11px] font-medium bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full transition"
                      >
                        {sug} &rarr;
                      </button>
                    ))}
                  </div>
                )}

                {msg.sender === 'ai' && (
                  <div className="mt-2 pt-2 flex justify-end">
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Content</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-medium animate-pulse">CPLMS AI is synthesizing guidance...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask AI for abstract ideas, SRS requirements, or architecture tips..."
              className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

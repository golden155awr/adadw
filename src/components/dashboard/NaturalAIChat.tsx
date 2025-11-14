import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, X, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const callHFApi = async (prompt: string, maxRetries = 3): Promise<string> => {
  const apiKey = import.meta.env.VITE_HF_API_KEY;
  if (!apiKey) {
    console.error('HF API Key Missing: Check .env for VITE_HF_API_KEY');
    return 'Hugging Face API key is not configured. Please add VITE_HF_API_KEY to your .env file.';
  }

  const MODEL = 'google/gemma-2-9b-it';

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`HF API Attempt ${attempt + 1}: Sending "${prompt.substring(0, 50)}..."`);

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${MODEL}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 512,
              temperature: 0.7,
              top_p: 0.9,
              return_full_text: false,
            }
          })
        }
      );

      console.log(`HF Response Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `HTTP ${response.status} - Failed to fetch`;

        if (response.status === 401) {
          console.error('401 Unauthorized: Invalid API key');
          return 'Invalid API key. Please check your VITE_HF_API_KEY in .env and restart the server.';
        }
        if (response.status === 403) {
          console.error('403 Forbidden: Token lacks permissions');
          return 'API token lacks permissions. Create a new "Write" token.';
        }
        if (response.status === 429) {
          console.error('429 Rate Limit: Too many requests');
          return 'Rate limit hit. Please wait and try again.';
        }
        if (response.status === 503) {
          console.error('503 Service Unavailable: Model loading');
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          return 'Model is loading or service busy. Try again in 1-2 minutes.';
        }

        console.error(`HF Error ${response.status}: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log('HF Success:', data);

      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text.trim();
      }
      if (data.generated_text) {
        return data.generated_text.trim();
      }

      return 'I apologize, but I could not generate a response. Please try again.';
    } catch (error: any) {
      console.error(`HF Fetch Error (Attempt ${attempt + 1}):`, error.message);
      if (attempt === maxRetries) {
        return `Network error: ${error.message}. Check console for details. Common fixes: Restart server, check key, or try incognito.`;
      }
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return 'Max retries exceeded. Check your connection and try again.';
};

const quickPrompts = [
  'Explain blockchain technology',
  'What is a smart contract?',
  'How does IPFS work?',
  'Benefits of NFTs for credentials',
  'What is Web3?',
  'Explain Ethereum gas fees'
];

export default function NaturalAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am a natural language AI powered by Google Gemini. Ask me anything - from general knowledge to technical questions about blockchain, Web3, or any topic you are curious about!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await callHFApi(input);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError('Failed to get response. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat cleared! Ask me anything you would like to know.',
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-2xl border border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Natural AI</h3>
            <p className="text-xs text-gray-400">Powered by Google Gemini - Ask anything</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Clear chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400">AI Assistant</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              <p className="text-xs mt-2 opacity-60">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-sm text-gray-300">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400 mb-2">Try asking:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.slice(0, 4).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="text-left text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-lg transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Powered by Hugging Face - Responses generated by AI
        </p>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickSuggestions = [
  'Explain quantum computing in simple terms',
  'What are the latest trends in AI?',
  'How does blockchain work?',
  'Write a poem about technology',
  'Explain the concept of machine learning',
  'What is the future of web development?'
];

export default function NaturalAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Natural AI, powered by Hugging Face. I can answer any question on any topic. Ask me anything!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hugging Face Inference API Call
  const callHFApi = async (prompt: string, maxRetries = 3): Promise<string> => {
    const apiKey = import.meta.env.VITE_HF_API_KEY;
    if (!apiKey) {
      return 'Hugging Face API key is not configured. Please add VITE_HF_API_KEY to your .env file.';
    }

    const MODEL = 'google/gemma-2-9b-it'; // Free, powerful, chat-optimized

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
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
                stop_sequences: ['\n\n']
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || `HTTP ${response.status}`;

          // Handle model loading / rate limit
          if (response.status === 503 || errorMsg.includes('loading') || errorMsg.includes('rate limit')) {
            if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1000;
              console.warn(`HF model loading/rate limit. Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();

        if (Array.isArray(data) && data[0]?.generated_text) {
          return data[0].generated_text.trim();
        }
        if (data.generated_text) {
          return data.generated_text.trim();
        }

        return 'I apologize, but I could not generate a response. Please try again.';
      } catch (error: any) {
        console.error('Hugging Face API Error:', error);
        if (attempt === maxRetries) {
          return `Error: ${error.message || 'Failed to connect to Hugging Face API'}`;
        }
      }
    }

    return 'Model is busy. Please try again in a moment.';
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await callHFApi(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
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
        content: 'Chat cleared! Ask me anything!',
        timestamp: new Date()
      }
    ]);
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
            <p className="text-xs text-gray-400">Powered by Hugging Face</p>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-semibold text-pink-400">Natural AI</span>
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
                <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                <span className="text-sm text-gray-300">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400 mb-2">Quick suggestions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickSuggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-lg transition-colors"
              >
                {suggestion}
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
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Powered by Hugging Face Gemma 2
        </p>
      </div>
    </div>
  );
}
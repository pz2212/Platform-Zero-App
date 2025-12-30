
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin' | 'system';
  timestamp: Date;
  isImage?: boolean;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  issueType: string;
  repName?: string;
  imageUrl?: string;
}

export const ChatDialog: React.FC<ChatDialogProps> = ({ isOpen, onClose, orderId, issueType, repName = "PZ Admin Support", imageUrl }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (orderId === 'PROPOSAL-LIVE') {
        // SALES PROPOSAL FLOW
        const initialMessages: ChatMessage[] = [
          {
            id: '1',
            text: `Market Opportunity: ${issueType}`,
            sender: 'system',
            timestamp: new Date()
          }
        ];

        if (imageUrl) {
          initialMessages.push({
            id: 'photo-1',
            text: imageUrl,
            sender: 'user',
            timestamp: new Date(Date.now() + 100),
            isImage: true
          });
        }

        initialMessages.push({
          id: '2',
          text: `Hi ${repName}! 👋 I am selling ${issueType}. Would you like to include delivery with this order? (Yes / No)`,
          sender: 'user',
          timestamp: new Date(Date.now() + 500)
        });

        initialMessages.push({
          id: '3',
          text: `Hello! This is ${repName}. 😊 Thank you for reaching out with this offer! It looks like a great opportunity. How can I help you get this proposal finalized today?`,
          sender: 'admin',
          timestamp: new Date(Date.now() + 1000)
        });

        setMessages(initialMessages);
      } else {
        // STANDARD SUPPORT FLOW
        setMessages([
          {
            id: '1',
            text: `Support case started for Order #${orderId}. Issue: ${issueType}`,
            sender: 'system',
            timestamp: new Date()
          },
          {
            id: '2',
            text: `Hi there! 👋 I'm ${repName} from Platform Zero Support. I'm here to help you resolve this issue as quickly as possible. How can I assist you with this today?`,
            sender: 'admin',
            timestamp: new Date(Date.now() + 500)
          }
        ]);
      }
    }
  }, [isOpen, orderId, issueType, repName, imageUrl]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Simulate Reply
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: orderId === 'PROPOSAL-LIVE' 
          ? "That sounds perfect. I've noted your delivery preference. Let me just confirm the details with the buyer and I'll get back to you shortly! 🚀"
          : "Thank you for providing those details. I'm looking into it right now and will make sure we get this resolved for you promptly. 🤝",
        sender: 'admin',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
       {/* Backdrop to darken the existing modal slightly more to focus on chat */}
       <div className="absolute inset-0 bg-black/10 pointer-events-auto" onClick={onClose} />
       
       <div className="bg-white w-full sm:w-96 h-[500px] sm:rounded-xl shadow-2xl flex flex-col pointer-events-auto relative z-[70] sm:mr-4 mb-0 sm:mb-4 border border-gray-200 overflow-hidden transform transition-all animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-1.5 rounded-full relative">
                <ShieldCheck size={18} className="text-white"/>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm">{orderId === 'PROPOSAL-LIVE' ? 'Buyer Connection' : 'PZ Support'}</h3>
                <p className="text-xs text-slate-400">Typical reply time: &lt; 2m</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 {msg.sender === 'system' ? (
                   <div className="w-full text-center my-2">
                     <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">{msg.text}</span>
                   </div>
                 ) : (
                   <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                     msg.sender === 'user' 
                       ? 'bg-emerald-600 text-white rounded-br-none' 
                       : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                   }`}>
                     {msg.isImage ? (
                        <div className="space-y-1">
                          <img src={msg.text} alt="Proposal item" className="rounded-lg w-full h-32 object-cover bg-black/10 border border-white/20" />
                          <p className="text-[10px] opacity-70">Proposed Item Photo</p>
                        </div>
                     ) : (
                       <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                     )}
                     <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                       {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </p>
                   </div>
                 )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2"
            >
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Message ${repName.split(' ')[0]}...`}
                className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder-gray-400"
                autoFocus
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
       </div>
    </div>
  );
};

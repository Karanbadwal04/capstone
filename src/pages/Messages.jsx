import React, { useState, useEffect } from 'react';
import { Send, Search, CheckCheck, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUser = searchParams.get('user');
  
  const [selectedChat, setSelectedChat] = useState(targetUser || null);
  const [conversations, setConversations] = useState([
    { userId: 'john@gmail.com', name: 'John Client', lastMessage: 'Perfect. I have deposited the ₹45.', time: '10:15 AM', unread: 2 },
    { userId: 'sarah@college.edu', name: 'Sarah Designer', lastMessage: 'I can deliver in 3 days', time: 'Yesterday', unread: 0 },
    { userId: 'mike@company.com', name: 'Mike Marketing', lastMessage: 'Thanks for the work!', time: '2 days ago', unread: 0 },
  ]);
  
  const [messages, setMessages] = useState({});
  const [inputText, setInputText] = useState('');

  // Initialize messages for conversations
  useEffect(() => {
    const initialMessages = {
      'john@gmail.com': [
        { id: 1, sender: 'them', text: "Hi! I saw your 3D Logo gig. Are you available?", time: "10:00 AM" },
        { id: 2, sender: 'me', text: "Yes, I am! I can start once the Escrow is funded.", time: "10:05 AM" },
        { id: 3, sender: 'them', text: "Perfect. I have deposited the ₹45.", time: "10:15 AM" },
      ],
      'sarah@college.edu': [
        { id: 1, sender: 'them', text: "Can you do logo design?", time: "Yesterday" },
        { id: 2, sender: 'me', text: "I can deliver in 3 days", time: "Yesterday" },
      ],
      'mike@company.com': [
        { id: 1, sender: 'them', text: "Thanks for the work!", time: "2 days ago" },
      ],
    };
    setMessages(initialMessages);
  }, []);

  // Auto-select chat if coming from profile
  useEffect(() => {
    if (targetUser) {
      setSelectedChat(targetUser);
      // Add new conversation if doesn't exist
      if (!conversations.find(c => c.userId === targetUser)) {
        const allProfiles = JSON.parse(localStorage.getItem('allProfiles') || '{}');
        const profile = allProfiles[targetUser];
        setConversations(prev => [
          {
            userId: targetUser,
            name: profile?.name || targetUser,
            lastMessage: 'Start a conversation...',
            time: 'Now',
            unread: 0
          },
          ...prev
        ]);
        setMessages(prev => ({ ...prev, [targetUser]: [] }));
      }
    }
  }, [targetUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat) return;
    
    const newMessage = {
      id: (messages[selectedChat]?.length || 0) + 1,
      sender: 'me',
      text: inputText,
      time: 'Now'
    };
    
    setMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage]
    }));
    
    // Update last message in conversation list
    setConversations(prev => prev.map(conv => 
      conv.userId === selectedChat 
        ? { ...conv, lastMessage: inputText, time: 'Now' }
        : conv
    ));
    
    setInputText('');
  };

  const currentMessages = selectedChat ? (messages[selectedChat] || []) : [];
  const currentConversation = conversations.find(c => c.userId === selectedChat);

  return (
    <div className="min-h-screen pt-4 pb-20 px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* Background Decorations */}
      <div className="absolute top-10 right-20 animate-float opacity-20">
        <div className="w-32 h-32 bg-gradient-to-br from-brand-orange/50 to-purple-500/50 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-20 left-20 animate-float-delayed opacity-20">
        <div className="w-40 h-40 bg-gradient-to-br from-blue-500/50 to-cyan-500/50 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto rounded-2xl shadow-2xl border overflow-hidden h-[80vh] flex backdrop-blur-lg relative z-10" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        {/* Conversations List */}
        <div className="w-1/3 border-r flex flex-col" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="font-bold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none"
                style={{ 
                  backgroundColor: 'var(--input-bg)', 
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              />
            </div>
          </div>
          
          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => setSelectedChat(conv.userId)}
                className="p-4 border-b cursor-pointer hover:opacity-80 transition"
                style={{ 
                  backgroundColor: selectedChat === conv.userId ? 'var(--bg-dark)' : 'transparent',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-brand-orange/30 to-orange-600/30 border-2 border-brand-orange/50 flex items-center justify-center font-bold text-brand-orange shadow-lg group-hover:scale-110 transition-transform">
                      {conv.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{conv.name}</h3>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{conv.lastMessage}</p>
                      {conv.unread > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full font-semibold">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg-dark)' }}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="lg:hidden p-2 hover:opacity-80 transition"
                  >
                    <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center font-bold text-brand-orange">
                    {currentConversation?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {currentConversation?.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Online</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/profile/${selectedChat}`)}
                  className="px-4 py-2 text-sm font-semibold text-brand-orange hover:bg-brand-orange/10 rounded-lg transition"
                >
                  View Profile
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center" style={{ color: 'var(--text-muted)' }}>
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  currentMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-slideIn`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-lg hover:scale-[1.02] transition-all duration-200 ${
                        msg.sender === 'me' 
                          ? 'bg-gradient-to-r from-brand-orange to-orange-600 text-white' 
                          : 'border border-white/10 backdrop-blur-sm'
                      }`}
                        style={msg.sender !== 'me' ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' } : {}}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className="text-xs mt-1.5 opacity-70 flex items-center gap-1">
                          {msg.time}
                          {msg.sender === 'me' && <CheckCheck className="w-3 h-3" />}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full px-4 py-2 text-sm outline-none border"
                    style={{ 
                      backgroundColor: 'var(--input-bg)', 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                  <button
                    type="submit"
                    className="p-3 bg-gradient-to-r from-brand-orange to-orange-600 text-white rounded-full hover:scale-110 hover:shadow-lg hover:shadow-brand-orange/50 transition-all duration-300"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-orange/20 flex items-center justify-center">
                  <Send className="w-10 h-10 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Select a conversation
                </h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
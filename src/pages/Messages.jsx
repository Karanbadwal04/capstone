import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Check, CheckCheck, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const targetUser = searchParams.get('user');
  
  const [selectedChat, setSelectedChat] = useState(targetUser || null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSeen, setLastSeen] = useState({});
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState('');
  const messagesContainerRef = useRef(null);

  const currentUser = localStorage.getItem('userEmail') || localStorage.getItem('userId');
  
  console.log('Current user in Messages:', currentUser);

  // Fetch current user info on mount
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchCurrentUserInfo = async () => {
      try {
        // First try to get profile name from localStorage
        const profileKey = `profileData:${currentUser}`;
        const profileData = localStorage.getItem(profileKey);
        
        if (profileData) {
          try {
            const profile = JSON.parse(profileData);
            setCurrentUserName(profile.name || currentUser.split('@')[0]);
          } catch (e) {
            console.error('Error parsing profile data:', e);
            setCurrentUserName(currentUser.split('@')[0]);
          }
        } else {
          // Fallback to fetching from backend
          const response = await fetch(`${API_URL}/messages/user-info/${encodeURIComponent(currentUser)}`);
          if (response.ok) {
            const userInfo = await response.json();
            setCurrentUserName(userInfo.name || currentUser.split('@')[0]);
            setCurrentUserRole(userInfo.role || 'user');
          }
        }
      } catch (error) {
        console.error('Error fetching current user info:', error);
        setCurrentUserName(currentUser.split('@')[0]);
      }
    };
    
    fetchCurrentUserInfo();
  }, [currentUser]);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!currentUser) return;
      
      try {
        console.log('Loading conversations for:', currentUser);
        const response = await fetch(`${API_URL}/messages/conversations/${encodeURIComponent(currentUser)}`);
        if (!response.ok) {
          console.error('Failed to load conversations:', response.status);
          return;
        }

        const data = await response.json();
        console.log('Conversations loaded:', data);

        const formattedConvs = data.map((conv) => {
          // Try to get profile name from localStorage first, fallback to database name
          const profileKey = `profileData:${conv.otherUser}`;
          const profileData = localStorage.getItem(profileKey);
          let displayName = conv.otherUser.split('@')[0];
          
          if (profileData) {
            try {
              const profile = JSON.parse(profileData);
              if (profile.name) displayName = profile.name;
            } catch (e) {
              console.error('Error parsing profile data:', e);
            }
          }
          
          // Fallback to database name if no profile
          if (!profileData) {
            displayName = conv.otherUserName || displayName;
          }
          
          return {
            userId: conv.otherUser,
            name: displayName,
            role: conv.otherUserRole || 'unknown',
            lastMessage: conv.lastMessage?.text || 'No messages yet',
            lastTimestamp: conv.lastMessage?.timestamp || null,
            time: conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString() : 'Now',
            unread: conv.unreadCount,
          };
        });

        // Sort conversations by latest message timestamp desc
        formattedConvs.sort((a, b) => {
          const ta = a.lastTimestamp ? new Date(a.lastTimestamp).getTime() : 0;
          const tb = b.lastTimestamp ? new Date(b.lastTimestamp).getTime() : 0;
          return tb - ta;
        });

        setConversations(formattedConvs);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    loadConversations();

    // Poll for new messages every 3 seconds
    const interval = setInterval(loadConversations, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Load messages when chat is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChat) return;

      setLoading(true);
      try {
        const response = await fetch(
          `${API_URL}/messages/conversation/${encodeURIComponent(currentUser)}/${encodeURIComponent(selectedChat)}`
        );

        if (!response.ok) return;

        const data = await response.json();
        const container = messagesContainerRef.current;
        const prevHeight = container ? container.scrollHeight : null;
        const prevTop = container ? container.scrollTop : null;

        const sorted = [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setMessages(sorted);

        // Mark as read
        await fetch(`${API_URL}/messages/mark-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser, otherUserId: selectedChat }),
        });

        // Update last seen
        setLastSeen((prev) => ({ ...prev, [selectedChat]: 'just now' }));

        // Restore scroll position relative to previous height if user was scrolled up
        if (container !== null && prevHeight !== null && prevTop !== null) {
          requestAnimationFrame(() => {
            const newHeight = container.scrollHeight;
            const delta = newHeight - prevHeight;
            container.scrollTop = prevTop + delta;
          });
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Poll for new messages in active chat every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedChat, currentUser]);

  // Auto-select chat if coming from profile
  useEffect(() => {
    if (targetUser) {
      setSelectedChat(targetUser);
      // Add new conversation if doesn't exist
      if (!conversations.find(c => c.userId === targetUser)) {
        setConversations(prev => [
          {
            userId: targetUser,
            name: targetUser.split('@')[0],
            lastMessage: 'Start a conversation...',
            time: 'Now',
            unread: 0
          },
          ...prev
        ]);
      }
    }
  }, [targetUser, conversations]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChat) return;
    
    try {
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUser,
          receiver: selectedChat,
          text: inputText
        })
      });
      
      if (response.ok) {
        const { data } = await response.json();
        setMessages(prev => [...prev, data]);
        
        // Update or add conversation to list
        setConversations(prev => {
          const existingIndex = prev.findIndex(conv => conv.userId === selectedChat);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              lastMessage: inputText,
              time: new Date(data.timestamp).toLocaleTimeString()
            };
            return updated;
          } else {
            // Add new conversation
            return [{
              userId: selectedChat,
              name: selectedChat.split('@')[0],
              lastMessage: inputText,
              time: new Date(data.timestamp).toLocaleTimeString(),
              unread: 0
            }, ...prev];
          }
        });
        
        setInputText('');

        // Scroll to bottom after sending
        // no auto scroll after send
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

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
          <div className="p-4 border-b space-y-3" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Messages</h2>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 text-sm rounded-lg border border-white/10 hover:border-brand-orange text-white hover:text-brand-orange transition"
              >
                Refresh
              </button>
            </div>
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
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {currentConversation?.role && <span>{currentConversation.role} • </span>}
                      {lastSeen[selectedChat] ? `Last seen ${lastSeen[selectedChat]}` : 'Online'}
                    </p>
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
              <div
                className="flex-1 overflow-y-auto p-6 space-y-4"
                ref={messagesContainerRef}
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center" style={{ color: 'var(--text-muted)' }}>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-center" style={{ color: 'var(--text-muted)' }}>
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const showSenderName = msg.sender !== currentUser && (index === 0 || messages[index - 1].sender === currentUser);
                    return (
                      <div key={msg.id} className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'} animate-slideIn`}>
                        <div className="max-w-[70%]">
                          {showSenderName && (
                            <p className="text-xs px-4 py-1 opacity-60" style={{ color: 'var(--text-muted)' }}>
                              {currentConversation?.name}
                            </p>
                          )}
                          <div className={`rounded-2xl px-4 py-3 shadow-lg hover:scale-[1.02] transition-all duration-200 ${
                            msg.sender === currentUser
                              ? 'bg-gradient-to-r from-brand-orange to-orange-600 text-white' 
                              : 'border border-white/10 backdrop-blur-sm'
                          }`}
                            style={msg.sender !== currentUser ? { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' } : {}}
                          >
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <p className="text-xs mt-1.5 opacity-70 flex items-center gap-1">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                              {msg.sender === currentUser && (
                                msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
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
import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTarget = searchParams.get('user');

  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('userEmail') || localStorage.getItem('userId'));
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(initialTarget || null);
  const [activeChatName, setActiveChatName] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Load conversations
  useEffect(() => {
    if (!currentUser) return;
    const loadConversations = async () => {
      try {
        const res = await fetch(`${API_URL}/messages/conversations/${encodeURIComponent(currentUser)}`);
        if (!res.ok) return;
        const data = await res.json();
        setConversations(data);
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    };
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Load messages for active chat
  useEffect(() => {
    if (!currentUser || !activeChat) return;
    
    let mounted = true;
    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/messages/conversation/${encodeURIComponent(currentUser)}/${encodeURIComponent(activeChat)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setMessages(data);
        
        // Mark messages as read
        await fetch(`${API_URL}/messages/mark-read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser, otherUserId: activeChat })
        });
        
        // Scroll to bottom
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }, 100);
      } catch (e) {
        console.error('Failed to load messages:', e);
      } finally {
        setLoading(false);
      }
    };
    
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => { mounted = false; clearInterval(interval); };
  }, [currentUser, activeChat]);

  // Update active chat name
  useEffect(() => {
    if (!activeChat) {
      setActiveChatName('');
      return;
    }
    const conv = conversations.find(c => c.otherUserId === activeChat);
    if (conv) {
      setActiveChatName(conv.otherUserName || activeChat.split('@')[0]);
    }
  }, [activeChat, conversations]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat || !currentUser) return;
    
    try {
      const res = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sender: currentUser, 
          receiver: activeChat, 
          text: text.trim() 
        })
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      const { data } = await res.json();
      setMessages(prev => [...prev, data]);
      setText('');
      
      // Refresh conversations
      const convRes = await fetch(`${API_URL}/messages/conversations/${encodeURIComponent(currentUser)}`);
      if (convRes.ok) {
        setConversations(await convRes.json());
      }
      
      // Scroll to bottom
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 pt-24 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-brand-orange mx-auto mb-4" />
          <p className="text-brand-text text-lg">Please log in to access messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark p-4 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Messages</h1>
        
        <div className="flex gap-4 h-[calc(100vh-200px)] bg-brand-card rounded-2xl border border-white/10 overflow-hidden">
          {/* Conversations List */}
          <div className="w-96 border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Conversations</h2>
              <p className="text-sm text-brand-muted mt-1">{conversations.length} chat{conversations.length !== 1 ? 's' : ''}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-brand-muted">
                  <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.conversationId}
                    onClick={() => setActiveChat(conv.otherUserId)}
                    className={`p-4 cursor-pointer border-b border-white/5 transition-all ${
                      activeChat === conv.otherUserId
                        ? 'bg-brand-orange/10 border-l-4 border-l-brand-orange'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-white">{conv.otherUserName}</div>
                        <div className="text-sm text-brand-muted mt-1 truncate">
                          {conv.lastMessage?.text || 'No messages yet'}
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 px-2.5 py-1 bg-brand-orange text-white text-xs rounded-full font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveChat(null)}
                      className="p-2 hover:bg-white/10 rounded-lg transition text-brand-muted hover:text-white"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="font-bold text-white text-lg">{activeChatName}</h3>
                      <p className="text-xs text-brand-muted">Active now</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/profile/${activeChat}`)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm font-medium"
                  >
                    View Profile
                  </button>
                </div>

                {/* Messages Container */}
                <div
                  ref={containerRef}
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/0 to-white/3"
                >
                  {loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-brand-muted">
                      <p>Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-brand-muted text-center">
                      <div>
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No messages yet. Say hello! 👋</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-3 rounded-lg ${
                            msg.sender === currentUser
                              ? 'bg-brand-orange text-white'
                              : 'bg-white/10 text-white border border-white/20'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <form
                  onSubmit={sendMessage}
                  className="p-4 border-t border-white/10 flex gap-3"
                >
                  <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder={`Message ${activeChatName}...`}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-brand-muted focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim()}
                    className="px-4 py-3 bg-brand-orange hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-brand-muted">
                <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold">Select a conversation to start</p>
                <p className="text-sm mt-2">Choose from your conversations on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
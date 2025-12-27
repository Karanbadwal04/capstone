import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';

function Avatar({ name }) {
  const initials = (name || '').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-sm font-semibold text-white">
      {initials || '?'}
    </div>
  );
}

export default function Messages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTarget = searchParams.get('user');

  const [currentUser] = useState(() => localStorage.getItem('userEmail') || localStorage.getItem('userId'));
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(initialTarget || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    const load = async () => {
      try {
        const url = `${API_URL}/messages/conversations/${encodeURIComponent(currentUser)}`;
        console.log('Fetching conversations from:', url);
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Failed to fetch conversations:', res.status);
          return;
        }
        const data = await res.json();
        console.log('Conversations loaded:', data.length);
        setConversations(data);
      } catch (e) {
        console.error('Error loading conversations:', e);
      }
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !activeChat) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const url = `${API_URL}/messages/conversation/${encodeURIComponent(currentUser)}/${encodeURIComponent(activeChat)}`;
        console.log('Fetching messages from:', url);
        const res = await fetch(url);
        console.log('Response status:', res.status);
        if (!res.ok) {
          console.error('Failed to fetch messages:', res.status);
          return;
        }
        const data = await res.json();
        console.log('Messages loaded:', data.length);
        if (!mounted) return;
        setMessages(data);
        await fetch(`${API_URL}/messages/mark-read`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser, otherUserId: activeChat })
        });
        setTimeout(() => { if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight; }, 80);
      } catch (e) {
        console.error('Error loading messages:', e);
      } finally { setLoading(false); }
    };
    load();
    const t = setInterval(load, 3000);
    return () => { mounted = false; clearInterval(t); };
  }, [currentUser, activeChat]);

  const getName = (id) => {
    const c = conversations.find(x => x.otherUserId === id);
    return c?.otherUserName || id.split('@')[0];
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !activeChat) return;
    try {
      const res = await fetch(`${API_URL}/messages/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: currentUser, receiver: activeChat, text: text.trim() })
      });
      if (!res.ok) throw new Error('send failed');
      const { data } = await res.json();
      setMessages(prev => [...prev, data]);
      setText('');
      const convRes = await fetch(`${API_URL}/messages/conversations/${encodeURIComponent(currentUser)}`);
      if (convRes.ok) setConversations(await convRes.json());
      setTimeout(() => { if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight; }, 80);
    } catch (err) { console.error(err); }
  };

  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-8 pt-24">
      <div className="text-center text-white/90">
        <p className="text-xl font-semibold">Please log in to view messages</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-dark p-4 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Messages</h1>

        <div className="flex gap-4 h-[calc(100vh-200px)] bg-brand-card rounded-2xl border border-white/6 overflow-hidden shadow-lg">
          <aside className="w-80 border-r border-white/6 flex flex-col">
            <div className="p-4 border-b border-white/6">
              <div>
                <div className="text-lg font-bold text-white">Conversations</div>
                <div className="text-sm text-white/60">{conversations.length} chats</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-white/60">No conversations yet</div>
              ) : (
                conversations.map(conv => (
                  <div key={conv.conversationId} onClick={() => {
                    console.log('Clicked conversation:', conv.otherUserId);
                    setActiveChat(conv.otherUserId);
                  }}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition ${activeChat === conv.otherUserId ? 'bg-white/6 border-l-4 border-l-brand-orange' : 'hover:bg-white/5'}`}>
                    <Avatar name={conv.otherUserName} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-white truncate">{conv.otherUserName}</div>
                        <div className="text-xs text-white/50">{conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</div>
                      </div>
                      <div className="text-sm text-white/60 truncate mt-1">{conv.lastMessage?.text || 'No messages yet'}</div>
                    </div>
                    {conv.unreadCount > 0 && <span className="ml-2 px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full">{conv.unreadCount}</span>}
                  </div>
                ))
              )}
            </div>
          </aside>

          <main className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                <header className="flex items-center justify-between p-4 border-b border-white/6">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveChat(null)} className="p-2 rounded-md hover:bg-white/5 text-white/70">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Avatar name={getName(activeChat)} />
                    <div>
                      <div className="font-semibold text-white">{getName(activeChat)}</div>
                      <div className="text-xs text-white/60">Conversation</div>
                    </div>
                  </div>
                  <button onClick={() => navigate(`/profile/${activeChat}`)} className="px-3 py-2 rounded-md bg-white/6 text-white hover:bg-white/10">View Profile</button>
                </header>

                <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/3">
                  {loading && messages.length === 0 ? (
                    <div className="text-center text-white/60">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-white/60">No messages yet. Say hello 👋</div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-3 rounded-xl ${msg.sender === currentUser ? 'bg-brand-orange text-white' : 'bg-white/6 text-white'}`}>
                          <div className="text-sm">{msg.text}</div>
                          <div className="text-xs text-white/60 mt-2">{new Date(msg.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-white/6 flex items-center gap-3">
                  <input value={text} onChange={e => setText(e.target.value)} placeholder={`Message ${getName(activeChat)}...`} 
                    className="flex-1 px-4 py-3 rounded-full bg-white/6 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-orange/20" />
                  <button type="submit" disabled={!text.trim()} className="px-4 py-2 bg-brand-orange rounded-full text-white disabled:opacity-60">
                    <Send className="w-4 h-4 inline-block" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-white/60">
                <div>
                  <div className="text-2xl font-semibold mb-2">Select a conversation</div>
                  <div className="text-sm">Pick a chat from the left to start messaging</div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

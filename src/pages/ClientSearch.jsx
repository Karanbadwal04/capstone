import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, DollarSign, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClientSearch() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    maxPrice: 100000,
    minRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGigs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [gigs, filters, searchTerm]);

  const fetchGigs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/gigs/all');
      if (response.ok) {
        const data = await response.json();
        setGigs(data);
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = gigs;

    // Search filter
    if (searchTerm) {
      result = result.filter(g =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      result = result.filter(g => g.category === filters.category);
    }

    // Price filter
    result = result.filter(g => g.price <= filters.maxPrice);

    // Rating filter
    result = result.filter(g => (g.rating || 0) >= filters.minRating);

    setFiltered(result);
  };

  const handleHire = (gigId) => {
    // Navigate to hiring/escrow page
    window.location.href = `/client-hire/${gigId}`;
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 animate-float opacity-20">
        <div className="w-40 h-40 bg-gradient-to-br from-brand-orange/60 to-purple-500/60 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-40 left-10 animate-float-delayed opacity-20">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500/60 to-cyan-500/60 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl font-bold text-white mb-8">Find & Hire Services</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-brand-muted" />
            <input
              type="text"
              placeholder="Search for coding, design, writing, tutoring..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-brand-card rounded-lg border border-white/10 text-white placeholder-brand-muted focus:border-brand-orange outline-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-brand-card rounded-xl p-6 border border-white/10 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </h3>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full bg-brand-dark rounded-lg px-3 py-2 text-white border border-white/10 focus:border-brand-orange outline-none text-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="coding">Coding</option>
                  <option value="design">Design</option>
                  <option value="writing">Writing</option>
                  <option value="tutoring">Tutoring</option>
                  <option value="video">Video Editing</option>
                </select>
              </div>

              {/* Price */}
              <div className="mb-6">
                <label className="block text-white text-sm font-semibold mb-2">Max Price: ₹{filters.maxPrice}</label>
                <input
                  type="range"
                  min="1"
                  max="100000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                  className="w-full bg-brand-dark rounded-lg px-3 py-2 text-white border border-white/10 focus:border-brand-orange outline-none text-sm"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gigs Grid */}
          <div className="md:col-span-3">
            {loading ? (
              <p className="text-brand-muted">Loading services...</p>
            ) : filtered.length === 0 ? (
              <div className="bg-brand-card rounded-xl p-12 text-center border border-white/10">
                <p className="text-brand-muted">No services found. Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filtered.map(gig => (
                  <div key={gig.id} className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group relative overflow-hidden">
                    {/* Hover Gradient Effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-orange/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-orange transition-colors">{gig.title}</h3>
                          <p className="text-brand-muted text-sm mb-2">{gig.description.substring(0, 150)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-brand-orange group-hover:scale-110 transition-transform">₹{gig.price}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 mb-4 flex-wrap">
                        <span className="bg-gradient-to-r from-brand-orange/20 to-orange-500/20 border border-brand-orange/30 px-4 py-1.5 rounded-full text-xs text-brand-orange font-semibold backdrop-blur-sm">{gig.category}</span>
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 px-4 py-1.5 rounded-full text-xs backdrop-blur-sm">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 font-semibold">{gig.rating || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 px-4 py-1.5 rounded-full text-xs text-blue-400 font-semibold backdrop-blur-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{gig.deliveryDays} days</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative group/avatar">
                            <div className="absolute inset-0 bg-brand-orange rounded-full blur-md opacity-50 group-hover/avatar:opacity-75 transition-opacity"></div>
                            <div className="relative w-10 h-10 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-sm">{gig.seller?.name?.charAt(0) || 'S'}</span>
                            </div>
                          </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{gig.seller?.name || 'Student'}</p>
                          {gig.seller?.verified && <p className="text-xs text-green-400">✓ Verified</p>}
                        </div>
                        {gig.seller?.email && (
                          <button
                            onClick={() => navigate(`/profile/${gig.seller.email}`)}
                            className="ml-2 p-1.5 hover:bg-brand-orange/20 rounded-lg transition"
                            title="View Profile"
                          >
                            <User className="w-4 h-4 text-brand-orange" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleHire(gig.id)}
                        className="px-6 py-2.5 rounded-lg font-semibold border-2 border-brand-orange transition-all duration-300 shadow-lg hover:shadow-brand-orange/50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-orange/60"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--brand-orange, #f97316)';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                      >
                        Hire Now
                      </button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

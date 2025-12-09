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
    maxPrice: 1000,
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
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-7xl mx-auto">
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
                <label className="block text-white text-sm font-semibold mb-2">Max Price: ${filters.maxPrice}</label>
                <input
                  type="range"
                  min="1"
                  max="1000"
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
                  <div key={gig.id} className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{gig.title}</h3>
                        <p className="text-brand-muted text-sm mb-2">{gig.description.substring(0, 150)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-brand-orange">${gig.price}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-4 flex-wrap">
                      <span className="bg-brand-dark px-3 py-1 rounded-full text-xs text-brand-orange">{gig.category}</span>
                      <div className="flex items-center gap-1 bg-brand-dark px-3 py-1 rounded-full text-xs">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-white">{gig.rating || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-brand-dark px-3 py-1 rounded-full text-xs text-brand-muted">
                        <Clock className="w-3 h-3" />
                        <span>{gig.deliveryDays} days</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{gig.seller?.name?.charAt(0) || 'S'}</span>
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
                        className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition font-semibold"
                      >
                        Hire Now
                      </button>
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

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function StudentGigs() {
  const [gigs, setGigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'coding',
    deliveryDays: 1
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateGig = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/gigs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newGig = await response.json();
        setGigs([...gigs, newGig]);
        setFormData({ title: '', description: '', price: '', category: 'coding', deliveryDays: 1 });
        setShowForm(false);
        alert('Gig created successfully!');
        // Reload gigs from server
        fetchGigs();
      } else {
        const error = await response.json();
        alert('Error creating gig: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating gig');
    }
  };

  const fetchGigs = async () => {
    try {
      const response = await fetch(`${API_URL}/gigs/all`);
      if (response.ok) {
        const allGigs = await response.json();
        setGigs(allGigs);
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
    }
  };

  const deleteGig = (id) => {
    if (window.confirm('Are you sure?')) {
      setGigs(gigs.filter(g => g.id !== id));
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">My Gigs (Services)</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-brand-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition"
          >
            <Plus className="w-5 h-5" /> Create New Gig
          </button>
        </div>

        {/* Create Gig Form */}
        {showForm && (
          <div className="bg-brand-card rounded-2xl p-8 border border-white/10 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create a New Gig</h2>
            <form onSubmit={handleCreateGig} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">Gig Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., I will review your thesis for ₹2000"
                  required
                  className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what you'll deliver, requirements, and quality standards..."
                  rows="4"
                  required
                  className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none"
                  >
                    <option value="coding">Coding</option>
                    <option value="design">Design</option>
                    <option value="writing">Writing</option>
                    <option value="tutoring">Tutoring</option>
                    <option value="video">Video Editing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="20"
                    required
                    min="1"
                    className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Delivery Days</label>
                  <input
                    type="number"
                    name="deliveryDays"
                    value={formData.deliveryDays}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-brand-orange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
                >
                  Publish Gig
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gigs List */}
        <div className="space-y-4">
          {gigs.length === 0 ? (
            <div className="bg-brand-card rounded-2xl p-8 border border-white/10 text-center">
              <p className="text-brand-muted">No gigs yet. Create your first gig to start earning!</p>
            </div>
          ) : (
            gigs.map(gig => (
              <div key={gig.id} className="bg-brand-card rounded-xl p-6 border border-white/10 flex justify-between items-start hover:border-brand-orange/50 transition">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{gig.title}</h3>
                  <p className="text-brand-muted mb-4">{gig.description.substring(0, 100)}...</p>
                  <div className="flex gap-4">
                    <span className="text-sm bg-brand-dark px-3 py-1 rounded-full text-brand-orange">{gig.category}</span>
                    <span className="text-sm bg-brand-dark px-3 py-1 rounded-full text-white">{gig.deliveryDays} days delivery</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-3xl font-bold text-brand-orange mb-4">₹{gig.price}</p>
                  <div className="flex gap-2">
                    <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                      <Edit className="w-5 h-5 text-white" />
                    </button>
                    <button onClick={() => deleteGig(gig.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

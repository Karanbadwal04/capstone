import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Shield, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, transactions: 0, disputes: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      navigate('/');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4" style={{ backgroundColor: 'var(--bg-dark)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl p-8 mb-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Admin Control Panel</h1>
              <p style={{ color: 'var(--text-muted)' }}>Manage Micro-Job platform</p>
            </div>
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/30">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Super Admin</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Users Card */}
          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Users</p>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.users}</h3>
              </div>
              <Users className="w-12 h-12 text-brand-orange opacity-50" />
            </div>
          </div>

          {/* Transactions Card */}
          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Transactions</p>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.transactions}</h3>
              </div>
              <BarChart3 className="w-12 h-12 text-brand-orange opacity-50" />
            </div>
          </div>

          {/* Disputes Card */}
          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Disputes</p>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.disputes}</h3>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Users Management */}
          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Users className="w-5 h-5 text-brand-orange" /> User Management
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                View All Users
              </button>
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                Ban/Suspend Users
              </button>
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                Verify Accounts
              </button>
            </div>
          </div>

          {/* Transactions Management */}
          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BarChart3 className="w-5 h-5 text-brand-orange" /> Transaction Management
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                View All Transactions
              </button>
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                Manage Disputes
              </button>
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                Refund Requests
              </button>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Shield className="w-5 h-5 text-brand-orange" /> Platform Settings
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                Commission Settings
              </button>
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                Category Management
              </button>
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                Reports & Analytics
              </button>
            </div>
          </div>

          {/* Reports */}
          <div className="rounded-xl p-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <AlertCircle className="w-5 h-5 text-brand-orange" /> Reports
            </h2>
            <div className="space-y-3">
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                Flagged Content
              </button>
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                User Complaints
              </button>
              <button className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold">
                Generate Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

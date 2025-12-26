import React, { useState, useEffect } from 'react';
import { TrendingUp, Lock, CheckCircle, Clock } from 'lucide-react';

export default function StudentEarnings() {
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    inEscrow: 0,
    available: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/student/earnings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEarnings(data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Wallet & Earnings</h1>

        {/* Earnings Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Earned */}
          <div className="bg-brand-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brand-muted text-sm">Total Earned</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-white">₹{earnings.totalEarned.toFixed(2)}</h3>
          </div>

          {/* In Escrow (Locked) */}
          <div className="bg-brand-card rounded-xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brand-muted text-sm">In Escrow (Locked)</p>
              <Lock className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold text-yellow-400">₹{earnings.inEscrow.toFixed(2)}</h3>
            <p className="text-xs text-brand-muted mt-2">Waiting for client approval</p>
          </div>

          {/* Available to Withdraw */}
          <div className="bg-brand-card rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brand-muted text-sm">Available</p>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-green-400">₹{earnings.available.toFixed(2)}</h3>
            <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition text-sm font-semibold">
              Withdraw
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-brand-card rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">How Your Earnings Work</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">1</div>
              <div>
                <p className="text-white font-semibold">Client deposits payment</p>
                <p className="text-brand-muted text-sm">Client deposits funds into escrow vault for security</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">2</div>
              <div>
                <p className="text-white font-semibold">You deliver work</p>
                <p className="text-brand-muted text-sm">Submit your completed work through the dashboard</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">3</div>
              <div>
                <p className="text-white font-semibold">Money goes to "In Escrow"</p>
                <p className="text-brand-muted text-sm">Funds are locked and shown here while client reviews</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">4</div>
              <div>
                <p className="text-white font-semibold">Client approves or revises</p>
                <p className="text-brand-muted text-sm">Approve = Funds move to Available. Revise = Work stays locked</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-brand-card rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
          {earnings.transactions.length === 0 ? (
            <p className="text-brand-muted">No transactions yet. Start completing gigs to earn money!</p>
          ) : (
            <div className="space-y-4">
              {earnings.transactions.map((tx, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-brand-dark rounded-lg border border-white/5">
                  <div className="flex items-center gap-4">
                    {tx.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                    <div>
                      <p className="text-white font-semibold">{tx.title}</p>
                      <p className="text-brand-muted text-sm">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">₹{tx.amount.toFixed(2)}</p>
                    <p className="text-xs text-brand-muted capitalize">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

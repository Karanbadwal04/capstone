import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react';

export default function ClientTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/client/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in_escrow':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'pending_approval':
        return 'bg-blue-500/20 text-blue-400';
      case 'disputed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-brand-orange/20 text-brand-orange';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'in_escrow':
        return <Lock className="w-5 h-5" />;
      case 'pending_approval':
        return <Clock className="w-5 h-5" />;
      case 'disputed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">My Purchases & Transactions</h1>

        {loading ? (
          <p className="text-brand-muted">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div className="bg-brand-card rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-brand-muted mb-4">No transactions yet. Start hiring to see them here!</p>
            <a href="/client-search" className="inline-block bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition">
              Browse Services
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(tx => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(selectedTx?.id === tx.id ? null : tx)}
                className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{tx.gigTitle}</h3>
                    <p className="text-brand-muted text-sm mb-4">Seller: {tx.sellerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-orange mb-2">₹{tx.amount.toFixed(2)}</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tx.status)}`}>
                      {getStatusIcon(tx.status)}
                      {tx.status.replace(/_/g, ' ').toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedTx?.id === tx.id && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-brand-muted text-sm mb-1">Order Date</p>
                        <p className="text-white">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-sm mb-1">Delivery Date</p>
                        <p className="text-white">{new Date(tx.deliveryDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-sm mb-1">Category</p>
                        <p className="text-white capitalize">{tx.category}</p>
                      </div>
                      <div>
                        <p className="text-brand-muted text-sm mb-1">Commission</p>
                        <p className="text-white">₹{(tx.amount * 0.1).toFixed(2)} (10%)</p>
                      </div>
                    </div>

                    {/* Status-specific Actions */}
                    <div className="space-y-3">
                      {tx.status === 'in_escrow' && (
                        <>
                          <p className="text-yellow-400 text-sm font-semibold flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Work submitted! Review and approve/reject below.
                          </p>
                          <div className="flex gap-3">
                            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-semibold">
                              Approve & Release Payment
                            </button>
                            <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg transition font-semibold">
                              Request Revision
                            </button>
                          </div>
                        </>
                      )}

                      {tx.status === 'pending_approval' && (
                        <p className="text-blue-400 text-sm flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Waiting for seller to submit work...
                        </p>
                      )}

                      {tx.status === 'completed' && (
                        <div>
                          <p className="text-green-400 text-sm flex items-center gap-2 mb-3">
                            <CheckCircle className="w-4 h-4" /> Completed!
                          </p>
                          <div>
                            <p className="text-white text-sm font-semibold mb-2">Your Rating:</p>
                            <div className="flex gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map(i => (
                                <button key={i} className="text-2xl hover:scale-125 transition">
                                  {i <= (tx.rating || 0) ? '⭐' : '☆'}
                                </button>
                              ))}
                            </div>
                            {tx.review && <p className="text-brand-muted text-sm italic">"{tx.review}"</p>}
                          </div>
                        </div>
                      )}

                      {/* Chat Button */}
                      <button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Chat with Seller
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

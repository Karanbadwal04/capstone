import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, Clock, MessageSquare, Star, Loader } from 'lucide-react';
import { API_URL } from '../config/apiConfig';

export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [approving, setApproving] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const clientId = 2; // Get from auth context in real app

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/client/${clientId}`);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'deposit_pending': return 'bg-blue-500/20 text-blue-400';
      case 'in_escrow': return 'bg-yellow-500/20 text-yellow-400';
      case 'in_progress': return 'bg-orange-500/20 text-orange-400';
      case 'submitted_for_review': return 'bg-purple-500/20 text-purple-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'disputed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/10 text-white';
    }
  };

  const handleApprove = async (orderId) => {
    try {
      setApproving(orderId);
      const response = await fetch(`${API_URL}/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: rating || 5,
          review: review
        })
      });
      const data = await response.json();
      setOrders(orders.map(o => o.id === orderId ? data.order : o));
      setSelectedOrder(null);
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setApproving(null);
    }
  };

  const handleRequestRevision = async (orderId) => {
    try {
      setApproving(orderId);
      const response = await fetch(`${API_URL}/orders/${orderId}/request-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revisionRequest: 'Please make the requested changes'
        })
      });
      const data = await response.json();
      setOrders(orders.map(o => o.id === orderId ? data.order : o));
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to request revision:', error);
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">My Purchases</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-brand-orange animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-brand-card rounded-2xl p-12 text-center border border-white/10">
            <p className="text-brand-muted mb-4">No orders yet. Start hiring verified students!</p>
            <a href="/client/search" className="inline-block bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition">
              Browse Services
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition cursor-pointer"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{order.gigTitle}</h3>
                    <p className="text-brand-muted text-sm">Student: {order.studentName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-orange mb-2">₹{order.amount}</p>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'deposit_pending' ? 'bg-blue-500/20 text-blue-400' :
                      order.status === 'in_escrow' ? 'bg-yellow-500/20 text-yellow-400' :
                      order.status === 'in_progress' ? 'bg-orange-500/20 text-orange-400' :
                      order.status === 'submitted_for_review' ? 'bg-purple-500/20 text-purple-400' :
                      order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {order.status === 'deposit_pending' && '💳 Deposit Pending'}
                      {order.status === 'in_escrow' && '🔒 Funds Locked'}
                      {order.status === 'in_progress' && '⏳ Working'}
                      {order.status === 'submitted_for_review' && '👀 Awaiting Review'}
                      {order.status === 'completed' && '✅ Completed'}
                      {order.status === 'disputed' && '⚠️ Disputed'}
                      {order.status === 'revision_requested' && '🔄 Revision Requested'}
                    </div>
                  </div>
                </div>

                {/* Escrow Status */}
                <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="bg-brand-dark rounded-lg p-3 border border-white/5 flex items-center gap-3">
                    <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="text-brand-muted">In Escrow</p>
                      <p className="text-white font-semibold">₹{order.amount}</p>
                    </div>
                  </div>
                  <div className="bg-brand-dark rounded-lg p-3 border border-white/5">
                    <p className="text-brand-muted">Locked Since</p>
                    <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status Explanation */}
                {order.status === 'in_escrow' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-yellow-400">🔒 Payment locked safely. Student is working on your project.</p>
                  </div>
                )}

                {order.status === 'in_progress' && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-orange-400">⏳ Student is actively working. Check progress via chat.</p>
                  </div>
                )}

                {order.status === 'submitted_for_review' && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-purple-400">👀 Work submitted! Review and approve below.</p>
                  </div>
                )}

                {order.status === 'revision_requested' && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-orange-400">🔄 Student is working on your revisions. Funds remain locked.</p>
                  </div>
                )}

                {/* Expanded Details */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-brand-muted text-sm">Created</p>
                        <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      {order.submittedAt && (
                        <div>
                          <p className="text-brand-muted text-sm">Work Submitted</p>
                          <p className="text-white">{new Date(order.submittedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Status-Specific Actions */}
                    {order.status === 'submitted_for_review' && (
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mt-4">
                        <p className="text-white font-semibold mb-4">Review the work and approve or request revision</p>
                        <div className="space-y-3">
                          <button
                            onClick={() => handleApprove(order.id)}
                            disabled={approving === order.id}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2"
                          >
                            {approving === order.id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Approve & Release Payment
                          </button>
                          <button
                            onClick={() => handleRequestRevision(order.id)}
                            disabled={approving === order.id}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white py-2 rounded-lg transition font-semibold"
                          >
                            Request Revision
                          </button>
                        </div>
                      </div>
                    )}

                    {order.status === 'revision_requested' && (
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mt-4">
                        <p className="text-orange-400 font-semibold mb-3">🔄 Awaiting revised work from student</p>
                        <p className="text-brand-muted text-sm">Your payment remains locked in escrow until revisions are complete and approved.</p>
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-4">
                        <p className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Work Approved!
                        </p>
                        {!order.rating || order.rating === 0 ? (
                          <div>
                            <p className="text-white mb-3 font-semibold">Rate your experience:</p>
                            <div className="flex gap-2 mb-3">
                              {[1, 2, 3, 4, 5].map(i => (
                                <button
                                  key={i}
                                  onClick={() => setRating(i)}
                                  className="text-3xl hover:scale-125 transition"
                                >
                                  {i <= rating ? '⭐' : '☆'}
                                </button>
                              ))}
                            </div>
                            <textarea
                              value={review}
                              onChange={(e) => setReview(e.target.value)}
                              placeholder="Leave a review..."
                              className="w-full bg-brand-dark rounded-lg px-3 py-2 text-white border border-white/10 text-sm mb-2"
                            ></textarea>
                            <button
                              onClick={() => handleApprove(order.id)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition text-sm"
                            >
                              Submit Review
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map(i => (
                                <span key={i}>{i <= order.rating ? '⭐' : '☆'}</span>
                              ))}
                            </div>
                            <p className="text-brand-muted text-sm">✓ You've already reviewed this order</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chat Button */}
                    <button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Chat with Student
                    </button>
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

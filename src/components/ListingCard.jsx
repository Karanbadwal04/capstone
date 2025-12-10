import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import PaymentModal from './PaymentModal';

export default function ListingCard({ title, price, image }) {
  const [showModal, setShowModal] = useState(false);

  const handlePaymentConfirm = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          amount: price,
          studentId: 1,
          clientId: 999
        })
      });
      const data = await response.json();
      console.log('Payment submitted:', data);
      setShowModal(false);
      alert(`✓ Payment proof submitted!\nTransaction ID: ${data.transaction.id}\nWaiting for admin verification...`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting payment. Please try again.');
    }
  };

  return (
    <>
      <div className="bg-brand-card rounded-lg overflow-hidden hover:border-brand-orange border-2 border-transparent transition flex flex-col h-full group">
        {image && <img src={image} alt={title} className="w-full h-40 object-cover group-hover:opacity-80 transition" />}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-white font-semibold mb-2">{title}</h3>
          <p className="text-brand-orange font-bold text-lg mb-4">₹{price}</p>
          
          <button 
            onClick={() => setShowModal(true)}
            className="w-full mt-auto bg-brand-orange text-white font-bold py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Hire Me
          </button>
        </div>
      </div>

      <PaymentModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handlePaymentConfirm}
        amount={price}
      />
    </>
  );
}
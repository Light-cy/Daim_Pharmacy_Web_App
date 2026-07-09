import React, { useRef } from 'react';
import { updateDocument } from '../../services/dbService';
import ModalWrapper from '../common/ModalWrapper';

const OrderModal = React.memo(({ order, onClose }) => {
  const printRef = useRef(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  if (!order) return null;

  // Parse itemsJson safely
  let items = [];
  try {
    items = JSON.parse(order.itemsJson || '[]');
  } catch (e) {
    console.error("Failed to parse itemsJson", e);
  }

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    // Create a temporary style for printing
    const style = document.createElement('style');
    style.innerHTML = `
      @page { margin: 0; }
      @media print {
        body { margin: 1.5cm; }
        body * { visibility: hidden; }
        #print-section, #print-section * { visibility: visible; }
        #print-section { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    const printContainer = document.createElement('div');
    printContainer.id = 'print-section';
    printContainer.innerHTML = printContents;
    document.body.appendChild(printContainer);

    window.print();

    document.body.removeChild(printContainer);
    document.head.removeChild(style);
  };

  const handleMarkComplete = async () => {
    setIsUpdating(true);
    try {
      const docId = order._docId || order.id.toString();
      await updateDocument('orders', docId, { status: 'completed' });
      onClose();
    } catch (err) {
      console.error("Failed to update order status", err);
      alert('Failed to update status. See console for details.');
      setIsUpdating(false);
    }
  };

  const getCategoryAbbreviation = (category) => {
    if (!category) return '';
    const cat = category.toLowerCase();
    if (cat.includes('tablet')) return 'Tab.';
    if (cat.includes('syrup')) return 'Syp.';
    if (cat.includes('capsule')) return 'Cap.';
    if (cat.includes('injection')) return 'Inj.';
    if (cat.includes('cream')) return 'Crm.';
    if (cat.includes('drop')) return 'Drp.';
    if (cat.includes('ointment')) return 'Oint.';
    // Fallback: take first 3 letters capitalized + dot, or just original
    return category.substring(0, 3).charAt(0).toUpperCase() + category.substring(1, 3).toLowerCase() + '.';
  };

  return (
    <ModalWrapper title="Order Details" onClose={onClose} maxWidth="600px">
      <div style={{ position: 'relative' }}>
        {/* Printable Section */}
        <div ref={printRef} style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', color: '#000' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px dashed #cbd5e1', paddingBottom: '16px' }}>
            <h1 style={{ fontSize: '1.8rem', margin: '0 0 8px 0', color: '#0f172a' }}>Daimpharmacy</h1>
            <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>Official Order Slip</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.95rem' }}>
            <div>
              <p style={{ margin: '0 0 4px 0' }}><strong>Order ID:</strong> {order.id}</p>
              <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px 0' }}><strong>Doctor / Customer:</strong></p>
              <p style={{ margin: 0, fontWeight: '600' }}>{order.doctorName || 'Unknown'}</p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#334155' }}>Item Description</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 0' }}>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '1.05rem' }}>
                      <span style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>{getCategoryAbbreviation(item.category)}</span> {item.medicineName} x {item.quantity}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.formula}</span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>No items found in this order.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ textAlign: 'center', marginTop: '32px', color: '#64748b', fontSize: '0.85rem' }}>
            <p style={{ margin: 0 }}>Thank you for choosing Daimpharmacy.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }} className="no-print">
          <button onClick={handlePrint} disabled={isUpdating} className="btn" style={{ background: '#f1f5f9', color: '#334155', opacity: isUpdating ? 0.5 : 1 }}>
            🖨️ Print Slip
          </button>
          
          {order.status !== 'completed' && (
            <button 
              onClick={handleMarkComplete} 
              disabled={isUpdating}
              className="btn btn-primary" 
              style={{ background: '#10b981', opacity: isUpdating ? 0.7 : 1, cursor: isUpdating ? 'wait' : 'pointer' }}
            >
              {isUpdating ? '⏳ Completing...' : '✓ Mark as Complete'}
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
});

export default OrderModal;

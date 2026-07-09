import React, { useState, useMemo } from 'react';
import { useFirestoreRealtime } from '../../hooks/useFirestoreRealtime';

const ExpiryTracker = ({ onEdit }) => {
  const { data: medicines, loading } = useFirestoreRealtime('medicines');
  
  // Default to current year-month (YYYY-MM)
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const { filteredMedicines, totalExpired, totalExpiringInMonth } = useMemo(() => {
    if (!medicines) return { filteredMedicines: [], totalExpired: 0, totalExpiringInMonth: 0 };
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Thirty days from today
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    let expiredCount = 0;
    const filtered = [];
    
    medicines.forEach(med => {
      if (!med.expiryDate) return;
      
      const expiry = new Date(med.expiryDate);
      
      if (expiry < today) {
        expiredCount++;
      }
      
      const medMonthStr = med.expiryDate.slice(0, 7);
      if (medMonthStr === selectedMonth) {
        // Calculate status color
        let status = 'normal';
        if (expiry < today) {
          status = 'expired';
        } else if (expiry <= thirtyDaysFromNow) {
          status = 'expiring-soon';
        }
        
        filtered.push({ ...med, status, parsedExpiry: expiry });
      }
    });
    
    filtered.sort((a, b) => a.parsedExpiry - b.parsedExpiry);
    
    return {
      filteredMedicines: filtered,
      totalExpired: expiredCount,
      totalExpiringInMonth: filtered.length
    };
  }, [medicines, selectedMonth]);

  if (loading) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Expiry Tracker</h3>
        <div className="shimmer" style={{ height: '400px', borderRadius: '8px' }}></div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1.5rem' }}>Expiry Tracker</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Track medicines expiring in the selected month.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontWeight: '500', color: 'var(--text-main)' }}>Select Month:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)} 
            className="input-field"
            style={{ width: 'auto' }}
          />
        </div>
      </div>

      {totalExpired > 0 && (
        <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '16px', marginBottom: '24px', borderRadius: '4px', color: '#b91c1c' }}>
          <strong>Alert:</strong> You have <strong>{totalExpired}</strong> medicines that are already expired across your entire inventory!
        </div>
      )}

      <div style={{ marginBottom: '16px', fontWeight: '500', color: 'var(--text-main)' }}>
        Total <span style={{ color: 'var(--primary-dark)' }}>{totalExpiringInMonth}</span> medicines expiring in {new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Image</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Medicine Name</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Stock</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Expiry Date</th>
              <th style={{ padding: '12px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.map(med => {
              const rowStyle = {
                borderBottom: '1px solid var(--border-color)',
                background: med.status === 'expired' ? '#fef2f2' : (med.status === 'expiring-soon' ? '#fffbeb' : '#fff'),
              };
              
              const textStyle = {
                color: med.status === 'expired' ? '#b91c1c' : (med.status === 'expiring-soon' ? '#b45309' : 'inherit')
              };

              return (
                <tr key={med.id} style={rowStyle}>
                  <td style={{ padding: '12px' }}>
                    <img 
                      src={med.imageUri || med.imageUrl || "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-size='30' text-anchor='middle' dy='.3em'%3E💊%3C/text%3E%3C/svg%3E"} 
                      alt={med.name} 
                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                  </td>
                  <td style={{ padding: '12px', fontWeight: '500', ...textStyle }}>
                    <div style={{ display: 'block', fontSize: '1.05rem' }}>{med.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{med.formula}</div>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{med.category}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{med.stock}</td>
                  <td style={{ padding: '12px', fontWeight: '600', ...textStyle }}>{med.parsedExpiry.toLocaleDateString()}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button 
                      onClick={() => onEdit && onEdit(med)}
                      style={{ background: '#f1f5f9', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredMedicines.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No medicines expiring in this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpiryTracker;

import React, { useState, useEffect } from 'react';
import { saveDocument } from '../../services/dbService';
import ModalWrapper from '../common/ModalWrapper';

const UserModal = React.memo(({ user, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'doctor'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: user.password || '',
        role: user.role || 'doctor'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = user?.id || `user_${Date.now()}`;
      
      const userData = {
        id: userId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        isActive: user?.isActive ?? true,
        lastOrderItemsJson: user?.lastOrderItemsJson || ""
      };

      await saveDocument('users', userId, userData);
      onClose();
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Failed to save user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title={user ? 'Edit User' : 'Add New User'} onClose={onClose} maxWidth="400px">
      <form onSubmit={handleSave}>
        <div className="input-group">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} className="input-field" required />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" required />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="text" name="password" value={formData.password} onChange={handleChange} className="input-field" required />
        </div>
        <div className="input-group">
          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange} className="input-field" required style={{ width: '100%' }}>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onClose} className="btn" style={{ background: '#f1f5f9' }}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
});

export default UserModal;

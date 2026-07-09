import React, { useState, useEffect } from 'react';
import { saveDocument } from '../../services/dbService';
import ModalWrapper from '../common/ModalWrapper';

const CategoryModal = React.memo(({ category, onClose }) => {
  const [formData, setFormData] = useState({
    name: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || ''
      });
    }
  }, [category]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create an ID based on name if adding new (e.g. "syrups"), else use existing
      const catId = category?.id || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const catData = {
        id: catId,
        name: formData.name
      };

      await saveDocument('categories', catId, catData);
      onClose();
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title={category ? 'Edit Category' : 'Add New Category'} onClose={onClose} maxWidth="400px">
      <form onSubmit={handleSave}>
        <div className="input-group">
          <label>Category Name</label>
          <input name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. Tablets" required />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button type="button" onClick={onClose} className="btn" style={{ background: '#f1f5f9' }}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
});

export default CategoryModal;

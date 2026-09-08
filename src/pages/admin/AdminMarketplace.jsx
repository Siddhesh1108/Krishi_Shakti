import React, { useState, useEffect } from 'react';
import { marketplaceService } from '../../lib/services';
import { ShoppingCart, Plus, CheckCircle, Edit, Trash2 } from 'lucide-react';

export function AdminMarketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await marketplaceService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  if (loading) return <div style={{ padding: 40, color: '#f8fafc' }}>Loading marketplace data...</div>;

  return (
    <div className="page-content admin-page-content">
      <div className="page-header admin-page-header">
        <div>
          <span className="eyebrow blue-eyebrow">COMMERCE OPERATIONS</span>
          <h1>Marketplace Inventory</h1>
        </div>
        <button className="button primary admin-button">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="panel admin-panel" style={{ marginTop: '24px', padding: '20px' }}>
        <div className="table-responsive">
          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>Product</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Price (₹)</th>
                <th style={{ padding: '12px' }}>Stock</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id} style={{ borderBottom: '1px solid #1e293b', color: '#f8fafc' }}>
                  <td style={{ padding: '12px' }}><strong>{prod.name}</strong></td>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>{prod.category}</td>
                  <td style={{ padding: '12px', color: '#38bdf8' }}>₹{prod.price}</td>
                  <td style={{ padding: '12px' }}>{prod.stock}</td>
                  <td style={{ padding: '12px' }}>
                    {prod.active ? <span className="status-pill healthy"><CheckCircle size={12} /> Active</span> : <span className="status-pill grey">Inactive</span>}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="icon-button"><Edit size={16} style={{ color: '#38bdf8' }}/></button>
                    <button className="icon-button"><Trash2 size={16} style={{ color: '#ef4444' }}/></button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>No products available in the database. Add one to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

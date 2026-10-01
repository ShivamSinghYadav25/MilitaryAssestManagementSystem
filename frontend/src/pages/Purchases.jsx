import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import API_URL from '../config/api';
const ASSET_TYPES = [
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'WEAPON', label: 'Weapon' },
  { value: 'AMMUNITION', label: 'Ammunition' },
];

const typeLabel = (v) => ASSET_TYPES.find((t) => t.value === v)?.label || v;
const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-2';
const thClass = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
const tdClass = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ assetType: 'VEHICLE', quantity: '', baseId: '', date: today() });
const emptyFilters = { base_id: '', type: '', start_date: '', end_date: '' };

const Purchases = () => {
  const { token, user } = useAuth();
  const canRecord = user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER';
  const isCommander = user?.role === 'BASE_COMMANDER';

  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm());
  const [filters, setFilters] = useState(emptyFilters);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchPurchases = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));

      const response = await fetch(`${API_URL}/api/purchases?${params}`, {
  headers: authHeaders
});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch purchases');

      setPurchases(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`${API_URL}/api/bases`, {
  headers: authHeaders
});
        const data = await response.json();
        setBases(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch bases:', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
    const response = await fetch(`${API_URL}/api/purchases`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...authHeaders
  },
  body: JSON.stringify(formData),
});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to record purchase');

      setFormData(emptyForm());
      setShowForm(false);
      fetchPurchases();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalUnits = purchases.reduce((sum, p) => sum + p.quantity, 0);
  const hasFilters = Object.values(filters).some(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
          {isCommander && (
            <p className="text-sm text-gray-500 mt-1">Showing purchases for your base (read-only)</p>
          )}
        </div>
        {canRecord && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {canRecord && showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Record New Purchase</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Asset Type</label>
              <select
                value={formData.assetType}
                onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                className={inputClass}
                required
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Base</label>
              <select
                value={formData.baseId}
                onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Select Base</option>
                {bases.map((base) => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="date"
                max={today()}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Submit Purchase'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Filter History</h3>
          <button
            onClick={() => setFilters(emptyFilters)}
            disabled={!hasFilters}
            className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400"
          >
            Clear All
          </button>
        </div>
        <div className={`grid grid-cols-1 gap-4 ${isCommander ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
          {!isCommander && (
            <div>
              <label className={labelClass}>Base</label>
              <select
                value={filters.base_id}
                onChange={(e) => setFilters({ ...filters, base_id: e.target.value })}
                className={inputClass}
              >
                <option value="">All Bases</option>
                {bases.map((base) => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelClass}>Equipment Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className={inputClass}
            >
              <option value="">All Types</option>
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              max={filters.end_date || undefined}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>End Date</label>
            <input
              type="date"
              value={filters.end_date}
              min={filters.start_date || undefined}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-200 text-sm text-gray-600">
          {purchases.length} record{purchases.length === 1 ? '' : 's'} &middot; {totalUnits} total units
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thClass}>Date</th>
                <th className={thClass}>Asset Type</th>
                <th className={thClass}>Quantity</th>
                <th className={thClass}>Base</th>
                <th className={thClass}>Logged By</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className={tdClass}>{new Date(purchase.date).toLocaleDateString()}</td>
                  <td className={tdClass}>{typeLabel(purchase.assetType)}</td>
                  <td className={tdClass}>{purchase.quantity}</td>
                  <td className={tdClass}>{purchase.base?.name}</td>
                  <td className={tdClass}>{purchase.user?.name}</td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">
                    No purchases found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Purchases;
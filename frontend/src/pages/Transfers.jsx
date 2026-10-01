import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, X, ArrowRight } from 'lucide-react';

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

const emptyForm = { assetType: 'VEHICLE', quantity: '', fromBaseId: '', toBaseId: '' };
const emptyFilters = { base_id: '', type: '', status: '', start_date: '', end_date: '' };

const statusColor = (status) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Transfers = () => {
  const { token, user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER';
  const isCommander = user?.role === 'BASE_COMMANDER';

  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [filters, setFilters] = useState(emptyFilters);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchTransfers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));

      const response = await fetch(`/api/transfers?${params}`, { headers: authHeaders });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch transfers');

      setTransfers(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, token]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/bases', { headers: authHeaders });
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
    if (formData.fromBaseId === formData.toBaseId) {
      alert('Source and destination base must be different');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create transfer');

      setFormData(emptyForm);
      setShowForm(false);
      fetchTransfers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateTransferStatus = async (id, status) => {
    const verb = status === 'COMPLETED' ? 'complete' : 'cancel';
    if (!window.confirm(`Are you sure you want to ${verb} this transfer?`)) return;

    try {
      const response = await fetch(`/api/transfers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update transfer');

      fetchTransfers();
    } catch (err) {
      alert(err.message);
      fetchTransfers();
    }
  };

  const hasFilters = Object.values(filters).some(Boolean);
  const colCount = canManage ? 8 : 7;

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
          <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
          {isCommander && (
            <p className="text-sm text-gray-500 mt-1">
              Showing transfers into and out of your base (read-only)
            </p>
          )}
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Transfer</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {canManage && showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Initiate Transfer</h2>
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
              <label className={labelClass}>From Base</label>
              <select
                value={formData.fromBaseId}
                onChange={(e) => setFormData({ ...formData, fromBaseId: e.target.value })}
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
              <label className={labelClass}>To Base</label>
              <select
                value={formData.toBaseId}
                onChange={(e) => setFormData({ ...formData, toBaseId: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Select Base</option>
                {bases
                  .filter((base) => String(base.id) !== formData.fromBaseId)
                  .map((base) => (
                    <option key={base.id} value={base.id}>{base.name}</option>
                  ))}
              </select>
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
                {submitting ? 'Submitting...' : 'Submit Transfer'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {!isCommander && (
            <div>
              <label className={labelClass}>Base (from or to)</label>
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
            <label className={labelClass}>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className={inputClass}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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
          {transfers.length} transfer{transfers.length === 1 ? '' : 's'}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={thClass}>Ref</th>
                <th className={thClass}>Timestamp</th>
                <th className={thClass}>Asset Type</th>
                <th className={thClass}>Quantity</th>
                <th className={thClass}>From</th>
                <th className={thClass}>To</th>
                <th className={thClass}>Status</th>
                {canManage && <th className={thClass}>Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-gray-50">
                  <td className={`${tdClass} text-gray-500`}>#{transfer.id}</td>
                  <td className={tdClass}>{new Date(transfer.timestamp).toLocaleString()}</td>
                  <td className={tdClass}>{typeLabel(transfer.assetType)}</td>
                  <td className={tdClass}>{transfer.quantity}</td>
                  <td className={tdClass}>{transfer.fromBase?.name}</td>
                  <td className={tdClass}>
                    <span className="inline-flex items-center space-x-1">
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <span>{transfer.toBase?.name}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(transfer.status)}`}>
                      {transfer.status}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {transfer.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateTransferStatus(transfer.id, 'COMPLETED')}
                            className="text-green-600 hover:text-green-800"
                            title="Complete"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateTransferStatus(transfer.id, 'CANCELLED')}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {transfers.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="px-6 py-8 text-center text-sm text-gray-500">
                    No transfers found
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

export default Transfers;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Package, ArrowLeftRight, ClipboardList, Filter, X } from 'lucide-react';
import API_URL from '../config/api';
const Dashboard = () => {
  const { token, user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showNetMovementModal, setShowNetMovementModal] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    base_id: '',
    type: ''
  });
  const [bases, setBases] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchBases();
  }, [filters, user]);

  const fetchMetrics = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.date) queryParams.append('date', filters.date);
      if (filters.base_id) queryParams.append('base_id', filters.base_id);
      if (filters.type) queryParams.append('type', filters.type);

      const response = await fetch(`${API_URL}/api/dashboard/metrics?${queryParams}`, {
  headers: { Authorization: `Bearer ${token}` },
});

      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

 const fetchBases = async () => {
  try {
    const response = await fetch(`${API_URL}/api/bases`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    setBases(data);
  } catch (error) {
    console.error('Failed to fetch bases:', error);
  }
};

  const clearFilters = () => {
    setFilters({ date: '', base_id: '', type: '' });
  };

  const MetricCard = ({ title, value, icon: Icon, color, onClick, subtitle }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition ${
        onClick ? 'hover:scale-105' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Filter Metrics</h3>
            <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 text-sm">
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base</label>
              <select
                value={filters.base_id}
                onChange={(e) => setFilters({ ...filters, base_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Bases</option>
                {bases.map((base) => (
                  <option key={base.id} value={base.id}>
                    {base.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Types</option>
                <option value="VEHICLE">Vehicle</option>
                <option value="WEAPON">Weapon</option>
                <option value="AMMUNITION">Ammunition</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <MetricCard
          title="Opening Balance"
          value={metrics?.openingBalance || 0}
          icon={Package}
          color="text-blue-600"
        />
        <MetricCard
          title="Closing Balance"
          value={metrics?.closingBalance || 0}
          icon={Package}
          color="text-green-600"
        />
        <MetricCard
          title="Net Movement"
          value={metrics?.netMovement || 0}
          icon={metrics?.netMovement >= 0 ? TrendingUp : TrendingDown}
          color={metrics?.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}
          onClick={() => setShowNetMovementModal(true)}
          subtitle="Click for details"
        />
        <MetricCard
          title="Assigned"
          value={metrics?.assigned || 0}
          icon={ClipboardList}
          color="text-purple-600"
        />
        <MetricCard
  title="Expended"
  value={metrics?.expended || 0}
  icon={ArrowLeftRight}
  color="text-orange-600"
/>
      </div>

      {showNetMovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Net Movement Breakdown</h2>
              <button
                onClick={() => setShowNetMovementModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-700">Purchases</span>
                <span className="text-2xl font-bold text-green-600">+{metrics?.breakdown?.purchases || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-700">Transfers In</span>
                <span className="text-2xl font-bold text-blue-600">+{metrics?.breakdown?.transfersIn || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-700">Transfers Out</span>
                <span className="text-2xl font-bold text-red-600">-{metrics?.breakdown?.transfersOut || 0}</span>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Net Movement</span>
                  <span className={`text-2xl font-bold ${metrics?.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics?.netMovement >= 0 ? '+' : ''}{metrics?.netMovement || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

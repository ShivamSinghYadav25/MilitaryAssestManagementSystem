import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, RotateCcw, User, Zap } from 'lucide-react';

const Assignments = () => {
  const { token, user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [assets, setAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('assignments');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignmentForm, setAssignmentForm] = useState({
    assetId: '',
    personnelName: ''
  });
  const [expenditureForm, setExpenditureForm] = useState({
    assetId: '',
    quantityExpended: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignRes, expendRes, assetRes] = await Promise.all([
        fetch('/api/assignments', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/expenditures', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/assets', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAssignments(await assignRes.json());
      setExpenditures(await expendRes.json());
      setAssets(await assetRes.json());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignmentForm),
      });

      if (!response.ok) throw new Error('Failed to create assignment');

      setAssignmentForm({ assetId: '', personnelName: '' });
      setShowAssignmentForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create assignment:', error);
      alert('Failed to create assignment');
    }
  };

  const handleExpenditureSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/expenditures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenditureForm),
      });

      if (!response.ok) throw new Error('Failed to create expenditure');

      setExpenditureForm({ assetId: '', quantityExpended: '', reason: '' });
      setShowExpenditureForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create expenditure:', error);
      alert('Failed to create expenditure');
    }
  };

  const handleReturnAssignment = async (id) => {
    try {
      const response = await fetch(`/api/assignments/${id}/return`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to return assignment');

      fetchData();
    } catch (error) {
      console.error('Failed to return assignment:', error);
      alert('Failed to return assignment');
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Assignments & Expenditures</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'assignments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4" />
              <span>Assignments</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('expenditures')}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === 'expenditures'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Expenditures</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'assignments' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAssignmentForm(!showAssignmentForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Assignment</span>
            </button>
          </div>

          {showAssignmentForm && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Assign Asset to Personnel</h2>
              <form onSubmit={handleAssignmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                  <select
                    value={assignmentForm.assetId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, assetId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Asset</option>
                    {assets
                      .filter(a => a.status === 'AVAILABLE')
                      .map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} ({asset.type})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personnel Name</label>
                  <input
                    type="text"
                    value={assignmentForm.personnelName}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, personnelName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignmentForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Assign Asset
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personnel</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.asset?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {assignment.personnelName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(assignment.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assignment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {assignment.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleReturnAssignment(assignment.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Return</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No assignments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenditures' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowExpenditureForm(!showExpenditureForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Expenditure</span>
            </button>
          </div>

          {showExpenditureForm && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Record Expenditure</h2>
              <form onSubmit={handleExpenditureSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                  <select
                    value={expenditureForm.assetId}
                    onChange={(e) => setExpenditureForm({ ...expenditureForm, assetId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Asset</option>
                    {assets
                      .filter(a => a.type === 'AMMUNITION')
                      .map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Expended</label>
                  <input
                    type="number"
                    value={expenditureForm.quantityExpended}
                    onChange={(e) => setExpenditureForm({ ...expenditureForm, quantityExpended: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="1"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <input
                    type="text"
                    value={expenditureForm.reason}
                    onChange={(e) => setExpenditureForm({ ...expenditureForm, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowExpenditureForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Record Expenditure
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenditures.map((expenditure) => (
                  <tr key={expenditure.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.asset?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.quantityExpended}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(expenditure.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {expenditures.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No expenditures found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;

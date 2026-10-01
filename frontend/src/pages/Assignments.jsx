import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, RotateCcw, User, Zap } from 'lucide-react';
import API_URL from '../config/api';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none';
const labelClass = 'block text-sm font-medium text-gray-700 mb-2';
const thClass = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
const tdClass = 'px-6 py-4 whitespace-nowrap text-sm text-gray-900';

const emptyAssignment = { assetId: '', personnelName: '' };
const emptyExpenditure = { assetId: '', quantityExpended: '', reason: '' };

// Safely parse a response; avoids crashes when the server returns HTML or an empty body
const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const Assignments = () => {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [assets, setAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('assignments');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignmentError, setAssignmentError] = useState('');
  const [expenditureError, setExpenditureError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [returningId, setReturningId] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignment);
  const [expenditureForm, setExpenditureForm] = useState(emptyExpenditure);

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchData = useCallback(async () => {
    try {
      const responses = await Promise.all([
        fetch(`${API_URL}/api/assignments`, { headers: authHeaders }),
        fetch(`${API_URL}/api/expenditures`, { headers: authHeaders }),
        fetch(`${API_URL}/api/assets`, { headers: authHeaders }),
      ]);
      const [assignData, expendData, assetData] = await Promise.all(responses.map(parseJson));

      const failed = responses.find((r) => !r.ok);
      if (failed) {
        const failedData = [assignData, expendData, assetData][responses.indexOf(failed)];
        throw new Error(failedData.error || 'Failed to load data');
      }

      setAssignments(Array.isArray(assignData) ? assignData : []);
      setExpenditures(Array.isArray(expendData) ? expendData : []);
      setAssets(Array.isArray(assetData) ? assetData : []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    if (token) fetchData();
  }, [token, fetchData]);

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setAssignmentError('');
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        // FIX: was sending expenditureForm, which is why assignments failed
        body: JSON.stringify({
          ...assignmentForm,
          personnelName: assignmentForm.personnelName.trim(),
        }),
      });
      const data = await parseJson(response);
      if (!response.ok) throw new Error(data.error || 'Failed to create assignment');

      setAssignmentForm(emptyAssignment);
      setShowAssignmentForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create assignment:', err);
      setAssignmentError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExpenditureSubmit = async (e) => {
    e.preventDefault();
    setExpenditureError('');

    const quantityExpended = Number(expenditureForm.quantityExpended);
    if (!Number.isInteger(quantityExpended) || quantityExpended < 1) {
      setExpenditureError('Quantity must be a whole number of at least 1');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/expenditures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ ...expenditureForm, quantityExpended }),
      });
      const data = await parseJson(response);
      if (!response.ok) throw new Error(data.error || 'Failed to create expenditure');

      setExpenditureForm(emptyExpenditure);
      setShowExpenditureForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create expenditure:', err);
      setExpenditureError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnAssignment = async (id) => {
    if (returningId !== null) return;
    if (!window.confirm('Mark this asset as returned?')) return;

    setReturningId(id);
    try {
      const response = await fetch(`${API_URL}/api/assignments/${id}/return`, {
        method: 'PATCH',
        headers: authHeaders,
      });
      const data = await parseJson(response);
      if (!response.ok) throw new Error(data.error || 'Failed to return assignment');
      setError('');
    } catch (err) {
      console.error('Failed to return assignment:', err);
      setError(err.message);
    } finally {
      setReturningId(null);
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabClass = (tab) =>
    `flex-1 px-6 py-4 font-medium transition ${
      activeTab === tab
        ? 'border-b-2 border-blue-600 text-blue-600'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Assignments & Expenditures</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="flex border-b">
          <button onClick={() => setActiveTab('assignments')} className={tabClass('assignments')}>
            <div className="flex items-center justify-center space-x-2">
              <User className="w-4 h-4" />
              <span>Assignments</span>
            </div>
          </button>
          <button onClick={() => setActiveTab('expenditures')} className={tabClass('expenditures')}>
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
              onClick={() => {
                setAssignmentError('');
                setShowAssignmentForm(!showAssignmentForm);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Assignment</span>
            </button>
          </div>

          {showAssignmentForm && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Assign Asset to Personnel</h2>
              {assignmentError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {assignmentError}
                </div>
              )}
              <form onSubmit={handleAssignmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Asset</label>
                  <select
                    value={assignmentForm.assetId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, assetId: e.target.value })}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Asset</option>
                    {assets
                      .filter((a) => a.status === 'AVAILABLE')
                      .map((asset) => (
                        <option key={asset.id} value={String(asset.id)}>
                          {asset.name} ({asset.type})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Personnel Name</label>
                  <input
                    type="text"
                    value={assignmentForm.personnelName}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, personnelName: e.target.value })}
                    className={inputClass}
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
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Assigning...' : 'Assign Asset'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={thClass}>Asset</th>
                    <th className={thClass}>Personnel</th>
                    <th className={thClass}>Assigned Date</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className={tdClass}>{assignment.asset?.name}</td>
                      <td className={tdClass}>{assignment.personnelName}</td>
                      <td className={tdClass}>
                        {new Date(assignment.assignedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            assignment.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {assignment.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleReturnAssignment(assignment.id)}
                            disabled={returningId !== null}
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 disabled:opacity-40"
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
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No assignments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenditures' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setExpenditureError('');
                setShowExpenditureForm(!showExpenditureForm);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Expenditure</span>
            </button>
          </div>

          {showExpenditureForm && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Record Expenditure</h2>
              {expenditureError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {expenditureError}
                </div>
              )}
              <form onSubmit={handleExpenditureSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Asset</label>
                  <select
                    value={expenditureForm.assetId}
                    onChange={(e) => setExpenditureForm({ ...expenditureForm, assetId: e.target.value })}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Asset</option>
                    {assets
                      .filter((a) => a.type === 'AMMUNITION')
                      .map((asset) => (
                        <option key={asset.id} value={String(asset.id)}>
                          {asset.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Quantity Expended</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={expenditureForm.quantityExpended}
                    onChange={(e) => setExpenditureForm({ ...expenditureForm, quantityExpended: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Reason</label>
                  <input
                    type="text"
                    value={expenditureForm.reason}
                    onChange={(e) => setExpenditureForm({ ...expenditureForm, reason: e.target.value })}
                    className={inputClass}
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
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Recording...' : 'Record Expenditure'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className={thClass}>Asset</th>
                    <th className={thClass}>Quantity</th>
                    <th className={thClass}>Reason</th>
                    <th className={thClass}>Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenditures.map((expenditure) => (
                    <tr key={expenditure.id} className="hover:bg-gray-50">
                      <td className={tdClass}>{expenditure.asset?.name}</td>
                      <td className={tdClass}>{expenditure.quantityExpended}</td>
                      <td className={tdClass}>{expenditure.reason}</td>
                      <td className={tdClass}>
                        {new Date(expenditure.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {expenditures.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No expenditures found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;

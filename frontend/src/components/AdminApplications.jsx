import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminApplications() {
  const [list, setList] = useState([]);
  const [pageInfo, setPageInfo] = useState({ next: null, previous: null });
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ position: '', hub: '', status: '' });

  useEffect(() => { fetchList(); }, []);

  function fetchList(url) {
    const params = new URLSearchParams();
    if (filters.position) params.append('position', filters.position);
    if (filters.hub) params.append('hub', filters.hub);
    if (filters.status) params.append('status', filters.status);
    if (query) params.append('search', query);
    const fetchUrl = url || `admin/applications/?${params.toString()}`;
    api.get(fetchUrl).then((r) => {
      setList(r.data.results || r.data);
      setPageInfo({ next: r.data.next, previous: r.data.previous });
    }).catch(() => {});
  }

  function doAction(ref, action) {
    api.post(`admin/applications/${ref}/action/`, { action }).then((r) => {
      fetchList();
    }).catch((err) => alert('Action failed'));
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Applications</h2>
      <div className="mb-4 flex gap-2">
        <input placeholder="Search name or ref" value={query} onChange={(e) => setQuery(e.target.value)} className="border rounded p-2" />
        <button onClick={() => fetchList()} className="px-3 py-2 bg-blue-600 text-white rounded">Search</button>
        <button onClick={() => { setFilters({ position: '', hub: '', status: ''}); setQuery(''); fetchList(); }} className="px-3 py-2 bg-gray-100 rounded">Clear</button>
      </div>

      <div className="mb-4 flex gap-2">
        <select value={filters.position} onChange={(e) => setFilters({ ...filters, position: e.target.value })} className="border rounded p-2">
          <option value="">All Positions</option>
          <option>Courier</option>
          <option>Rider</option>
          <option>Warehouse Staff</option>
          <option>Dispatcher</option>
        </select>
        <input placeholder="Hub" value={filters.hub} onChange={(e) => setFilters({ ...filters, hub: e.target.value })} className="border rounded p-2" />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border rounded p-2">
          <option value="">All Statuses</option>
          <option>Pending</option>
          <option>Under Review</option>
          <option>Interview</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <button onClick={() => fetchList()} className="px-3 py-2 bg-blue-600 text-white rounded">Apply Filters</button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Applicant</th>
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-left">Hub</th>
              <th className="px-4 py-2 text-left">Employment Type</th>
              <th className="px-4 py-2 text-left">Date Applied</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.reference_number} className="border-t">
                <td className="px-4 py-2">{a.applicant_name}</td>
                <td className="px-4 py-2">{a.position}</td>
                <td className="px-4 py-2">{a.preferred_hub_name}</td>
                <td className="px-4 py-2">{a.employment_type}</td>
                <td className="px-4 py-2">{a.applied_at}</td>
                <td className="px-4 py-2">{a.status}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="px-2 py-1 bg-gray-100 rounded" onClick={() => window.location.href = `/admin/applications/${a.reference_number}`}>Open</button>
                  <button className="px-2 py-1 bg-green-100 rounded" onClick={() => doAction(a.reference_number, 'approve')}>Approve</button>
                  <button className="px-2 py-1 bg-yellow-100 rounded" onClick={() => doAction(a.reference_number, 'interview')}>Interview</button>
                  <button className="px-2 py-1 bg-red-100 rounded" onClick={() => doAction(a.reference_number, 'reject')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        {pageInfo.previous && <button onClick={() => fetchList(pageInfo.previous)} className="px-3 py-2 bg-gray-100 rounded">Previous</button>}
        {pageInfo.next && <button onClick={() => fetchList(pageInfo.next)} className="px-3 py-2 bg-gray-100 rounded">Next</button>}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function ApplicationSuccess() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  const [application, setApplication] = useState(null);

  useEffect(() => {
    if (!ref) return;
    api.get(`applications/${ref}/`).then((r) => setApplication(r.data)).catch(() => {});
  }, [ref]);

  if (!ref) return <div className="p-6">No reference found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-semibold">Application Submitted Successfully!</h1>
      <p className="mt-2">Reference Number: <strong>{ref}</strong></p>
      {application && (
        <div className="mt-4">
          <p><strong>Name:</strong> {application.applicant_name}</p>
          <p><strong>Position:</strong> {application.position}</p>
          <p><strong>Preferred Hub:</strong> {application.preferred_hub_name}</p>
          <p><strong>Application Date:</strong> {application.applied_at}</p>
          <p><strong>Status:</strong> {application.status}</p>
        </div>
      )}
      <div className="mt-6 flex gap-2">
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => window.location.href = `/applications/${ref}`}>View Application</button>
        <button className="px-3 py-2 bg-gray-100 rounded" onClick={() => window.print()}>Download Application Summary</button>
        <button className="px-3 py-2 bg-white border rounded" onClick={() => window.location.href = '/'}>Return to Home</button>
      </div>
    </div>
  );
}

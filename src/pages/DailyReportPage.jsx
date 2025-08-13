import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function DailyReportPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [reportText, setReportText] = useState('');
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const todayKey = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `daily-report-draft-${y}-${m}-${d}`;
  }, []);

  // Load draft from localStorage
  useEffect(() => {
    try {
      const draft = localStorage.getItem(todayKey);
      if (draft) setReportText(draft);
    } catch {
      // ignore
    }
  }, [todayKey]);

  // Persist draft
  useEffect(() => {
    try {
      if (!alreadySubmitted) {
        if (reportText.trim()) localStorage.setItem(todayKey, reportText);
        else localStorage.removeItem(todayKey);
      }
    } catch {
      // ignore
    }
  }, [reportText, alreadySubmitted, todayKey]);

  // Check if report is already submitted
  useEffect(() => {
    const checkReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/report/check`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          if (data.hasSubmittedReport) {
            setAlreadySubmitted(true);
            setReportText(data.report?.content || '');
          }
        } else if (res.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else {
          toast.error(data.message || 'Failed to check report status');
        }
      } catch (err) {
        console.error('Error checking report:', err);
        toast.error('Network error while checking report');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      checkReport();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async () => {
    const content = reportText.trim();
    if (!content) return toast.error('Report cannot be empty');

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/report/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Report submitted successfully');
        setAlreadySubmitted(true);
        try { localStorage.removeItem(todayKey); } catch {}
      } else if (res.status === 401) {
        toast.error('Unauthorized. Please log in.');
      } else {
        toast.error(data.message || 'Report submission failed');
      }
    } catch (err) {
      console.error('Submit report error:', err);
      toast.error('Network error during submission');
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !alreadySubmitted && !submitting) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (loading) return <p className="text-center mt-4">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">📝 Daily Report</h2>

      {!isAuthenticated && (
        <p className="mb-4 text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded">
          You are not logged in. Please authenticate to submit your report.
        </p>
      )}

      {alreadySubmitted ? (
        <>
          <p className="text-green-600 mb-2">✅ Report already submitted today.</p>
          <textarea
            className="w-full border p-3 rounded bg-gray-50"
            value={reportText}
            readOnly
            rows={6}
          />
          <div className="flex gap-2 mt-3">
            <button
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded border"
              onClick={() => {
                navigator.clipboard.writeText(reportText).then(() => toast.success('Copied to clipboard'));
              }}
            >
              Copy
            </button>
          </div>
        </>
      ) : (
        <>
          <textarea
            className="w-full border p-3 rounded"
            placeholder="Write your task summary for today..."
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={8}
          />
          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <span>{reportText.trim().length} characters</span>
            <span>Press Ctrl/Cmd + Enter to submit</span>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={handleSubmit}
              disabled={!isAuthenticated || submitting || !reportText.trim()}
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
            <button
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded border"
              onClick={() => setReportText('')}
              disabled={submitting}
            >
              Clear
            </button>
          </div>
        </>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  Users,
  Search,
  Filter,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import academicService from '../../services/academicService';
import teacherService from '../../services/teacherService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const AssignmentSubmissionTracker = ({ initialAssignmentId = null }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(initialAssignmentId || '');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [togglingStudentId, setTogglingStudentId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load assignments
  useEffect(() => {
    const loadAssignments = async () => {
      setLoadingList(true);
      try {
        const list = await teacherService.getAssignments();
        const arr = Array.isArray(list) ? list : [];
        setAssignments(arr);
        if (arr.length > 0 && !selectedAssignmentId) {
          setSelectedAssignmentId(String(arr[0].id));
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        setLoadingList(false);
      }
    };

    loadAssignments();
  }, []);

  // Load submissions for selected assignment
  useEffect(() => {
    const loadSubmissions = async () => {
      if (!selectedAssignmentId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await academicService.getAssignmentSubmissions(selectedAssignmentId);
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Could not load assignment submissions.');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [selectedAssignmentId]);

  const handleToggleSubmission = async (studentId, currentIsDone) => {
    setTogglingStudentId(studentId);
    try {
      const updated = await academicService.updateAssignmentSubmission(
        Number(selectedAssignmentId),
        studentId,
        { isDone: !currentIsDone }
      );

      setSubmissions((prev) =>
        prev.map((s) =>
          s.studentId === studentId
            ? { ...s, isDone: updated.isDone, status: updated.status }
            : s
        )
      );

      setSuccess(`Submission updated to ${updated.status}. Student notified.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error toggling submission status:', err);
      setError('Failed to update submission status.');
    } finally {
      setTogglingStudentId(null);
    }
  };

  const currentAssignment = assignments.find((a) => String(a.id) === String(selectedAssignmentId));
  const totalCount = submissions.length;
  const submittedCount = submissions.filter((s) => s.isDone).length;
  const pendingCount = totalCount - submittedCount;
  const submissionRate = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      (s.studentName && s.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (s.studentEmail && s.studentEmail.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (statusFilter === 'SUBMITTED') return s.isDone;
    if (statusFilter === 'PENDING') return !s.isDone;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          color: '#ffffff',
          padding: '1.75rem',
          borderRadius: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
            <span
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#34d399',
              }}
            >
              <FileCheck size={22} />
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Assignment Submission Tracker
            </h2>
          </div>
          <p style={{ margin: 0, color: '#a7f3d0', fontSize: '0.9rem', maxWidth: '600px' }}>
            Real-time coursework submission oversight. Monitor submission rates and verify assignment completion.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#a7f3d0', textTransform: 'uppercase' }}>Turnout Rate</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {submissionRate}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>
              {submittedCount} submitted / {totalCount} total
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#ecfdf5',
            color: '#065f46',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="card" style={{ color: '#ef4444', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Selector & Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>Select Coursework:</span>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#111827',
              minWidth: '240px',
            }}
          >
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (Due: {a.dueDate || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: '#6b7280' }} />
          {['ALL', 'SUBMITTED', 'PENDING'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: statusFilter === f ? '1px solid #064e3b' : '1px solid #e5e7eb',
                background: statusFilter === f ? '#064e3b' : '#ffffff',
                color: statusFilter === f ? '#ffffff' : '#4b5563',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Roster */}
      <div className="card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        {loading ? (
          <LoadingSpinner message="Loading student submissions..." />
        ) : filteredSubmissions.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
            <FileText size={40} style={{ margin: '0 auto 0.75rem', color: '#9ca3af' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#111827' }}>
              No Submissions Found
            </h4>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              No students matching current filter for this assignment.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Student</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Course</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => {
                const isToggling = togglingStudentId === sub.studentId;

                return (
                  <tr key={sub.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      {sub.studentName}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                      {sub.studentEmail}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                      {sub.courseCode || sub.courseName || 'Enrolled Course'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '4px',
                          background: sub.isDone ? '#ecfdf5' : '#fef3c7',
                          color: sub.isDone ? '#065f46' : '#92400e',
                        }}
                      >
                        {sub.status || (sub.isDone ? 'SUBMITTED' : 'PENDING')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleSubmission(sub.studentId, sub.isDone)}
                        disabled={isToggling}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: isToggling ? 'not-allowed' : 'pointer',
                          border: sub.isDone ? '1px solid #d1d5db' : '1px solid #10b981',
                          background: sub.isDone ? '#f9fafb' : '#10b981',
                          color: sub.isDone ? '#374151' : '#ffffff',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isToggling
                          ? 'Updating...'
                          : sub.isDone
                          ? 'Mark as Pending'
                          : 'Verify & Mark Done'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmissionTracker;

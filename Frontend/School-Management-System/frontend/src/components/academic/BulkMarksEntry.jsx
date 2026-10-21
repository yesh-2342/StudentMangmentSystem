import React, { useState, useEffect } from 'react';
import {
  Award,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  BookOpen,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';
import academicService from '../../services/academicService';
import teacherService from '../../services/teacherService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const BulkMarksEntry = ({ courses = [] }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');

  // Course selection default
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(String(courses[0].id));
    }
  }, [courses, selectedCourseId]);

  // Load students for chosen course
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourseId) return;
      setLoading(true);
      setError(null);
      try {
        const details = await teacherService.getCourseDetails(selectedCourseId);
        const stuList = details?.students || [];
        setStudents(
          stuList.map((s) => ({
            studentId: s.id,
            studentName: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || 'Student',
            email: s.email,
            gradeOne: s.gradeOne ?? s.grade1 ?? '',
            gradeTwo: s.gradeTwo ?? s.grade2 ?? '',
            gradeThree: s.gradeThree ?? s.grade3 ?? '',
          }))
        );
      } catch (err) {
        console.error('Error loading course students:', err);
        setError('Could not load enrolled students for this course.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCourseId]);

  const handleGradeChange = (studentId, field, value) => {
    const numVal = value === '' ? '' : Math.max(0, Math.min(100, Number(value) || 0));
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, [field]: numVal } : s))
    );
  };

  const handleSaveBulk = async () => {
    if (!selectedCourseId) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        courseId: Number(selectedCourseId),
        grades: students.map((s) => ({
          studentId: s.studentId,
          gradeOne: s.gradeOne === '' ? null : Number(s.gradeOne),
          gradeTwo: s.gradeTwo === '' ? null : Number(s.gradeTwo),
          gradeThree: s.gradeThree === '' ? null : Number(s.gradeThree),
        })),
      };

      const res = await academicService.saveBulkMarks(payload);
      setSuccess(`Successfully saved grades for ${res.updated || students.length} students! Progress alerts sent.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      console.error('Error saving bulk marks:', err);
      setError('Failed to record student grades.');
    } finally {
      setSaving(false);
    }
  };

  const handleFillAll = (field, defaultScore) => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, [field]: s[field] === '' ? defaultScore : s[field] }))
    );
  };

  const filteredStudents = students.filter(
    (s) =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
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
                color: '#f59e0b',
              }}
            >
              <Award size={22} />
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Bulk Marks &amp; Assessment Entry
            </h2>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', maxWidth: '600px' }}>
            Rapidly record Midterm (Grade 1), Coursework/Quizzes (Grade 2), and Final Exam (Grade 3) scores.
            Saving automatically generates student progress alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveBulk}
          disabled={saving || students.length === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save All Marks'}
        </button>
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

      {/* Control Bar: Course selector & Quick Autofill */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>Select Course:</span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#111827',
              minWidth: '220px',
            }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>Quick Fill Empty:</span>
          <button
            type="button"
            onClick={() => handleFillAll('gradeOne', 75)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            G1 = 75
          </button>
          <button
            type="button"
            onClick={() => handleFillAll('gradeTwo', 80)}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            G2 = 80
          </button>
        </div>
      </div>

      {/* Marks Table */}
      <div className="card" style={{ padding: '0.5rem', overflowX: 'auto' }}>
        {loading ? (
          <LoadingSpinner message="Loading course enrollment roster..." />
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
            <Users size={40} style={{ margin: '0 auto 0.75rem', color: '#9ca3af' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#111827' }}>
              No Students Enrolled
            </h4>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              No enrolled students found for this class section.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Grade 1 (Midterm)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Grade 2 (Coursework)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Grade 3 (Final)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Projected Average</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const g1 = Number(s.gradeOne) || 0;
                const g2 = Number(s.gradeTwo) || 0;
                const g3 = Number(s.gradeThree) || 0;
                const count = (s.gradeOne !== '' ? 1 : 0) + (s.gradeTwo !== '' ? 1 : 0) + (s.gradeThree !== '' ? 1 : 0);
                const avg = count > 0 ? Math.round((g1 + g2 + g3) / count) : '--';

                return (
                  <tr key={s.studentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                      {s.studentName}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                      {s.email}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.gradeOne}
                        onChange={(e) => handleGradeChange(s.studentId, 'gradeOne', e.target.value)}
                        placeholder="--"
                        style={{
                          width: '70px',
                          padding: '0.45rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.gradeTwo}
                        onChange={(e) => handleGradeChange(s.studentId, 'gradeTwo', e.target.value)}
                        placeholder="--"
                        style={{
                          width: '70px',
                          padding: '0.45rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={s.gradeThree}
                        onChange={(e) => handleGradeChange(s.studentId, 'gradeThree', e.target.value)}
                        placeholder="--"
                        style={{
                          width: '70px',
                          padding: '0.45rem',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          textAlign: 'center',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: avg === '--' ? '#94a3b8' : avg >= 75 ? '#10b981' : avg >= 60 ? '#f59e0b' : '#ef4444',
                        }}
                      >
                        {avg}{avg !== '--' ? '%' : ''}
                      </span>
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

export default BulkMarksEntry;

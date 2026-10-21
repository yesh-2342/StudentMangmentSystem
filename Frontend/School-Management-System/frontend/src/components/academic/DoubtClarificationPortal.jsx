import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  BookOpen,
  Filter,
  User,
  X,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import academicService from '../../services/academicService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const DoubtClarificationPortal = ({ courses = [] }) => {
  const { user } = useAuth();
  const role = user?.role?.replace('ROLE_', '').toUpperCase();

  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [replyingDoubt, setReplyingDoubt] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    courseId: '',
    title: '',
    question: '',
    priority: 'MEDIUM',
  });

  const loadDoubts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.getDoubts(selectedCourse || null);
      setDoubts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching doubts:', err);
      setError('Could not load academic doubts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoubts();
  }, [selectedCourse]);

  const handleAskDoubt = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.question.trim() || !form.courseId) return;
    setActionLoading(true);
    try {
      const created = await academicService.createDoubt({
        courseId: Number(form.courseId),
        title: form.title,
        question: form.question,
        priority: form.priority,
      });
      setDoubts((prev) => [created, ...prev]);
      setShowAskModal(false);
      setForm({
        courseId: '',
        title: '',
        question: '',
        priority: 'MEDIUM',
      });
      setSuccess('Doubt submitted to faculty successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating doubt:', err);
      setError('Failed to submit doubt.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplyDoubt = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingDoubt) return;
    setActionLoading(true);
    try {
      const updated = await academicService.replyDoubt(replyingDoubt.id, {
        answer: replyText,
      });
      setDoubts((prev) =>
        prev.map((d) => (d.id === replyingDoubt.id ? updated : d))
      );
      setReplyingDoubt(null);
      setReplyText('');
      setSuccess('Answer published and student notified.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error replying to doubt:', err);
      setError('Failed to submit clarification answer.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredDoubts = doubts.filter((d) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return d.status === 'PENDING';
    if (filter === 'RESOLVED') return d.status === 'RESOLVED';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #094067 0%, #172a45 100%)',
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
                color: '#72f1b8',
              }}
            >
              <HelpCircle size={22} />
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Doubt &amp; Clarification Requests
            </h2>
          </div>
          <p style={{ margin: 0, color: '#90b4ce', fontSize: '0.9rem', maxWidth: '600px' }}>
            {role === 'STUDENT'
              ? 'Ask course instructors direct academic questions, get verified pedagogical explanations, and track clarification statuses.'
              : 'Review and resolve academic questions asked by enrolled students. Answers are instantly delivered as progress alerts.'}
          </p>
        </div>

        {role === 'STUDENT' && (
          <button
            type="button"
            onClick={() => setShowAskModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              background: '#3da9fc',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(61, 169, 252, 0.3)',
            }}
          >
            <Plus size={18} />
            Ask Question
          </button>
        )}
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

      {/* Filter and Course Selector Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: '#6b7280' }} />
          {['ALL', 'PENDING', 'RESOLVED'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: filter === f ? '1px solid #094067' : '1px solid #e5e7eb',
                background: filter === f ? '#094067' : '#ffffff',
                color: filter === f ? '#ffffff' : '#4b5563',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {courses.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Filter Course:</span>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner message="Loading academic questions..." />}

      {/* Doubts List */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredDoubts.length === 0 ? (
            <div className="card" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#6b7280' }}>
              <HelpCircle size={40} style={{ margin: '0 auto 0.75rem', color: '#9ca3af' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#111827' }}>
                No Doubts Found
              </h4>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                {role === 'STUDENT'
                  ? 'Have a question about coursework or lectures? Click "Ask Question" to reach your professor.'
                  : 'No student questions matching this filter.'}
              </p>
            </div>
          ) : (
            filteredDoubts.map((doubt) => {
              const isResolved = doubt.status === 'RESOLVED';
              const isHigh = doubt.priority === 'HIGH';

              return (
                <div
                  key={doubt.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    borderLeft: isResolved ? '4px solid #10b981' : '4px solid #f59e0b',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: isResolved ? '#ecfdf5' : '#fef3c7',
                            color: isResolved ? '#065f46' : '#92400e',
                          }}
                        >
                          {doubt.status}
                        </span>

                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: '#f1f5f9',
                            color: '#334155',
                          }}
                        >
                          {doubt.courseCode || 'COURSE'}
                        </span>

                        {isHigh && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                            }}
                          >
                            HIGH PRIORITY
                          </span>
                        )}
                      </div>

                      <h3 style={{ margin: '0.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#111827' }}>
                        {doubt.title}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                        Asked by <strong>{doubt.studentName || 'Student'}</strong> on {doubt.createdAt?.split('T')[0] || 'Recent'}
                      </div>
                    </div>

                    {role !== 'STUDENT' && !isResolved && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setReplyingDoubt(doubt);
                          setReplyText('');
                        }}
                      >
                        Reply &amp; Resolve
                      </Button>
                    )}
                  </div>

                  <p style={{ margin: '0.85rem 0', fontSize: '0.9rem', color: '#374151', lineHeight: 1.5 }}>
                    {doubt.question}
                  </p>

                  {/* Teacher Reply Section */}
                  {isResolved && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                        <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                        Faculty Explanation from {doubt.teacherName || 'Instructor'}:
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                        {doubt.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Ask Doubt Modal (Student) */}
      {showAskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.5rem',
              background: '#ffffff',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                Ask Academic Question
              </h3>
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAskDoubt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Related Course *
                </label>
                <select
                  required
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Select Course...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Question Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dijkstra's Algorithm negative edge weights behavior"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Detailed Question Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain what concept or problem step you need clarification on..."
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button type="button" variant="ghost" onClick={() => setShowAskModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={actionLoading}>
                  Submit to Instructor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reply Modal (Teacher) */}
      {replyingDoubt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '1.5rem',
              background: '#ffffff',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#111827' }}>
                Resolve Student Doubt
              </h3>
              <button
                type="button"
                onClick={() => setReplyingDoubt(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
                Question from {replyingDoubt.studentName} ({replyingDoubt.courseCode}):
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{replyingDoubt.title}</div>
              <div style={{ fontSize: '0.85rem', color: '#334155' }}>{replyingDoubt.question}</div>
            </div>

            <form onSubmit={handleReplyDoubt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Faculty Explanation / Clarification *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide clear pedagogical guidance, reference textbook sections, or step-by-step resolution..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <Button type="button" variant="ghost" onClick={() => setReplyingDoubt(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={actionLoading}>
                  Publish Answer &amp; Notify Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubtClarificationPortal;

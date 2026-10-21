import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Target,
  Zap,
  Flame,
} from 'lucide-react';
import academicService from '../../services/academicService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const PersonalizedStudyPlanner = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const [targetHours, setTargetHours] = useState(18);

  const loadPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.getStudyPlan();
      setPlan(data);
      if (data?.totalWeeklyHours) setTargetHours(data.totalWeeklyHours);
    } catch (err) {
      console.error('Error loading study plan:', err);
      setError('Could not load personalized study plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const data = await academicService.generateStudyPlan({
        weeklyHours: targetHours,
        weekendIntensity: 'BALANCED',
      });
      setPlan(data);
    } catch (err) {
      console.error('Error generating study plan:', err);
      setError('Failed to regenerate adaptive study plan.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Generating your personalized study plan..." />;

  const allocations = plan?.weeklyAllocation || [];
  const schedule = plan?.scheduleByDay || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
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
                color: '#a5b4fc',
              }}
            >
              <Sparkles size={22} />
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Personalized Adaptive Study Planner
            </h2>
          </div>
          <p style={{ margin: 0, color: '#c7d2fe', fontSize: '0.9rem', maxWidth: '600px' }}>
            Algorithmically generated weekly study schedule tailored to your current grade shortfalls,
            upcoming assignment deadlines, and attendance recovery requirements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#c7d2fe', fontWeight: 600 }}>Weekly Hours:</label>
            <select
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              <option value="12" style={{ color: '#000' }}>12 hrs (Light)</option>
              <option value="18" style={{ color: '#000' }}>18 hrs (Standard)</option>
              <option value="24" style={{ color: '#000' }}>24 hrs (Intensive)</option>
              <option value="30" style={{ color: '#000' }}>30 hrs (Exam Prep)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={regenerating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: regenerating ? 'not-allowed' : 'pointer',
              fontSize: '0.88rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
            }}
          >
            <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
            {regenerating ? 'Optimizing...' : 'Regenerate Plan'}
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: '#ef4444', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Course Hour Allocations */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={18} style={{ color: '#4f46e5' }} />
          Targeted Subject Hour Allocations (Total: {plan?.totalWeeklyHours || targetHours} hrs/week)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {allocations.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: '#faf5ff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#312e81' }}>{item.courseCode}</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: item.priority === 'HIGH' ? '#fee2e2' : '#f3e8ff',
                      color: item.priority === 'HIGH' ? '#b91c1c' : '#6b21a8',
                    }}
                  >
                    {item.priority} FOCUS
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.75rem' }}>{item.courseName}</div>
              </div>

              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5', marginBottom: '0.25rem' }}>
                  {item.allocatedHours} hrs / week
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.reason}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day by Day Timetable Grid */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} style={{ color: '#4f46e5' }} />
          Adaptive Weekly Study Blocks
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {DAYS.map((day) => {
            const blocks = schedule[day] || [];
            return (
              <div
                key={day}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #f3f4f6',
                    paddingBottom: '0.5rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  {day}
                </div>

                {blocks.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic', padding: '0.5rem 0' }}>
                    Rest & Light Review
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {blocks.map((b, bIdx) => (
                      <div
                        key={bIdx}
                        style={{
                          padding: '0.5rem 0.65rem',
                          borderRadius: '6px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>{b.subject}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.duration} • {b.topic}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pomodoro & Advice Strategy */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Zap size={18} style={{ color: '#059669' }} />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#065f46' }}>
              Pomodoro Strategy
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857', lineHeight: 1.5 }}>
            {plan?.pomodoroStrategy || 'Standard 50 min deep study + 10 min break cycle. Target difficult problem sets in morning sessions.'}
          </p>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Flame size={18} style={{ color: '#2563eb' }} />
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e40af' }}>
              Academic Advisor Note
            </h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#1d4ed8', lineHeight: 1.5 }}>
            {plan?.advice || 'Consistent daily review of 2 hours yields 40% higher retention than marathon weekend cramming.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedStudyPlanner;

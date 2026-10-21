import React, { useState, useEffect } from 'react';
import {
  Calculator,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import academicService from '../../services/academicService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const PRESET_TARGETS = [75, 80, 85, 90];

const AttendanceRecoveryCalculator = ({ studentId = null }) => {
  const [target, setTarget] = useState(75);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateRecovery = async (targetPct) => {
    setLoading(true);
    setError(null);
    try {
      const res = await academicService.getAttendanceRecovery(targetPct, studentId);
      setData(res);
    } catch (err) {
      console.error('Error calculating recovery:', err);
      setError('Could not calculate attendance recovery metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRecovery(target);
  }, [target, studentId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '1.75rem',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#38bdf8',
            }}
          >
            <Calculator size={22} />
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
            Attendance Recovery Calculator
          </h2>
        </div>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', maxWidth: '640px' }}>
          Evaluate your exact attendance margin. Calculate the minimum consecutive lecture hours needed
          to reach institutional examination eligibility or find out how many classes you can safely miss.
        </p>

        {/* Target Selector */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
            Target Threshold:
          </span>
          {PRESET_TARGETS.map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => setTarget(pct)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: target === pct ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.2)',
                background: target === pct ? '#38bdf8' : 'transparent',
                color: target === pct ? '#0f172a' : '#ffffff',
                transition: 'all 0.15s ease',
              }}
            >
              {pct}% Minimum
            </button>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem' }}>
            <input
              type="number"
              min="50"
              max="100"
              value={target}
              onChange={(e) => setTarget(Math.min(100, Math.max(50, Number(e.target.value) || 75)))}
              style={{
                width: '65px',
                padding: '0.35rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>%</span>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner message="Calculating recovery mathematical model..." />}

      {error && (
        <div className="card" style={{ color: '#ef4444', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {data && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Current Rate Card */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Current Standing</span>
                <span
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: data.isSafe ? '#ecfdf5' : '#fef2f2',
                    color: data.isSafe ? '#065f46' : '#991b1b',
                  }}
                >
                  {data.isSafe ? 'ELIGIBLE' : 'SHORTFALL'}
                </span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: data.isSafe ? '#10b981' : '#ef4444' }}>
                {data.currentPercentage}%
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                Attended <strong>{data.attended}</strong> out of <strong>{data.total}</strong> total recorded sessions.
              </p>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>
                <span>Progress to {target}%</span>
                <span>{data.currentPercentage}%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, data.currentPercentage)}%`,
                    height: '100%',
                    background: data.isSafe ? '#10b981' : '#ef4444',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recovery Strategy Card */}
          <div
            className="card"
            style={{
              padding: '1.5rem',
              background: data.isSafe ? '#f0fdf4' : '#fffbeb',
              border: data.isSafe ? '1px solid #bbf7d0' : '1px solid #fde68a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {data.isSafe ? (
                <ShieldCheck size={20} style={{ color: '#16a34a' }} />
              ) : (
                <AlertTriangle size={20} style={{ color: '#d97706' }} />
              )}
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: data.isSafe ? '#166534' : '#92400e' }}>
                {data.isSafe ? 'Attendance Safety Buffer' : 'Consecutive Classes Needed'}
              </h3>
            </div>

            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: data.isSafe ? '#15803d' : '#b45309' }}>
              {data.isSafe ? `${data.canMiss} Classes` : `${data.consecutiveNeeded} Classes`}
            </div>

            <p style={{ fontSize: '0.88rem', color: data.isSafe ? '#166534' : '#92400e', marginTop: '0.5rem', lineHeight: 1.5 }}>
              {data.isSafe ? (
                <>
                  You have a safe margin of <strong>{data.canMiss}</strong> lectures you can miss while still maintaining at least <strong>{target}%</strong> attendance.
                </>
              ) : (
                <>
                  You must attend the next <strong>{data.consecutiveNeeded}</strong> consecutive sessions without absence to restore your attendance to <strong>{target}%</strong>.
                </>
              )}
            </p>

            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.82rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
            >
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#64748b' }} />
              <span>{data.recommendation}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceRecoveryCalculator;

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Award,
  CalendarCheck,
  FileCheck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import academicService from '../../services/academicService';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const TeacherClassHealthDashboard = () => {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await academicService.getClassHealth();
      setHealthData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching class health:', err);
      setError('Could not load class health metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  if (loading) return <LoadingSpinner message="Evaluating class health indicators..." />;

  const overallHealth = healthData.length > 0
    ? Math.round(healthData.reduce((acc, c) => acc + (c.healthScore || 0), 0) / healthData.length)
    : 0;

  const totalAtRisk = healthData.reduce((acc, c) => acc + (c.atRiskCount || 0), 0);
  const totalStudents = healthData.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
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
                color: '#38bdf8',
              }}
            >
              <Activity size={22} />
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              Teacher Class Health Dashboard
            </h2>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', maxWidth: '600px' }}>
            Multi-dimensional pedagogical health index evaluating grade distributions, session attendance,
            and coursework submission timeliness across your assigned classes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Faculty Cohort Health</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: overallHealth >= 75 ? '#34d399' : '#fbbf24' }}>
              {overallHealth} <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ color: '#ef4444', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Aggregate Stat Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
            <Users size={16} /> Enrolled Students
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
            {totalStudents}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Across {healthData.length} classes</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
            <ShieldAlert size={16} style={{ color: totalAtRisk > 0 ? '#ef4444' : '#10b981' }} />
            Students At Risk
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: totalAtRisk > 0 ? '#ef4444' : '#10b981', marginTop: '0.35rem' }}>
            {totalAtRisk}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Requiring active support</div>
        </div>
      </div>

      {/* Class Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {healthData.map((course) => {
          const isCritical = course.healthStatus === 'CRITICAL';
          const isNeedsAttn = course.healthStatus === 'NEEDS_ATTENTION';
          const isHealthy = course.healthStatus === 'HEALTHY';
          const isExcellent = course.healthStatus === 'EXCELLENT';

          const statusColor = isCritical ? '#ef4444' : isNeedsAttn ? '#f59e0b' : isHealthy ? '#3b82f6' : '#10b981';
          const statusBg = isCritical ? '#fee2e2' : isNeedsAttn ? '#fef3c7' : isHealthy ? '#dbeafe' : '#ecfdf5';

          return (
            <div
              key={course.courseId}
              className="card"
              style={{
                padding: '1.5rem',
                borderTop: `4px solid ${statusColor}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        background: '#f1f5f9',
                        color: '#334155',
                      }}
                    >
                      {course.courseCode}
                    </span>
                    <h3 style={{ margin: '0.35rem 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {course.courseName}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      background: statusBg,
                      color: statusColor,
                    }}
                  >
                    {course.healthStatus}
                  </span>
                </div>

                {/* Score Gauge */}
                <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: statusColor }}>
                    {course.healthScore}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>/ 100 Health Score</span>
                </div>

                {/* Sub-metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Grade Avg</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{course.averageGrade}%</div>
                  </div>
                  <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Attendance</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{course.attendanceRate}%</div>
                  </div>
                  <div style={{ padding: '0.65rem', background: '#f8fafc', borderRadius: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Submissions</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{course.submissionRate}%</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/teacher/attendance')}
                  style={{ flex: 1 }}
                >
                  Roll Call
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/teacher/bulk-marks')}
                  style={{ flex: 1 }}
                >
                  Enter Marks
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherClassHealthDashboard;

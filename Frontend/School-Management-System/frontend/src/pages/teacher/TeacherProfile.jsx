import React, { useEffect, useState } from 'react';
import { CalendarClock, MapPin, Pencil, UserRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await teacherService.getDashboard(user.id);
      setDashboard(data);
    } catch (err) {
      setError('Unable to load faculty profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading faculty profile..." />;
  if (error) return <ErrorState description={error} onRetry={fetchProfile} />;

  const displayName = [dashboard?.firstName || user?.firstName, dashboard?.lastName || user?.lastName]
    .filter(Boolean)
    .join(' ') || user?.username || 'Faculty Member';
  const courses = dashboard?.courses || [];

  return (
    <div style={{ maxWidth: 920 }}>
      <PageHeader
        title="Faculty Profile"
        subtitle="Faculty identity, assigned subjects, and availability information from the current academic records."
        actions={
          <button className="btn btn-secondary" type="button" disabled title="Profile updates need a persistence API">
            <Pencil size={16} /> Edit Profile
          </button>
        }
      />

      <div className="card" style={{ padding: '2rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div className="avatar" style={{ width: 76, height: 76, fontSize: '1.7rem' }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 220 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--heading-font)', fontSize: '1.65rem' }}>{displayName}</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)' }}>{dashboard?.email || user?.email}</p>
          </div>
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Available</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="insight-panel">
            <strong>Department</strong>
            <p style={{ margin: '0.35rem 0 0' }}>Academic Faculty</p>
          </div>
          <div className="insight-panel">
            <strong>Assigned Subjects</strong>
            <p style={{ margin: '0.35rem 0 0' }}>{courses.length} course{courses.length === 1 ? '' : 's'}</p>
          </div>
          <div className="insight-panel">
            <strong>Student Scope</strong>
            <p style={{ margin: '0.35rem 0 0' }}>{dashboard?.totalStudents || 0} enrolled students</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)', gap: '1rem' }}>
        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--heading-font)' }}>Assigned Subjects</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {courses.length ? courses.map((course) => (
              <span key={course.id} className="badge badge-info">
                {course.code ? `${course.code} - ` : ''}{course.name}
              </span>
            )) : (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No assigned courses are available in the current API response.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontFamily: 'var(--heading-font)' }}>Office Hours</h3>
          <p style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', margin: '0 0 0.75rem', color: 'var(--text-muted)' }}>
            <MapPin size={17} /> Office location requires a faculty profile API.
          </p>
          <p style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', margin: 0, color: 'var(--text-muted)' }}>
            <CalendarClock size={17} /> Office hours require availability persistence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;

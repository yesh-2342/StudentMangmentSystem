import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await studentService.getProfile(user.id);
      setProfile(data);
    } catch (err) {
      setError('Unable to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  if (loading) return <LoadingSpinner message="Loading your profile..." />;
  if (error) return <ErrorState description={error} onRetry={fetchProfile} />;

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="Student Profile"
        subtitle="Manage your personal student registration details and institution credentials."
      />

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
            {profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Student ID: #{profile?.id}
            </p>
          </div>
          <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
            Active Student
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Username</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>{profile?.userName}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>{profile?.email}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>First Name</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>{profile?.firstName}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Name</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>{profile?.lastName}</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Enrolled Courses</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>{profile?.courseCount} Courses</div>
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Access Role</label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>{profile?.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

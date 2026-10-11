import React, { useEffect, useState } from 'react';
import { CalendarClock, MapPin, Pencil, UserRound, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import teacherService from '../../services/teacherService';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Edit Profile Modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

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

  const handleOpenEdit = () => {
    setEditForm({
      firstName: dashboard?.firstName || user?.firstName || '',
      lastName: dashboard?.lastName || user?.lastName || '',
      email: dashboard?.email || user?.email || '',
    });
    setEditError(null);
    setEditOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      setEditError('All fields are required.');
      return;
    }
    setSaving(true);
    setEditError(null);
    try {
      await teacherService.updateProfile(user.id, editForm);
      setEditOpen(false);
      setSuccess('Faculty profile updated successfully.');
      setTimeout(() => setSuccess(null), 4000);
      fetchProfile();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

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
          <Button variant="secondary" onClick={handleOpenEdit}>
            <Pencil size={16} /> Edit Profile
          </Button>
        }
      />

      {success && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', background: '#fafafa', color: '#111111', border: '1px solid #111111', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <CheckCircle size={18} /> {success}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Update Faculty Profile">
        <form onSubmit={handleSaveProfile}>
          {editError && (
            <div style={{ padding: '0.65rem 0.85rem', borderRadius: '6px', background: '#f5f5f5', color: '#111111', border: '1px solid #111111', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {editError}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>First Name *</label>
              <input
                type="text"
                required
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Last Name *</label>
              <input
                type="text"
                required
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address *</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

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

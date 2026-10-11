import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, BookOpen, Pencil, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import studentService from '../../services/studentService';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
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

  const handleOpenEdit = () => {
    setEditForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
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
      await studentService.updateProfile(user.id, editForm);
      setEditOpen(false);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(null), 4000);
      fetchProfile();
    } catch (err) {
      setEditError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your profile..." />;
  if (error) return <ErrorState description={error} onRetry={fetchProfile} />;

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        title="Student Profile"
        subtitle="Manage your personal student registration details and institution credentials."
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
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Update Student Profile">
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

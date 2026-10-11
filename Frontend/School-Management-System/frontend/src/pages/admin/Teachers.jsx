import React, { useEffect, useState } from 'react';
import { Users, Plus, Edit2, Trash2, BookOpen, AlertCircle, CheckCircle, Search, Mail, Shield } from 'lucide-react';
import adminService from '../../services/adminService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Faculty Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [creating, setCreating] = useState(false);

  // Edit Faculty Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, teacherId: null, teacherName: '', courseCount: 0 });
  const [deleting, setDeleting] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getTeachers();
      setTeachers(data);
    } catch (err) {
      setError('Unable to load faculty members from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!createForm.username || !createForm.password || !createForm.firstName || !createForm.lastName || !createForm.email) {
      setActionError('Please complete all required fields for the new faculty account.');
      return;
    }
    setCreating(true);
    setActionError('');
    try {
      await adminService.createTeacher(createForm);
      setCreateModalOpen(false);
      setCreateForm({ username: '', password: '', firstName: '', lastName: '', email: '' });
      showSuccess('Faculty member registered successfully.');
      fetchTeachers();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to register faculty member.';
      setActionError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (teacher) => {
    setEditingTeacher(teacher);
    setEditForm({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setSavingEdit(true);
    setActionError('');
    try {
      await adminService.updateTeacher(editingTeacher.id, editForm);
      setEditModalOpen(false);
      setEditingTeacher(null);
      showSuccess('Faculty profile updated successfully.');
      fetchTeachers();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to update faculty profile.';
      setActionError(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deleteConfirm.teacherId) return;
    if (deleteConfirm.courseCount > 0) {
      setActionError(`Cannot delete ${deleteConfirm.teacherName}: Faculty is currently assigned to ${deleteConfirm.courseCount} courses. Reassign courses first.`);
      setDeleteConfirm({ open: false, teacherId: null, teacherName: '', courseCount: 0 });
      return;
    }

    setDeleting(true);
    setActionError('');
    try {
      await adminService.deleteTeacher(deleteConfirm.teacherId);
      setDeleteConfirm({ open: false, teacherId: null, teacherName: '', courseCount: 0 });
      showSuccess(`Faculty member ${deleteConfirm.teacherName} deleted successfully.`);
      fetchTeachers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete faculty member.';
      setActionError(msg);
    } finally {
      setDeleting(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    const username = (t.userName || '').toLowerCase();
    const email = (t.email || '').toLowerCase();
    return fullName.includes(query) || username.includes(query) || email.includes(query);
  });

  if (loading) return <LoadingSpinner message="Loading faculty directory..." />;
  if (error) return <ErrorState description={error} onRetry={fetchTeachers} />;

  const columns = [
    { header: 'ID', key: 'id', width: '70px' },
    {
      header: 'Faculty Name',
      key: 'firstName',
      render: (_, row) => (
        <div>
          <strong>{row.firstName} {row.lastName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor Account</div>
        </div>
      ),
    },
    {
      header: 'Username',
      key: 'userName',
      render: (val) => <span className="badge badge-gray">@{val}</span>,
    },
    { header: 'Official Email', key: 'email' },
    {
      header: 'Course Load',
      key: 'courseCount',
      render: (val) => (
        <span className={`badge ${val > 0 ? 'badge-info' : 'badge-gray'}`}>
          {val} Assigned Courses
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(row)}>
            <Edit2 size={14} /> Edit
          </Button>
          <button
            className="btn-icon"
            style={{ color: 'var(--error)' }}
            onClick={() => setDeleteConfirm({ open: true, teacherId: row.id, teacherName: `${row.firstName} ${row.lastName}`, courseCount: row.courseCount })}
            title="Delete Faculty"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Faculty & Teacher Management"
        subtitle="Supervise institutional academic instructors, teaching loads, and authorized course assignments."
        actions={
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} /> Register New Faculty
          </Button>
        }
      />

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--success-light)',
            color: 'var(--success)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            marginBottom: '1.25rem',
            border: '1px solid #86efac',
          }}
        >
          <CheckCircle size={18} flexShrink={0} />
          <span>{successMessage}</span>
        </div>
      )}

      {actionError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--error-light)',
            color: 'var(--error)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            marginBottom: '1.25rem',
            border: '1px solid #fecaca',
          }}
        >
          <AlertCircle size={18} flexShrink={0} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search faculty by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.9rem',
              background: 'transparent',
              color: 'var(--text-main)',
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredTeachers}
        keyField="id"
        emptyMessage="No faculty members found matching your search."
      />

      {/* Modal: Register New Faculty */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New Faculty Member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateFaculty} loading={creating}>
              Register Faculty
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateFaculty}>
          <Input
            id="facultyUsername"
            label="Faculty Username *"
            placeholder="e.g. dr.alan.turing"
            value={createForm.username}
            onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
            required
          />
          <Input
            id="facultyPassword"
            label="Initial Password *"
            type="password"
            placeholder="Strong password (min 6 characters)"
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              id="facultyFirstName"
              label="First Name *"
              placeholder="e.g. Alan"
              value={createForm.firstName}
              onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
              required
            />
            <Input
              id="facultyLastName"
              label="Last Name *"
              placeholder="e.g. Turing"
              value={createForm.lastName}
              onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            id="facultyEmail"
            label="Official Academic Email *"
            type="email"
            placeholder="e.g. alan.turing@university.edu"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            required
          />
        </form>
      </Modal>

      {/* Modal: Edit Faculty Profile */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Faculty Profile: ${editingTeacher?.firstName} ${editingTeacher?.lastName}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEdit} loading={savingEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              id="editFirstName"
              label="First Name *"
              value={editForm.firstName}
              onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              required
            />
            <Input
              id="editLastName"
              label="Last Name *"
              value={editForm.lastName}
              onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            id="editEmail"
            label="Official Academic Email *"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            required
          />
        </form>
      </Modal>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, teacherId: null, teacherName: '', courseCount: 0 })}
        onConfirm={handleDeleteTeacher}
        loading={deleting}
        title="Delete Faculty Member"
        message={`Are you sure you want to delete ${deleteConfirm.teacherName}? If this instructor has assigned courses, deletion will be safely blocked by the server.`}
      />
    </div>
  );
};

export default Teachers;

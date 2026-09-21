import React, { useEffect, useState } from 'react';
import { Users, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import adminService from '../../services/adminService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, teacherId: null, teacherName: '', courseCount: 0 });
  const [deleting, setDeleting] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getTeachers();
      setTeachers(data);
    } catch (err) {
      setError('Unable to load faculty members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleDeleteTeacher = async () => {
    if (!deleteConfirm.teacherId) return;
    if (deleteConfirm.courseCount > 0) {
      setActionError(`Cannot delete ${deleteConfirm.teacherName}: Faculty has ${deleteConfirm.courseCount} assigned courses. Reassign or delete these courses first.`);
      setDeleteConfirm({ open: false, teacherId: null, teacherName: '', courseCount: 0 });
      return;
    }

    setDeleting(true);
    setActionError('');
    try {
      await adminService.deleteTeacher(deleteConfirm.teacherId);
      setDeleteConfirm({ open: false, teacherId: null, teacherName: '', courseCount: 0 });
      fetchTeachers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete faculty member.';
      setActionError(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading faculty directory..." />;
  if (error) return <ErrorState description={error} onRetry={fetchTeachers} />;

  const columns = [
    { header: 'ID', key: 'id', width: '70px' },
    {
      header: 'Faculty Name',
      key: 'firstName',
      render: (_, row) => <strong>{row.firstName} {row.lastName}</strong>,
    },
    {
      header: 'Username',
      key: 'userName',
      render: (val) => <span className="badge badge-gray">{val}</span>,
    },
    { header: 'Email', key: 'email' },
    {
      header: 'Assigned Courses',
      key: 'courseCount',
      render: (val) => (
        <span className={`badge ${val > 0 ? 'badge-info' : 'badge-gray'}`}>
          {val} Courses
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <button
          className="btn-icon"
          style={{ color: 'var(--error)' }}
          onClick={() => setDeleteConfirm({ open: true, teacherId: row.id, teacherName: `${row.firstName} ${row.lastName}`, courseCount: row.courseCount })}
          title="Delete Faculty"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Faculty & Teacher Directory"
        subtitle="Manage academic instructors, their credentials, and course loads."
      />

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

      <DataTable
        columns={columns}
        data={teachers}
        keyField="id"
        emptyMessage="No faculty members found."
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, teacherId: null, teacherName: '', courseCount: 0 })}
        onConfirm={handleDeleteTeacher}
        loading={deleting}
        title="Delete Faculty Member"
        message={`Are you sure you want to delete ${deleteConfirm.teacherName}? If this instructor has assigned courses, deletion will be blocked.`}
      />
    </div>
  );
};

export default Teachers;

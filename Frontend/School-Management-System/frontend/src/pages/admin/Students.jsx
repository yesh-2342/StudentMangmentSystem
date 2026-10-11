import React, { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Trash2, BookOpen, Plus, X, Edit2, Search, CheckCircle, RefreshCw } from 'lucide-react';
import adminService from '../../services/adminService';
import PageHeader from '../../components/layout/PageHeader';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Register New Student Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    userName: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Edit Student Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [editErrors, setEditErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  // Manage courses modal
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCoursesData, setStudentCoursesData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [courseToEnroll, setCourseToEnroll] = useState('');

  // Delete confirm dialog
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, studentId: null, studentName: '' });
  const [deleting, setDeleting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Unable to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Create Student Handler
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!createForm.userName.trim()) errors.userName = 'Username is required.';
    if (!createForm.firstName.trim()) errors.firstName = 'First name is required.';
    if (!createForm.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!createForm.email.trim() || !createForm.email.includes('@')) errors.email = 'Valid email is required.';

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setCreating(true);
    setCreateErrors({});
    try {
      await adminService.createStudent(createForm);
      setCreateModalOpen(false);
      setCreateForm({ userName: '', password: '', firstName: '', lastName: '', email: '' });
      showSuccess('Student registered successfully.');
      fetchStudents();
    } catch (err) {
      setCreateErrors({ submit: err.response?.data?.error || err.message || 'Failed to register student.' });
    } finally {
      setCreating(false);
    }
  };

  // Edit Student Handler
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      setEditErrors({ submit: 'All fields are required.' });
      return;
    }

    setUpdating(true);
    setEditErrors({});
    try {
      await adminService.updateStudent(editingStudent.id, editForm);
      setEditModalOpen(false);
      showSuccess(`Student ${editForm.firstName} ${editForm.lastName} updated successfully.`);
      fetchStudents();
    } catch (err) {
      setEditErrors({ submit: err.response?.data?.error || err.message || 'Failed to update student.' });
    } finally {
      setUpdating(false);
    }
  };

  // Course Enrollment Handler
  const openCourseManager = async (student) => {
    setSelectedStudent(student);
    setCourseModalOpen(true);
    setModalLoading(true);
    try {
      const data = await adminService.getStudentCourses(student.id);
      setStudentCoursesData(data);
    } catch (err) {
      setStudentCoursesData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEnrollCourse = async () => {
    if (!courseToEnroll || !selectedStudent) return;
    try {
      await adminService.enrollStudent(selectedStudent.id, parseInt(courseToEnroll, 10));
      setCourseToEnroll('');
      const updated = await adminService.getStudentCourses(selectedStudent.id);
      setStudentCoursesData(updated);
      showSuccess('Student enrolled in course.');
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll student in course.');
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!selectedStudent) return;
    try {
      await adminService.removeStudentCourse(selectedStudent.id, courseId);
      const updated = await adminService.getStudentCourses(selectedStudent.id);
      setStudentCoursesData(updated);
      showSuccess('Student dropped from course.');
      fetchStudents();
    } catch (err) {
      alert('Failed to remove student from course.');
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteConfirm.studentId) return;
    setDeleting(true);
    try {
      await adminService.deleteStudent(deleteConfirm.studentId);
      setDeleteConfirm({ open: false, studentId: null, studentName: '' });
      showSuccess('Student deleted successfully.');
      fetchStudents();
    } catch (err) {
      alert('Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      `${s.firstName} ${s.lastName} ${s.userName} ${s.email} ${s.id}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const columns = [
    { header: 'ID', key: 'id', width: '70px', render: (val) => <span className="badge badge-gray">#{val}</span> },
    {
      header: 'Student Name',
      key: 'firstName',
      render: (_, row) => (
        <div>
          <strong>{row.firstName} {row.lastName}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{row.userName}</div>
        </div>
      ),
    },
    { header: 'Email Address', key: 'email' },
    {
      header: 'Enrolled Classes',
      key: 'courseCount',
      render: (val) => <span className="badge badge-info">{val} Courses</span>,
    },
    {
      header: 'Standing',
      key: 'riskStatus',
      render: (val, row) => (
        <span className={`badge ${row.isAtRisk ? 'badge-warning' : 'badge-success'}`}>
          {val || (row.isAtRisk ? 'At-Risk' : 'Good Standing')}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <Button variant="secondary" size="sm" onClick={() => openCourseManager(row)} title="Manage Enrolled Courses">
            <BookOpen size={14} /> Courses
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(row)} title="Edit Profile">
            <Edit2 size={14} /> Edit
          </Button>
          <button
            className="btn-icon"
            style={{ color: 'var(--error)' }}
            onClick={() => setDeleteConfirm({ open: true, studentId: row.id, studentName: `${row.firstName} ${row.lastName}` })}
            title="Delete Student"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading student directory..." />;
  if (error) return <ErrorState description={error} onRetry={fetchStudents} />;

  return (
    <div>
      <PageHeader
        title="Student Admissions & Enrolment Management"
        subtitle="Manage student registrations, profile updates, and institutional course enrollments."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus size={16} /> Register New Student
            </Button>
            <Button variant="secondary" size="sm" onClick={fetchStudents}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
        }
      />

      {successMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.25rem',
            borderRadius: '10px',
            background: 'var(--success-light, #dcfce7)',
            color: 'var(--success, #15803d)',
            marginBottom: '1.25rem',
            border: '1px solid #86efac',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search students by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.25rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--card-bg)',
                fontSize: '0.9rem',
              }}
            />
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing <strong>{filteredStudents.length}</strong> of {students.length} students
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        keyField="id"
        emptyMessage="No students match the search criteria."
      />

      {/* Modal: Register New Student */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register New Student"
        maxWidth={520}
      >
        <form onSubmit={handleCreateStudent}>
          {createErrors.submit && (
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {createErrors.submit}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Username *</label>
            <input
              type="text"
              placeholder="e.g. test.student31"
              value={createForm.userName}
              onChange={(e) => setCreateForm({ ...createForm, userName: e.target.value })}
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
            />
            {createErrors.userName && <span style={{ color: 'var(--error)', fontSize: '0.75rem' }}>{createErrors.userName}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>First Name *</label>
              <input
                type="text"
                placeholder="First name"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Last Name *</label>
              <input
                type="text"
                placeholder="Last name"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address *</label>
            <input
              type="email"
              placeholder="student@example.edu"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Temporary Password</label>
            <input
              type="text"
              placeholder="Defaults to Test@123"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={creating}>
              Create Student Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Student Profile */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Student Profile: ${editingStudent?.firstName} ${editingStudent?.lastName}`}
        maxWidth={500}
      >
        <form onSubmit={handleUpdateStudent}>
          {editErrors.submit && (
            <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {editErrors.submit}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>First Name *</label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Last Name *</label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address *</label>
            <input
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={updating}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Course Enrollment Manager */}
      <Modal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        title={`Course Enrollments: ${selectedStudent?.firstName} ${selectedStudent?.lastName}`}
        maxWidth={620}
        footer={
          <Button variant="secondary" onClick={() => setCourseModalOpen(false)}>
            Done
          </Button>
        }
      >
        {modalLoading ? (
          <LoadingSpinner message="Loading enrollment details..." />
        ) : (
          <div>
            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                Enroll in a New Course
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-select"
                  style={{ flex: 1 }}
                  value={courseToEnroll}
                  onChange={(e) => setCourseToEnroll(e.target.value)}
                >
                  <option value="">Select available course...</option>
                  {studentCoursesData?.availableCourses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} ({c.teacherName})
                    </option>
                  ))}
                </select>
                <Button variant="primary" onClick={handleEnrollCourse} disabled={!courseToEnroll}>
                  <Plus size={16} /> Enroll
                </Button>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Currently Enrolled Courses ({studentCoursesData?.enrolledCourses?.length || 0})
            </h4>

            {studentCoursesData?.enrolledCourses && studentCoursesData.enrolledCourses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {studentCoursesData.enrolledCourses.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <span className="badge badge-info" style={{ marginRight: '0.5rem' }}>{c.code}</span>
                      <strong style={{ fontSize: '0.9rem' }}>{c.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instructor: {c.teacherName}</div>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveCourse(c.id)}>
                      Drop Course
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Student is not enrolled in any courses.</p>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Student Deletion */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, studentId: null, studentName: '' })}
        onConfirm={handleDeleteStudent}
        loading={deleting}
        title="Delete Student"
        message={`Are you sure you want to delete ${deleteConfirm.studentName}? This will permanently remove their enrollment records, grades, and submissions.`}
      />
    </div>
  );
};

export default Students;
